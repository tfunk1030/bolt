'use client'

import { EnvironmentalConditions, EnvironmentalCalculator, Location } from './environmental-calculations'

interface SubscriberCallback {
  (conditions: EnvironmentalConditions): void
}

export class EnvironmentalService {
  private static instance: EnvironmentalService
  private conditions: EnvironmentalConditions
  private subscribers: Set<(conditions: EnvironmentalConditions) => void>
  private updateInterval: NodeJS.Timeout | null
  private lastUpdate: number // Last update timestamp

  private constructor() {
    this.conditions = {
      temperature: 70, // °F
      humidity: 60,
      pressure: 1013.25,
      altitude: 0, // Initialize to sea level, will be updated with actual elevation
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
        ...conditions // Use all conditions from API including altitude
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
    let location: Location = { lat: 42.36, lng: -71.06 }; // Default to Boston
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
          
          // Get elevation data
          try {
            console.log('Fetching elevation data...');
            const elevationResponse = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${location.lat}&longitude=${location.lng}`);
            if (elevationResponse.ok) {
              const elevationData = await elevationResponse.json();
              console.log('Elevation API response:', elevationData);
              
              // The elevation is in an array format
              if (Array.isArray(elevationData?.elevation) && typeof elevationData.elevation[0] === 'number') {
                const elevation = elevationData.elevation[0];
                console.log('Elevation:', elevation, 'meters');
                // Convert meters to feet and store in location data
                const elevationFeet = Math.round(elevation * 3.28084);
                location = { ...location, elevation: elevationFeet };
                console.log('Elevation (ft):', elevationFeet);
              } else {
                throw new Error('Invalid elevation data format');
              }
            } else {
              throw new Error(`Elevation API returned ${elevationResponse.status}`);
            }
          } catch (elevationError) {
            console.warn('Failed to get elevation data:', elevationError);
            // Don't set any default elevation - let it be determined by the weather API
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
      try {
        const { timestamp, data } = JSON.parse(cachedData);
        // Validate cached data
        if (Date.now() - timestamp < 5 * 60 * 1000 && 
            typeof data.temperature === 'number' &&
            data.temperature > -50 && data.temperature < 150 &&
            typeof data.humidity === 'number' &&
            data.humidity >= 0 && data.humidity <= 100) {
          console.log('Using cached weather data:', data);
          return this.transformWeatherData(data, location);
        } else {
          console.log('Cached weather data is invalid or expired, clearing cache');
          localStorage.removeItem(cacheKey);
        }
      } catch (error) {
        console.warn('Failed to parse cached weather data:', error);
        localStorage.removeItem(cacheKey);
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
        throw new Error('Invalid weather data received - no values object');
      }

      console.log('Weather values from API:', values);

      // Extract and validate each field with fallbacks
      const weatherData = {
        temperature: typeof values.temperature === 'number' ? values.temperature : 75,
        humidity: typeof values.humidity === 'number' ? values.humidity : 70,
        pressure: typeof values.pressureSeaLevel === 'number' ? values.pressureSeaLevel : 1013.25,
        windSpeed: typeof values.windSpeed === 'number' ? values.windSpeed : 8,
        windDirection: typeof values.windDirection === 'number' ? values.windDirection : 90
      };

      // Validate ranges
      if (weatherData.temperature < -50 || weatherData.temperature > 150) {
        console.warn(`Invalid temperature: ${weatherData.temperature}°F, using default`);
        weatherData.temperature = 75;
      }

      if (weatherData.humidity < 0 || weatherData.humidity > 100) {
        console.warn(`Invalid humidity: ${weatherData.humidity}%, using default`);
        weatherData.humidity = 70;
      }

      if (weatherData.pressure < 800 || weatherData.pressure > 1200) {
        console.warn(`Invalid pressure: ${weatherData.pressure} mb, using default`);
        weatherData.pressure = 1013.25;
      }

      // Cache the validated data
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data: weatherData
      }));

      console.group('Weather Data');
      console.log('Temperature:', weatherData.temperature, '°F');
      console.log('Humidity:', weatherData.humidity, '%');
      console.log('Pressure:', weatherData.pressure, 'mb');
      console.log('Wind Speed:', weatherData.windSpeed, 'mph');
      console.log('Wind Direction:', weatherData.windDirection, '°');
      console.groupEnd();

      const transformed = this.transformWeatherData(weatherData, location);
      console.log('Transformed weather data:', transformed);
      return transformed;
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      
      // If we have cached data, use it even if it's stale
      if (cachedData) {
        const { data } = JSON.parse(cachedData);
        console.warn('Using stale cached weather data due to API error');
        return this.transformWeatherData(data, location);
      }
      
      // If all else fails, return reasonable defaults for Jacksonville, FL
      console.warn('Using default weather data');
      return {
        temperature: 75, // °F
        humidity: 70, // %
        pressure: 1013.25, // mb (standard sea level pressure)
        altitude: 16, // ft (Jacksonville average elevation)
        windSpeed: 8, // mph (typical coastal breeze)
        windDirection: 90, // ° (typical easterly wind from Atlantic)
        density: this.calculateAirDensity({
          temperature: 75,
          humidity: 70,
          pressure: 1013.25,
          altitude: 16,
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

  private transformWeatherData(data: any, locationData?: Location): EnvironmentalConditions {
    // Ensure we're working with numbers
    const temperature = Number(data.temperature);
    const humidity = Number(data.humidity);
    const pressure = Number(data.pressure);
    const windSpeed = Number(data.windSpeed);
    const windDirection = Number(data.windDirection);
    
    // Get elevation from location data if available
    const altitude = locationData?.elevation ?? 0;
    
    console.log('Using elevation:', altitude, 'ft');
    
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

  // Add a backup elevation API in case the first one fails
  private async getElevation(lat: number, lng: number): Promise<number | null> {
    const apis = [
      {
        url: `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`,
        transform: (data: any) => data?.results?.[0]?.elevation
      },
      {
        // USGS Elevation Point Query Service
        url: `https://nationalmap.gov/epqs/pqs.php?x=${lng}&y=${lat}&units=Feet&output=json`,
        transform: (data: any) => data?.USGS_Elevation_Point_Query_Service?.Elevation_Query?.Elevation
      }
    ];

    for (const api of apis) {
      try {
        const response = await fetch(api.url);
        if (!response.ok) continue;
        
        const data = await response.json();
        const elevation = api.transform(data);
        
        if (typeof elevation === 'number' && elevation >= -1000 && elevation <= 30000) {
          // Convert meters to feet if needed
          const elevationFeet = api.url.includes('open-elevation') 
            ? Math.round(elevation * 3.28084)  // Convert from meters to feet
            : Math.round(elevation);  // USGS already returns feet
          
          // Validate the elevation is reasonable for Jacksonville (0-50 feet)
          if (lat >= 30.1 && lat <= 30.5 && lng >= -81.8 && lng <= -81.3) {
            if (elevationFeet < 0 || elevationFeet > 50) {
              console.warn('Elevation outside expected range for Jacksonville:', elevationFeet);
              return 16; // Use average Jacksonville elevation
            }
          }
          
          return elevationFeet;
        }
      } catch (error) {
        console.warn(`Failed to get elevation from ${api.url}:`, error);
      }
    }

    // If in Jacksonville area, return average elevation
    if (lat >= 30.1 && lat <= 30.5 && lng >= -81.8 && lng <= -81.3) {
      return 16;
    }

    return null;
  }
}

export const environmentalService = EnvironmentalService.getInstance()
