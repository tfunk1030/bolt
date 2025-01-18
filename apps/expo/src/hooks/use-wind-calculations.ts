import { useCallback } from 'react';
import { useAppState } from './use-app-state';

interface WindData {
  speed: number;
  direction: number;
  gusts?: number;
}

interface WindCalculationResult {
  speed: number;
  direction: string;
  gusts?: number;
  beaufortScale: number;
  description: string;
  isHazardous: boolean;
}

const BEAUFORT_SCALE = [
  { max: 1, description: 'Calm' },
  { max: 3, description: 'Light Air' },
  { max: 7, description: 'Light Breeze' },
  { max: 12, description: 'Gentle Breeze' },
  { max: 18, description: 'Moderate Breeze' },
  { max: 24, description: 'Fresh Breeze' },
  { max: 31, description: 'Strong Breeze' },
  { max: 38, description: 'Near Gale' },
  { max: 46, description: 'Gale' },
  { max: 54, description: 'Strong Gale' },
  { max: 63, description: 'Storm' },
  { max: 72, description: 'Violent Storm' },
  { max: Infinity, description: 'Hurricane' },
];

const CARDINAL_DIRECTIONS = [
  'N', 'NNE', 'NE', 'ENE',
  'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW',
  'W', 'WNW', 'NW', 'NNW',
];

export function useWindCalculations() {
  const { preferences } = useAppState();

  const convertSpeed = useCallback((speed: number, toMetric: boolean) => {
    return toMetric ? speed * 1.60934 : speed / 1.60934;
  }, []);

  const getBeaufortScale = useCallback((speed: number): number => {
    const mphSpeed = preferences.useMetricUnits ? speed / 1.60934 : speed;
    return BEAUFORT_SCALE.findIndex((scale, index) => 
      mphSpeed <= scale.max || index === BEAUFORT_SCALE.length - 1
    );
  }, [preferences.useMetricUnits]);

  const getCardinalDirection = useCallback((degrees: number): string => {
    const index = Math.round(degrees / 22.5) % 16;
    return CARDINAL_DIRECTIONS[index];
  }, []);

  const calculateWind = useCallback((data: WindData): WindCalculationResult => {
    const speed = preferences.useMetricUnits 
      ? convertSpeed(data.speed, true)
      : data.speed;

    const gusts = data.gusts 
      ? preferences.useMetricUnits 
        ? convertSpeed(data.gusts, true)
        : data.gusts
      : undefined;

    const beaufortScale = getBeaufortScale(speed);
    const direction = getCardinalDirection(data.direction);

    return {
      speed: Number(speed.toFixed(1)),
      direction,
      gusts: gusts ? Number(gusts.toFixed(1)) : undefined,
      beaufortScale,
      description: BEAUFORT_SCALE[beaufortScale].description,
      isHazardous: beaufortScale >= 7, // Near Gale or stronger
    };
  }, [preferences.useMetricUnits, convertSpeed, getBeaufortScale, getCardinalDirection]);

  const getWindDescription = useCallback((speed: number): string => {
    const beaufortScale = getBeaufortScale(speed);
    return BEAUFORT_SCALE[beaufortScale].description;
  }, [getBeaufortScale]);

  return {
    calculateWind,
    convertSpeed,
    getBeaufortScale,
    getCardinalDirection,
    getWindDescription,
    BEAUFORT_SCALE,
    CARDINAL_DIRECTIONS,
  };
}

export type { WindData, WindCalculationResult };
