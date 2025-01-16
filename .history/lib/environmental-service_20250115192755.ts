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

    // Try to get cached location first
    try {
      const cachedLocation = localStorage.getItem('user-location');
      if (cachedLocation) {
        const { timestamp, data, source } = JSON.parse(cachedLocation);
        // Use cache if less than 30 minutes old
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          location = data;
          locationSource = source;
          console.log('Using cached location:', location);
          console.log('Cache age:', Math.round((Date.now() - timestamp) / 1000 / 60), 'minutes');
        }
      }
    } catch (error) {
      console.warn('Failed to read cached location:', error);
    }

    // Only try to get new location if we don't have a recent cached one
    if (locationSource === 'default') {
      try {
        console.log('Attempting to get precise location via Geolocation API...');
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
          }
          
          // First try with high accuracy
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('Got high accuracy position:', position);
              resolve(position);
            },
            (error) => {
              console.warn('High accuracy position failed:', error);
              // If high accuracy fails, try with lower accuracy
              navigator.geolocation.getCurrentPosition(
                resolve,
                reject,
                {
                  enableHighAccuracy: false,
                  timeout: 10000,
                  maximumAge: 300000
                }
              );
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000
            }
          );
        });

        // Validate coordinates are reasonable
        if (pos.coords.latitude >= -90 && pos.coords.latitude <= 90 &&
            pos.coords.longitude >= -180 && pos.coords.longitude <= 180 &&
            pos.coords.accuracy < 10000) { // Accuracy better than 10km
          location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          locationSource = 'geolocation';
          console.log('Successfully got precise location:', location);
          console.log('Accuracy:', pos.coords.accuracy, 'meters');
          
          // Get city name for GPS coordinates
          try {
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode?latitude=${location.lat}&longitude=${location.lng}&localityLanguage=en&key=bdc_1234567890`);
            if (response.ok) {
              const geocodeData = await response.json();
              console.log('Location details:', {
                city: geocodeData.city,
                locality: geocodeData.locality,
                county: geocodeData.localityInfo?.administrative?.[2]?.name,
                state: geocodeData.principalSubdivision,
                country: geocodeData.countryName
              });
            }
          } catch (geocodeError) {
            console.warn('Failed to get city name:', geocodeError);
          }
          
          // Cache the successful location
          localStorage.setItem('user-location', JSON.stringify({
            timestamp: Date.now(),
            data: location,
            source: locationSource,
            accuracy: pos.coords.accuracy
          }));
        } else {
          throw new Error(`Invalid or inaccurate coordinates: ${JSON.stringify(pos.coords)}`);
        }
      } catch (error) {
        console.warn('Failed to get precise location:', error);
        
        // Try to get location from IP as fallback
        try {
          console.log('Attempting to get location from IP address...');
          // Try multiple IP geolocation services in case one fails
          const services = [
            {
              url: 'https://api.bigdatacloud.net/data/reverse-geocode-client',
              transform: (data: any) => ({
                lat: data.latitude,
                lng: data.longitude,
                city: data.city,
                region: data.principalSubdivision,
                accuracy: data.accuracyRadius
              })
            },
            {
              url: 'https://ipapi.co/json',
              transform: (data: any) => ({
                lat: data.latitude,
                lng: data.longitude,
                city: data.city,
                region: data.region,
                accuracy: 25000 // Typical IP geolocation accuracy in meters
              })
            },
            {
              url: 'https://ipinfo.io/json?token=8b89ef2959c1de5c835ac05cb77ced7f',
              transform: (data: any) => ({
                lat: parseFloat(data.loc.split(',')[0]),
                lng: parseFloat(data.loc.split(',')[1]),
                city: data.city,
                region: data.region,
                accuracy: 25000
              })
            }
          ];

          let bestLocation = null;
          let bestAccuracy = Infinity;

          for (const service of services) {
            try {
              console.log(`Trying ${service.url}...`);
              const response = await fetch(service.url);
              if (!response.ok) {
                console.warn(`Service ${service.url} returned ${response.status}`);
                continue;
              }
              
              ipData = await response.json();
              console.log(`Response from ${service.url}:`, ipData);
              
              const transformed = service.transform(ipData);
              
              // Validate coordinates
              if (transformed.lat >= -90 && transformed.lat <= 90 &&
                  transformed.lng >= -180 && transformed.lng <= 180) {
                // Keep track of the most accurate result
                if (transformed.accuracy < bestAccuracy) {
                  bestLocation = transformed;
                  bestAccuracy = transformed.accuracy;
                }
              } else {
                console.warn(`Invalid coordinates from ${service.url}:`, transformed);
              }
            } catch (serviceError) {
              console.warn(`Failed to get location from ${service.url}:`, serviceError);
              continue;
            }
          }

          if (bestLocation) {
            location = { lat: bestLocation.lat, lng: bestLocation.lng };
            locationSource = 'ip';
            console.log('Using most accurate IP location:', location);
            console.log('Accuracy:', bestAccuracy, 'meters');
            console.log('City:', bestLocation.city, 'Region:', bestLocation.region);
          } else {
            throw new Error('No valid location from any IP service');
          }
        } catch (ipError) {
          console.warn('Failed to get location from IP, using default:', ipError);
          locationSource = 'default';
        }
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

    const url = `https://api.tomorrow.io/v4/weather/realtime?location=${location.lat},${location.lng}&fields=temperature,humidity,windSpeed,windDirection,pressure&units=imperial&apikey=${apiKey}`;

    // Cache weather data for 5 minutes to avoid excessive API calls
    const cacheKey = `weather-${location.lat}-${location.lng}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { timestamp, data } = JSON.parse(cachedData);
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        console.log('Using cached weather data:', data);
        return this.transformWeatherData(data);
      }
    }

    try {
      console.log('Fetching fresh weather data from Tomorrow.io...');
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw weather response:', data);
      
      const values = data?.data?.values;
      if (!values) {
        throw new Error('Invalid weather data received');
      }

      // Validate weather data
      if (typeof values.temperature !== 'number' || 
          values.temperature < -100 || 
          values.temperature > 150) {
        throw new Error(`Invalid temperature value: ${values.temperature}°F`);
      }

      if (typeof values.humidity !== 'number' || 
          values.humidity < 0 || 
          values.humidity > 100) {
        throw new Error(`Invalid humidity value: ${values.humidity}%`);
      }

      if (typeof values.pressure !== 'number' || 
          values.pressure < 800 || 
          values.pressure > 1200) {
        throw new Error(`Invalid pressure value: ${values.pressure} mb`);
      }

      // Cache the successful response
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: values
      }));

      console.group('Weather Data');
      console.log('Temperature:', values.temperature, '°F');
      console.log('Humidity:', values.humidity, '%');
      console.log('Pressure:', values.pressure, 'mb');
      console.log('Wind Speed:', values.windSpeed, 'mph');
      console.log('Wind Direction:', values.windDirection, '°');
      console.groupEnd();

      const transformed = this.transformWeatherData(values);
      console.log('Transformed weather data:', transformed);
      return transformed;
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      
      // If we have cached data, use it even if it's stale
      if (cachedData) {
        const { data } = JSON.parse(cachedData);
        console.warn('Using stale cached weather data due to API error');
        return this.transformWeatherData(data);
      }
      
      // If all else fails, return reasonable defaults for Jacksonville, FL
      console.warn('Using default weather data');
      return {
        temperature: 75, // °F
        humidity: 70, // %
        pressure: 1013.25, // mb (standard sea level pressure)
        altitude: 10, // ft (Jacksonville is near sea level)
        windSpeed: 8, // mph (typical coastal breeze)
        windDirection: 90, // ° (typical easterly wind from Atlantic)
        density: this.calculateAirDensity({
          temperature: 75,
          humidity: 70,
          pressure: 1013.25,
          altitude: 10,
          windSpeed: 8,
          windDirection: 90
        })
      };
    }
  }

  private calculateAirDensity(conditions: EnvironmentalConditions): number {
    // Convert units for density calculation
    const tempC = (conditions.temperature - 32) * 5/9; // °F to °C
    const pressurePA = conditions.pressure * 100; // mb to Pa
    
    // Calculate saturation vapor pressure using Magnus formula
    const a = 6.1121; // mb
    const b = 17.368;
    const c = 238.88; // °C
    const svp = a * Math.exp((b * tempC) / (c + tempC));
    
    // Calculate actual vapor pressure
    const vp = svp * (conditions.humidity / 100);
    
    // Gas constants
    const Rd = 287.058; // J/(kg·K) - Specific gas constant for dry air
    const Rv = 461.495; // J/(kg·K) - Specific gas constant for water vapor
    
    // Convert temperature to Kelvin
    const tempK = tempC + 273.15;
    
    // Calculate air density using the enhanced equation that accounts for humidity
    const density = (pressurePA - (vp * 100)) / (Rd * tempK) + (vp * 100) / (Rv * tempK);
    
    return Math.round(density * 1000) / 1000; // Round to 3 decimal places
  }

  private transformWeatherData(data: any): EnvironmentalConditions {
    // Ensure we're working with numbers
    const temperature = Number(data.temperature);
    const humidity = Number(data.humidity);
    const pressure = Number(data.pressure);
    const windSpeed = Number(data.windSpeed);
    const windDirection = Number(data.windDirection);
    
    // Get altitude from geolocation or default to sea level for Jacksonville
    const altitude = 10; // Jacksonville is near sea level
    
    // Calculate density first
    const density = this.calculateAirDensity({
      temperature,
      humidity,
      pressure,
      altitude,
      windSpeed,
      windDirection,
      density: 0 // Temporary value, not used in calculation
    });
    
    // Return the complete conditions object
    return {
      temperature,
      humidity,
      pressure,
      altitude,
      windSpeed,
      windDirection,
      density
    };
  }
}

export const environmentalService = EnvironmentalService.getInstance()
