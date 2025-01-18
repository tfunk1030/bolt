import { useState, useEffect } from 'react';
import { useLocation } from './use-location';
import { useWeather } from './use-weather';

export interface EnvironmentalConditions {
  temperature: number; // in Celsius
  humidity: number; // percentage
  pressure: number; // in hPa
  altitude: number; // in feet
  density: number; // air density in kg/m³
  windSpeed: number; // in m/s
  windDirection: number; // in degrees
  description: string;
}

export function useEnvironmental() {
  const { location } = useLocation();
  const { weather, loading: weatherLoading } = useWeather();
  const [conditions, setConditions] = useState<EnvironmentalConditions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!location || !weather) {
      setLoading(weatherLoading);
      return;
    }

    // Convert altitude from meters to feet if needed
    const altitudeInFeet = location.altitude ? location.altitude * 3.28084 : 0;

    // Calculate air density using temperature, pressure, and humidity
    const T = weather.temperature + 273.15; // Convert to Kelvin
    const P = weather.pressure * 100; // Convert hPa to Pa
    const RH = weather.humidity / 100; // Convert percentage to decimal

    // Calculate saturation vapor pressure using Magnus formula
    const e_s = 6.1078 * Math.exp((17.27 * (T - 273.15)) / (T - 35.85));
    
    // Calculate actual vapor pressure
    const e = RH * e_s;
    
    // Calculate air density using the ideal gas law with humidity correction
    const R_d = 287.058; // Gas constant for dry air
    const R_v = 461.495; // Gas constant for water vapor
    const density = (P / (R_d * T)) * (1 - (e / P) * (1 - R_d / R_v));

    // Apply altitude correction to density
    const altitudeCorrectionFactor = Math.exp(-altitudeInFeet / 29922); // Scale height of 29,922 feet
    const correctedDensity = density * altitudeCorrectionFactor;

    setConditions({
      temperature: weather.temperature,
      humidity: weather.humidity,
      pressure: weather.pressure,
      altitude: altitudeInFeet,
      density: correctedDensity,
      windSpeed: weather.windSpeed,
      windDirection: weather.windDirection,
      description: weather.description,
    });

    setLoading(false);
  }, [location, weather, weatherLoading]);

  return {
    conditions,
    loading,
    error: !location || !weather ? 'Location or weather data unavailable' : null,
  };
}
