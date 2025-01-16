'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useEnvironmental } from '@/lib/hooks/use-environmental'
import { useClubSettings } from '@/lib/club-settings-context'
import { usePremium } from '@/lib/premium-context'
import { useSettings } from '@/lib/settings-context'
import { useShotCalc } from '@/lib/shot-calc-context'
import { YardageModelEnhanced, SkillLevel } from '@/lib/yardage-model'
import { 
  Target, 
  Thermometer, 
  Droplets, 
  Mountain, 
  Gauge
} from 'lucide-react'

function convertDistance(value: number, unit: 'meters' | 'yards'): number {
  return unit === 'meters' ? value * 0.9144 : value
}

export default function ShotCalculatorPage() {
  const { conditions } = useEnvironmental()
  const { getRecommendedClub } = useClubSettings()
  const { isPremium } = usePremium()
  const { settings, formatDistance, formatTemperature, formatAltitude } = useSettings()
  const { setShotCalcData } = useShotCalc()
  const [targetYardage, setTargetYardage] = useState(150)
  const [lastUpdate, setLastUpdate] = useState<number | null>(null)
  const [yardageModel] = useState(() => new YardageModelEnhanced())

  const calculateShot = useCallback(() => {
    if (!conditions) return null

    console.log('Environment:', process.env.NODE_ENV);
    console.log('Target Yardage:', targetYardage);
    const recommendedClub = getRecommendedClub(targetYardage)
    console.log('Recommended Club:', recommendedClub);

    if (!recommendedClub) {
      console.log('No recommended club found');
      return null;
    }

    try {
      // Debug: Log the yardage model instance and verify it's initialized
      console.log('YardageModel initialized:', !!yardageModel);
      console.log('YardageModel methods:', Object.keys(yardageModel));
      
      let clubKey = recommendedClub.name.toLowerCase();
      
      const clubMapping: Record<string, string> = {
        'pw': 'pitching-wedge',
        'gw': 'gap-wedge',
        'sw': 'sand-wedge',
        'lw': 'lob-wedge',
        '3w': '3-wood',
        '5w': '5-wood',
        '7w': '7-wood',
        '2i': '2-iron',
        '3i': '3-iron',
        '4i': '4-iron',
        '5i': '5-iron',
        '6i': '6-iron',
        '7i': '7-iron',
        '8i': '8-iron',
        '9i': '9-iron',
      };

      clubKey = clubMapping[clubKey] || clubKey;

      console.log('Mapped Club Key:', clubKey);

      // Ensure yardage model is properly initialized
      if (!yardageModel.getClubData || !yardageModel.set_ball_model) {
        console.error('YardageModel not properly initialized');
        return null;
      }

      // Try to get initial club data
      const preClubData = yardageModel.getClubData(clubKey);
      console.log('Pre-calculation club data:', preClubData);

      // Set up the model
      yardageModel.set_ball_model("tour_premium")
      yardageModel.set_conditions(
        conditions.temperature,
        conditions.altitude,
        0, 0,
        conditions.pressure,
        conditions.humidity
      )

      // Calculate the shot
      const result = yardageModel.calculate_adjusted_yardage(
        targetYardage,
        SkillLevel.PROFESSIONAL,
        clubKey
      )

      if (!result) {
        console.error('No result from calculation in environment:', process.env.NODE_ENV);
        return null;
      }

      console.log('Shot Calculation:', {
        clubKey,
        targetYardage,
        result
      });

      const clubData = yardageModel.getClubData(clubKey)
      console.log('Post-calculation club data:', clubData);
      
      if (!clubData) {
        console.error('No club data found for:', clubKey, 'in environment:', process.env.NODE_ENV);
        return null;
      }

      return {
        result,
        clubData,
        recommendedClub
      }
    } catch (error) {
      console.error('Error calculating shot in environment:', process.env.NODE_ENV, error);
      return null;
    }
  }, [conditions, targetYardage, getRecommendedClub])

  const shotData = useMemo(() => calculateShot(), [calculateShot])

  useEffect(() => {
    const now = Date.now()
    if (lastUpdate && now - lastUpdate < 100) return

    if (conditions && shotData) {
      setLastUpdate(now)
      setShotCalcData({
        targetYardage,
        elevation: conditions.altitude,
        temperature: conditions.temperature,
        humidity: conditions.humidity,
        pressure: conditions.pressure,
        adjustedDistance: shotData.result.carry_distance
      })
    }
  }, [conditions, shotData, targetYardage, setShotCalcData, lastUpdate])

  // Add error boundary for the component
  useEffect(() => {
    const handleError = (error: Error) => {
      console.error('Shot calculator error:', error);
    };

    const handleErrorEvent = (event: ErrorEvent) => {
      console.error('Shot calculator error:', event.error);
    };

    window.addEventListener('error', handleErrorEvent);
    return () => window.removeEventListener('error', handleErrorEvent);
  }, []);

  if (!conditions) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-800 rounded mb-4"></div>
          <div className="h-8 bg-gray-800 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  const formatAdjustment = (yards: number) => {
    const value = settings.distanceUnit === 'meters' 
      ? convertDistance(Math.abs(yards), 'meters')
      : Math.abs(yards)
    
    return `${yards >= 0 ? '+' : '-'}${Math.round(value)} ${
      settings.distanceUnit === 'yards' ? 'yds' : 'm'
    }`
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Shot Calculator</h1>

      {/* Environmental Conditions - Streamlined */}
      <div className="bg-gray-800 rounded-xl p-3 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Air Density */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Gauge className="w-3 h-3 text-blue-400" />
            </div>
            <div className="text-xs">
              <div className="text-gray-400">Density</div>
              <div>{conditions?.density?.toFixed(3) ?? 'N/A'}</div>
            </div>
          </div>

          {/* Altitude */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Mountain className="w-3 h-3 text-blue-400" />
            </div>
            <div className="text-xs">
              <div className="text-gray-400">Altitude</div>
              <div>{formatAltitude(conditions.altitude)}</div>
            </div>
          </div>

          {/* Temperature */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Thermometer className="w-3 h-3 text-blue-400" />
            </div>
            <div className="text-xs">
              <div className="text-gray-400">Temp</div>
              <div>{formatTemperature(conditions.temperature)}</div>
            </div>
          </div>

          {/* Humidity */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Droplets className="w-3 h-3 text-blue-400" />
            </div>
            <div className="text-xs">
              <div className="text-gray-400">Humidity</div>
              <div>{conditions.humidity.toFixed(0)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Distance Input */}
      <div className="bg-gray-800 rounded-xl p-6 mb-6">
        <div className="text-sm text-gray-400 mb-2">Target Distance</div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={settings.distanceUnit === 'yards' ? '50' : '45'}
            max={settings.distanceUnit === 'yards' ? '360' : '330'}
            value={targetYardage}
            onChange={(e) => setTargetYardage(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-2xl font-bold w-32 text-right">
            {formatDistance(targetYardage)}
          </div>
        </div>
      </div>

      {/* Total Effect */}
      {shotData && (
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Shot Adjustment</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between font-medium">
              <div>Environmental Effect</div>
              <div className={`${targetYardage >= shotData.result.carry_distance ? 'text-red-400' : 'text-blue-400'}`}>
                {formatAdjustment(targetYardage - shotData.result.carry_distance)}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">Playing Distance</div>
              <div className="text-lg font-bold">
                {formatDistance(targetYardage * (targetYardage / shotData.result.carry_distance))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Club */}
      {shotData?.recommendedClub && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recommended Club</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Club</span>
              <span className="text-lg font-bold">{shotData.recommendedClub.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Normal Carry</span>
              <span>{formatDistance(shotData.recommendedClub.normalYardage)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}