import { useState, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';
import { environmentalService } from '../services/environmental-service';
import { EnvironmentalConditions } from '../services/environmental-calculations';

interface Adjustments {
  distanceAdjustment: number;
  trajectoryShift: number;
  spinAdjustment: number;
  launchAngleAdjustment: number;
}

export function useEnvironmental(shotDirection: number = 0) {
  const [conditions, setConditions] = useState<EnvironmentalConditions | null>(null);
  const [adjustments, setAdjustments] = useState<Adjustments | null>(null);

  useEffect(() => {
    const unsubscribe = environmentalService.subscribe(setConditions);
    environmentalService.startMonitoring();
    return () => {
      unsubscribe();
      environmentalService.stopMonitoring();
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        environmentalService.startMonitoring();
      } else {
        environmentalService.stopMonitoring();
      }
    });
    return () => subscription.remove();
  }, []);

  const calculateAdjustments = useCallback(() => {
    if (!conditions) return null;

    return {
      distanceAdjustment: conditions.altitude * 0.02,
      trajectoryShift: conditions.windSpeed * Math.sin(conditions.windDirection * (Math.PI / 180)),
      spinAdjustment: (conditions.density / 1.225 - 1) * -50,
      launchAngleAdjustment: conditions.windSpeed * 0.1
    };
  }, [conditions]);

  useEffect(() => {
    if (conditions) {
      setAdjustments(calculateAdjustments());
    }
  }, [conditions, calculateAdjustments]);

  return {
    conditions,
    adjustments,
    isLoading: !conditions
  };
}
