import { UNITS } from '../constants/config';

export interface ConversionResult {
  value: number;
  unit: string;
  formatted: string;
}

// Wind Speed Conversions
export function convertWindSpeed(speed: number, toMetric: boolean): ConversionResult {
  const value = toMetric ? speed * 1.60934 : speed / 1.60934;
  const unit = toMetric ? UNITS.WIND_SPEED.METRIC : UNITS.WIND_SPEED.IMPERIAL;
  
  return {
    value: Number(value.toFixed(1)),
    unit,
    formatted: `${value.toFixed(1)} ${unit}`,
  };
}

// Temperature Conversions
export function convertTemperature(temp: number, toMetric: boolean): ConversionResult {
  const value = toMetric ? ((temp - 32) * 5) / 9 : (temp * 9) / 5 + 32;
  const unit = toMetric ? UNITS.TEMPERATURE.METRIC : UNITS.TEMPERATURE.IMPERIAL;
  
  return {
    value: Number(value.toFixed(1)),
    unit,
    formatted: `${value.toFixed(1)}${unit}`,
  };
}

// Distance Conversions
export function convertDistance(distance: number, toMetric: boolean): ConversionResult {
  const value = toMetric ? distance * 1.60934 : distance / 1.60934;
  const unit = toMetric ? UNITS.DISTANCE.METRIC : UNITS.DISTANCE.IMPERIAL;
  
  return {
    value: Number(value.toFixed(1)),
    unit,
    formatted: `${value.toFixed(1)} ${unit}`,
  };
}

// Format wind direction in degrees to cardinal direction
export function formatWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                     'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees % 360) / 22.5));
  return directions[index % 16];
}

// Format wind speed with appropriate unit
export function formatWindSpeed(speed: number, isMetric: boolean): string {
  const { formatted } = convertWindSpeed(speed, isMetric);
  return formatted;
}

// Format temperature with appropriate unit
export function formatTemperature(temp: number, isMetric: boolean): string {
  const { formatted } = convertTemperature(temp, isMetric);
  return formatted;
}

// Format distance with appropriate unit
export function formatDistance(distance: number, isMetric: boolean): string {
  const { formatted } = convertDistance(distance, isMetric);
  return formatted;
}

// Round number to specified decimal places
export function roundToDecimal(value: number, decimals: number = 1): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

// Get wind speed description based on Beaufort scale
export function getWindSpeedDescription(speed: number, isMetric: boolean): string {
  const mphSpeed = isMetric ? speed / 1.60934 : speed;
  
  if (mphSpeed < 1) return 'Calm';
  if (mphSpeed < 3) return 'Light Air';
  if (mphSpeed < 7) return 'Light Breeze';
  if (mphSpeed < 12) return 'Gentle Breeze';
  if (mphSpeed < 18) return 'Moderate Breeze';
  if (mphSpeed < 24) return 'Fresh Breeze';
  if (mphSpeed < 31) return 'Strong Breeze';
  if (mphSpeed < 38) return 'Near Gale';
  if (mphSpeed < 46) return 'Gale';
  if (mphSpeed < 54) return 'Strong Gale';
  if (mphSpeed < 63) return 'Storm';
  if (mphSpeed < 72) return 'Violent Storm';
  return 'Hurricane';
}
