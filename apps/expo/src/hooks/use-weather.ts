import { useState, useEffect } from 'react';
import { useLocation } from './use-location';
import { config } from '../constants/config';

interface WeatherData {
  temperature: number; // in Celsius
  humidity: number; // percentage
  pressure: number; // in hPa
  windSpeed: number; // in m/s
  windDirection: number; // in degrees
  description: string;
}

export function useWeather() {
  const { location, loading: locationLoading } = useLocation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!location || !config.openWeatherApiKey) {
        setLoading(false);
        setError('Location or API key not available');
        return;
      }

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&units=metric&appid=${config.openWeatherApiKey}`
        );

        if (!response.ok) {
          throw new Error('Weather data fetch failed');
        }

        const data = await response.json();

        setWeather({
          temperature: data.main.temp,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
          windSpeed: data.wind.speed,
          windDirection: data.wind.deg,
          description: data.weather[0].description,
        });
        setLoading(false);
        setError(null);
      } catch (err) {
        setError('Error fetching weather data');
        setLoading(false);
      }
    };

    if (!locationLoading && location) {
      fetchWeather();
    }

    // Set up weather update interval
    const intervalId = setInterval(() => {
      if (!locationLoading && location) {
        fetchWeather();
      }
    }, 300000); // Update every 5 minutes

    return () => clearInterval(intervalId);
  }, [location, locationLoading]);

  return {
    weather,
    loading: loading || locationLoading,
    error,
  };
}
