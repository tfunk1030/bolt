'use client'

import { EnvironmentalConditions, EnvironmentalCalculator } from './environmental-calculations'

interface SubscriberCallback {
  (conditions: EnvironmentalConditions): void
}

export class EnvironmentalService {
  private static instance: EnvironmentalService
  private conditions: EnvironmentalConditions
  private subscribers: Set<(conditions: EnvironmentalConditions) => void>
  private updateInterval: NodeJS.Timeout | null
  private baseAltitude: number // Base altitude that stays constant
  private lastUpdate: number // Last update timestamp

  private constructor() {
    // Generate a stable random base altitude using a fixed seed
    this.baseAltitude = 100 + Math.floor(Math.random() * 1000)
    this.conditions = {
      temperature: 70, // °F
      humidity: 60,
      pressure: 1013.25,
      altitude: this.baseAltitude,
      windSpeed: 5,
      windDirection: 0,
      density: 1.225
    }
    this.subscribers = new Set()
    this.updateInterval = null
    this.lastUpdate = Date.now()
  }

  public static getInstance(): EnvironmentalService {
    if (!EnvironmentalService.instance) {
      EnvironmentalService.instance = new EnvironmentalService()
    }
    return EnvironmentalService.instance
  }

  public subscribe(callback: SubscriberCallback): () => void {
    this.subscribers.add(callback)
    callback(this.conditions)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback(this.conditions))
  }

  private updateConditions(): void {
    const now = Date.now()
    const timeScale = now / (24 * 60 * 60 * 1000) // Scale to one day

    // Update conditions with some natural variation
    this.conditions = {
      ...this.conditions,
      temperature: 70 + Math.sin(timeScale * Math.PI * 2) * 10, // Vary between 60-80°F
      humidity: 60 + Math.sin(timeScale * Math.PI * 2 + 1) * 20, // Vary between 40-80%
      altitude: this.baseAltitude + Math.sin(timeScale * Math.PI * 2 + 2) * 10, // Small variations
      pressure: 1013.25 + Math.sin(timeScale * Math.PI * 2 + 3) * 10, // Vary around standard
      windSpeed: Math.abs(Math.sin(timeScale * Math.PI * 2 + 4) * 15), // Vary between 0-15 mph
      windDirection: (Math.sin(timeScale * Math.PI * 2 + 5) * 180 + 180) % 360, // Vary between 0-360 degrees
      density: 0 // Will be calculated below
    }

    // Calculate air density
    this.conditions.density = EnvironmentalCalculator.calculateAirDensity(this.conditions)

    this.lastUpdate = now
    this.notifySubscribers()
  }

  public startMonitoring(): void {
    if (!this.updateInterval) {
      this.updateInterval = setInterval(() => this.updateConditions(), 1000)
      this.updateConditions() // Initial update
    }
  }

  public stopMonitoring(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  public getConditions(): EnvironmentalConditions {
    return { ...this.conditions }
  }

  public calculateWindEffect(
    shotDirection: number
  ): { headwind: number; crosswind: number } {
    return EnvironmentalCalculator.calculateWindEffect(
      this.conditions.windSpeed,
      this.conditions.windDirection,
      shotDirection
    )
  }

  public calculateAltitudeEffect(): number {
    return EnvironmentalCalculator.calculateAltitudeEffect(this.conditions.altitude)
  }

  async getCurrentConditions(): Promise<EnvironmentalConditions> {
    const apiKey = process.env.TOMORROW_API_KEY;
    if (!apiKey) {
      throw new Error('Tomorrow.io API key not configured');
    }

    // Get user's location
    let location = { lat: 42.36, lng: -71.06 }; // Default to Boston
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }
        
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            // Handle different error cases
            switch (error.code) {
              case error.PERMISSION_DENIED:
                reject(new Error('User denied geolocation permission'));
                break;
              case error.POSITION_UNAVAILABLE:
                reject(new Error('Location information is unavailable'));
                break;
              case error.TIMEOUT:
                reject(new Error('The request to get user location timed out'));
                break;
              default:
                reject(new Error('An unknown error occurred'));
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      });
      location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (error) {
      console.warn('Failed to get user location, using default:', error);
      // Try to get location from IP as fallback
      try {
        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();
        location = { lat: ipData.latitude, lng: ipData.longitude };
      } catch (ipError) {
        console.warn('Failed to get location from IP, using default:', ipError);
      }
    }

    const url = `https://api.tomorrow.io/v4/timelines?location=${location.lat},${location.lng}&fields=temperature,humidity,windSpeed,windDirection,pressure&timesteps=current&units=imperial&apikey=${apiKey}`;

    // Cache weather data for 5 minutes to avoid excessive API calls
    const cacheKey = `weather-${location.lat}-${location.lng}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { timestamp, data } = JSON.parse(cachedData);
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return this.transformWeatherData(data);
      }
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      const current = data?.data?.timelines[0]?.intervals[0]?.values;
      if (!current) {
        throw new Error('Invalid weather data received');
      }

      // Cache the successful response
      sessionStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: current
      }));

      return this.transformWeatherData(current);
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      
      // If we have cached data, use it even if it's stale
      if (cachedData) {
        const { data } = JSON.parse(cachedData);
        console.warn('Using cached weather data due to API error');
        return this.transformWeatherData(data);
      }
      
      throw error;
    }
  }

  private transformWeatherData(data: any): EnvironmentalConditions {
    return {
      temperature: data.temperature,
      humidity: data.humidity,
      altitude: this.conditions.altitude,
      windSpeed: data.windSpeed,
      windDirection: data.windDirection,
      pressure: data.pressure,
      density: EnvironmentalCalculator.calculateAirDensity({
        temperature: data.temperature,
        humidity: data.humidity,
        pressure: data.pressure,
        altitude: this.conditions.altitude,
        windSpeed: data.windSpeed,
        windDirection: data.windDirection,
        density: 1.225
      }),
      weatherCode: data.weatherCode,
      precipitationProbability: data.precipitationProbability,
      cloudCover: data.cloudCover
    };
  }
}

export const environmentalService = EnvironmentalService.getInstance()
