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

  private async updateConditions(): Promise<void> {
    try {
      const conditions = await this.getCurrentConditions();
      this.conditions = {
        ...this.conditions,
        temperature: conditions.temperature,
        humidity: conditions.humidity,
        pressure: conditions.pressure,
        windSpeed: conditions.windSpeed,
        windDirection: conditions.windDirection,
        density: conditions.density
      };
      
      this.lastUpdate = Date.now();
      this.notifySubscribers();
    } catch (error) {
      console.error('Failed to update conditions:', error);
      // Keep using previous conditions if API fails
    }
  }

  public startMonitoring(): void {
    if (!this.updateInterval) {
      this.updateInterval = setInterval(async () => {
        try {
          await this.updateConditions();
        } catch (error) {
          console.error('Error in monitoring interval:', error);
        }
      }, 1000 * 60 * 5); // Update every 5 minutes to avoid excessive API calls
      this.updateConditions(); // Initial update
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
    const apiKey = process.env.NEXT_PUBLIC_TOMORROW_API_KEY;
    if (!apiKey) {
      throw new Error('Tomorrow.io API key not configured. Please set NEXT_PUBLIC_TOMORROW_API_KEY in .env');
    }

    // Get user's location
    let location = { lat: 42.36, lng: -71.06 }; // Default to Boston
    let locationSource = 'default';
    let ipData: any;
    
    try {
      console.log('Attempting to get precise location via Geolocation API...');
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
            timeout: 10000, // Increased timeout to 10 seconds
            maximumAge: 300000 // Cache for 5 minutes
          }
        );
      });
      location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      locationSource = 'geolocation';
      console.log('Successfully got precise location:', location);
    } catch (error) {
      console.warn('Failed to get precise location:', error);
      
      // Try to get location from IP as fallback
      try {
        console.log('Attempting to get location from IP address...');
        // Try multiple IP geolocation services in case one fails
        const services = [
          {
            url: 'https://ipinfo.io/json?token=8b89ef2959c1de5c835ac05cb77ced7f',
            transform: (data: any) => ({
              lat: parseFloat(data.loc.split(',')[0]),
              lng: parseFloat(data.loc.split(',')[1]),
              city: data.city,
              region: data.region
            })
          },
          {
            url: 'https://ipapi.co/json',
            transform: (data: any) => ({
              lat: data.latitude,
              lng: data.longitude,
              city: data.city,
              region: data.region
            })
          }
        ];

        for (const service of services) {
          try {
            const response = await fetch(service.url);
            if (!response.ok) continue;
            
            ipData = await response.json();
            const transformed = service.transform(ipData);
            
            if (transformed.lat && transformed.lng) {
              location = { lat: transformed.lat, lng: transformed.lng };
              locationSource = 'ip';
              console.log('Successfully got location from IP:', location);
              console.log('City:', transformed.city, 'Region:', transformed.region);
              break;
            }
          } catch (serviceError) {
            console.warn(`Failed to get location from ${service.url}:`, serviceError);
            continue;
          }
        }

        if (locationSource === 'default') {
          throw new Error('All IP geolocation services failed');
        }
      } catch (ipError) {
        console.warn('Failed to get location from IP, using default:', ipError);
        locationSource = 'default';
      }
    }
    
    console.group('Location Detection');
    console.log(`Source: ${locationSource}`);
    console.log('Coordinates:', location);
    if (locationSource === 'ip' && ipData) {
      console.log('City:', ipData.city, 'Region:', ipData.region);
    }
    console.groupEnd();
    console.log('Fetching weather for coordinates:', location);

    const url = `https://api.tomorrow.io/v4/weather/realtime?location=${location.lat},${location.lng}&fields=temperature,humidity,windSpeed,windDirection,pressure&apikey=${apiKey}`;

    // Cache weather data for 5 minutes to avoid excessive API calls
    const cacheKey = `weather-${location.lat}-${location.lng}`;
    const cachedData = localStorage.getItem(cacheKey);
    
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
      const current = data?.data?.values;
      if (!current) {
        throw new Error('Invalid weather data received');
      }

      // Cache the successful response
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: current
      }));

      console.log('Received weather data:', current);
      const transformed = this.transformWeatherData(current);
      console.log('Transformed weather data:', transformed);
      return transformed;
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
    const pressure = data.pressure || 1013.25; // Default to standard pressure if missing
    const temperature = data.temperature;
    const humidity = data.humidity;
    
    return {
      temperature: temperature,
      humidity: humidity,
      altitude: this.conditions.altitude,
      windSpeed: data.windSpeed,
      windDirection: data.windDirection,
      pressure: pressure,
      density: EnvironmentalCalculator.calculateAirDensity({
        temperature: temperature,
        humidity: humidity,
        pressure: pressure,
        altitude: this.conditions.altitude,
        windSpeed: data.windSpeed,
        windDirection: data.windDirection
      })
    };
  }
}

export const environmentalService = EnvironmentalService.getInstance()
