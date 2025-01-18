import { useState, useEffect, useCallback } from 'react';
import { useEnvironmental } from './use-environmental';
import { useClubSettings } from '../providers/club-settings';
import { useSettings } from '../providers/settings';
import { useShotCalc } from '../providers/shot-calc';
import { YardageModelEnhanced, SkillLevel } from '../utils/yardage-model';
import { normalizeClubName } from '../utils/club-mapping';

function convertDistance(value: number, unit: 'meters' | 'yards'): number {
  return unit === 'meters' ? value * 0.9144 : value;
}

export function useShot(targetYardage: number) {
  const { conditions } = useEnvironmental();
  const { getRecommendedClub } = useClubSettings();
  const { settings } = useSettings();
  const { setShotCalcData } = useShotCalc();
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [yardageModel] = useState(() => new YardageModelEnhanced());

  const calculateShot = useCallback(() => {
    if (!conditions) return null;

    const recommendedClub = getRecommendedClub(targetYardage);
    if (!recommendedClub) return null;

    try {
      const clubKey = normalizeClubName(recommendedClub.name);
      const clubData = yardageModel.getClubData(clubKey);
      if (!clubData) return null;

      if (!yardageModel.getClubData || !yardageModel.set_ball_model) {
        return null;
      }

      yardageModel.set_ball_model("tour_premium");
      yardageModel.set_conditions(
        conditions.temperature,
        conditions.altitude,
        0, 0,
        conditions.pressure,
        conditions.humidity
      );

      const result = yardageModel.calculate_adjusted_yardage(
        targetYardage,
        SkillLevel.PROFESSIONAL,
        clubKey
      );

      if (!result) return null;

      return {
        result,
        clubData,
        recommendedClub
      };
    } catch (error) {
      console.error('Error calculating shot:', error);
      return null;
    }
  }, [conditions, targetYardage, getRecommendedClub, yardageModel]);

  const shotData = calculateShot();

  useEffect(() => {
    const now = Date.now();
    if (lastUpdate && now - lastUpdate < 100) return;

    if (conditions && shotData) {
      setLastUpdate(now);
      setShotCalcData({
        targetYardage,
        elevation: conditions.altitude,
        temperature: conditions.temperature,
        humidity: conditions.humidity,
        pressure: conditions.pressure,
        adjustedDistance: shotData.result.carry_distance
      });
    }
  }, [conditions, shotData, targetYardage, setShotCalcData, lastUpdate]);

  return { shotData };
}
