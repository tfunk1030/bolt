import React, { createContext, useContext } from 'react';
import { useEnvironmental } from '../hooks/use-environmental';
import { useClubSettings } from './club-settings';
import { Club } from '../utils/club-mapping';

interface ShotResult {
  carry_distance: number;
  total_distance: number;
  apex_height: number;
  landing_angle: number;
}

interface ShotData {
  result: ShotResult;
  recommendedClub: Club;
}

interface ShotCalcContextType {
  calculateShot: (targetYardage: number) => ShotData;
}

const defaultClub: Club = {
  name: 'Unknown',
  normalYardage: 0,
  type: 'iron',
  loft: 30,
  launchAngle: 18,
  spinRate: 5000,
};

const ShotCalcContext = createContext<ShotCalcContextType>({
  calculateShot: () => ({
    result: {
      carry_distance: 0,
      total_distance: 0,
      apex_height: 0,
      landing_angle: 0,
    },
    recommendedClub: defaultClub,
  }),
});

export function ShotCalcProvider({ children }: { children: React.ReactNode }) {
  const { conditions } = useEnvironmental();
  const { getRecommendedClub } = useClubSettings();

  const calculateShot = (targetYardage: number): ShotData => {
    // Get recommended club based on target distance
    const recommendedClub = getRecommendedClub(targetYardage);
    if (!recommendedClub || !conditions) {
      return {
        result: {
          carry_distance: targetYardage,
          total_distance: targetYardage,
          apex_height: 0,
          landing_angle: 0,
        },
        recommendedClub: recommendedClub || defaultClub,
      };
    }

    // Calculate air density factor
    const densityFactor = conditions.density / 1.225; // Standard air density at sea level

    // Calculate temperature factor
    const tempFactor = (conditions.temperature + 273.15) / 288.15;

    // Calculate altitude factor
    const altitudeFactor = Math.exp(-conditions.altitude / 8000);

    // Calculate adjusted carry distance based on environmental conditions
    const adjustedCarry = targetYardage * (
      densityFactor * tempFactor * altitudeFactor
    );

    // Calculate approximate apex height based on club type and launch angle
    const apexHeight = adjustedCarry * (Math.sin(recommendedClub.launchAngle * Math.PI / 180) * 0.3);

    // Use the club's actual launch angle
    const landingAngle = recommendedClub.launchAngle * 1.2; // Slightly steeper landing than launch

    // Calculate total distance (carry + roll based on club type)
    const rollFactor = recommendedClub.type === 'driver' ? 1.2 : // 20% roll for driver
                      recommendedClub.type === 'wood' ? 1.15 : // 15% roll for woods
                      recommendedClub.type === 'iron' ? 1.1 : // 10% roll for irons
                      1.05; // 5% roll for wedges
    const totalDistance = adjustedCarry * rollFactor;

    return {
      result: {
        carry_distance: Math.round(adjustedCarry),
        total_distance: Math.round(totalDistance),
        apex_height: Math.round(apexHeight),
        landing_angle: Math.round(landingAngle),
      },
      recommendedClub,
    };
  };

  return (
    <ShotCalcContext.Provider value={{ calculateShot }}>
      {children}
    </ShotCalcContext.Provider>
  );
}

export function useShotCalc() {
  const context = useContext(ShotCalcContext);
  if (!context) {
    throw new Error('useShotCalc must be used within a ShotCalcProvider');
  }
  return context;
}
