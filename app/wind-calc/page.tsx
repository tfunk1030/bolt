'use client'

import { usePremium } from '@/lib/premium-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { useShotCalc } from '@/lib/shot-calc-context'
import { useEnvironmental } from '@/lib/hooks/use-environmental'
import { useClubSettings } from '@/lib/club-settings-context'
import { YardageModelEnhanced, SkillLevel } from '@/lib/yardage-model'
import WindDirectionCompass from '@/components/wind-direction-compass'
import { normalizeClubName } from '@/lib/utils/club-mapping'

export default function WindCalcPage() {
  const { isPremium } = usePremium()
  const router = useRouter()
  const { shotCalcData } = useShotCalc()
  const { conditions } = useEnvironmental()
  const { getRecommendedClub } = useClubSettings()
  const [windDirection, setWindDirection] = useState(0)
  const [windSpeed, setWindSpeed] = useState(10)
  const [targetYardage, setTargetYardage] = useState(150)
  const [result, setResult] = useState<{ 
    environmentalEffect: number
    windEffect: number
    lateralEffect: number
    totalDistance: number
    recommendedClub: string
    clubData: {
      name: string
      normalCarry: number
      adjustedCarry: number
      lateral: number
    }
  } | null>(null)
  const [yardageModel] = useState(() => new YardageModelEnhanced())

  // Update target yardage when shot calc data changes
  useEffect(() => {
    if (shotCalcData.targetYardage) {
      setTargetYardage(shotCalcData.targetYardage)
    }
  }, [shotCalcData.targetYardage])

  useEffect(() => {
    if (!isPremium) {
      router.push('/')
    }
  }, [isPremium, router])

  const calculateWindEffect = useCallback(() => {
    if (!conditions) return;

    console.log('Environment:', process.env.NODE_ENV);
    console.log('Target Yardage:', targetYardage);
    const recommendedClub = getRecommendedClub(targetYardage)
    console.log('Recommended Club:', recommendedClub);

    if (!recommendedClub) {
      console.log('No recommended club found');
      return;
    }

    try {
      console.log('YardageModel initialized:', !!yardageModel);
      console.log('YardageModel methods:', Object.keys(yardageModel));
      
      // Replace the old club mapping with the new utility
      const clubKey = normalizeClubName(recommendedClub.name);
      console.log('Mapped Club Key:', clubKey);

      // Ensure yardage model is properly initialized
      if (!yardageModel.getClubData || !yardageModel.set_ball_model) {
        console.error('YardageModel not properly initialized');
        return;
      }

      // Try to get initial club data
      const preClubData = yardageModel.getClubData(clubKey);
      console.log('Pre-calculation club data:', preClubData);

      // Set ball model (using tour_premium as default)
      yardageModel.set_ball_model("tour_premium")

      // First calculate environmental effects without wind
      yardageModel.set_conditions(
        conditions.temperature,
        conditions.altitude,
        0,  // No wind
        0,  // No wind direction
        conditions.pressure,
        conditions.humidity
      )

      const envResult = yardageModel.calculate_adjusted_yardage(
        targetYardage,
        SkillLevel.PROFESSIONAL,
        clubKey
      )

      if (!envResult) {
        console.error('No environmental result from calculation in environment:', process.env.NODE_ENV);
        return;
      }

      // Then calculate with wind added
      yardageModel.set_conditions(
        conditions.temperature,
        conditions.altitude,
        windSpeed,
        windDirection,
        conditions.pressure,
        conditions.humidity
      )

      const windResult = yardageModel.calculate_adjusted_yardage(
        targetYardage,
        SkillLevel.PROFESSIONAL,
        clubKey
      )

      if (!windResult) {
        console.error('No wind result from calculation in environment:', process.env.NODE_ENV);
        return;
      }

      console.log('Calculations:', {
        clubKey,
        targetYardage,
        envResult,
        windResult
      });

      // Calculate effects
      const envEffect = -(envResult.carry_distance - targetYardage)
      const windEffect = -(windResult.carry_distance - envResult.carry_distance)
      const lateralEffect = windResult.lateral_movement

      setResult({
        environmentalEffect: envEffect,
        windEffect: windEffect,
        lateralEffect: lateralEffect,
        totalDistance: targetYardage + envEffect + windEffect,
        recommendedClub: recommendedClub.name,
        clubData: {
          name: recommendedClub.name,
          normalCarry: recommendedClub.normalYardage,
          adjustedCarry: windResult.carry_distance,
          lateral: lateralEffect
        }
      })
    } catch (error) {
      console.error('Error calculating wind effect:', error);
    }

    // Scroll to results
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }, 100)
  }, [conditions, targetYardage, windSpeed, windDirection])

  if (!isPremium) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <title>Wind Calculator - Bolt Golf</title>
      <h1 className="text-3xl font-bold mb-8">Wind Calculator</h1>

      <div className="max-w-xl mx-auto space-y-6 bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700/50 shadow-xl">
        {/* Wind Direction Compass */}
        <div className="flex flex-col items-center">
          <div className="text-sm font-medium text-gray-400 mb-2 bg-gray-900/50 px-4 py-2 rounded-full">
            <span>
              <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1 shadow-lg shadow-blue-500/50" aria-hidden="true"></span>
              Wind: {windDirection}°
            </span>
          </div>
          <div className="text-sm text-gray-400 mb-4 opacity-75" id="compass-instructions">
            Drag the blue handle to set wind direction
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-2xl" aria-hidden="true"></div>
            <WindDirectionCompass
              windDirection={windDirection}
              shotDirection={0}
              onChange={(type, degrees) => {
                if (type === 'wind') {
                  setWindDirection(degrees)
                }
              }}
              size={280}
              lockShot={true}
              aria-label="Wind direction compass"
              aria-describedby="compass-instructions"
            />
          </div>
        </div>

        {/* Wind Speed Input */}
        <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-700/50">
          <label htmlFor="wind-speed" className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-400">Wind Speed</span>
            <span className="text-sm font-medium text-blue-400">{windSpeed} mph</span>
          </label>
          <input
            id="wind-speed"
            type="range"
            min="0"
            max="30"
            value={windSpeed}
            onChange={(e) => setWindSpeed(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            aria-label="Wind speed in miles per hour"
          />
        </div>

        {/* Target Yardage Input */}
        <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-700/50">
          <label htmlFor="target-yardage" className="block text-sm font-medium text-gray-400 mb-1">
            Target Yardage
          </label>
          <input
            id="target-yardage"
            type="number"
            min="50"
            max="300"
            value={targetYardage}
            onChange={(e) => setTargetYardage(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800/50 rounded text-white border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            aria-label="Target distance in yards"
          />
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculateWindEffect}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:transform active:scale-[0.98]"
          aria-label="Calculate wind effect"
        >
          Calculate Wind Effect
        </button>
      </div>

      {/* Results Panel */}
      {result && (
        <div className="max-w-xl mx-auto mt-6 bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700/50 shadow-xl">
          <div className="space-y-4">
            <div className="text-xl text-gray-400">
              Play this shot{' '}
              <span className="text-2xl font-bold text-blue-400">
                {Math.round(result.totalDistance)} yards
              </span>
            </div>
            
            {result.lateralEffect !== 0 && (
              <div className="text-xl text-gray-400">
                Aim{' '}
                <span className="text-2xl font-bold text-emerald-400">
                  {Math.abs(result.lateralEffect)} yards {result.lateralEffect > 0 ? 'right' : 'left'}
                </span>
              </div>
            )}
          </div>

          {/* Detailed Effects */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-700/50">
              <div className="font-medium mb-2 text-gray-400">Weather Effect</div>
              <div className={`font-semibold ${result.environmentalEffect < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.environmentalEffect > 0 ? '+' : ''}{Math.round(result.environmentalEffect)} yards
              </div>
            </div>
            <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-700/50">
              <div className="font-medium mb-2 text-gray-400">Wind Effect</div>
              <div className={`font-semibold ${result.windEffect < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.windEffect > 0 ? '+' : ''}{Math.round(result.windEffect)} yards
              </div>
            </div>
            <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-700/50">
              <div className="font-medium mb-2 text-gray-400">Total Effect</div>
              <div className={`font-semibold ${(result.environmentalEffect + result.windEffect) < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {(result.environmentalEffect + result.windEffect) > 0 ? '+' : ''}{Math.round(result.environmentalEffect + result.windEffect)} yards
              </div>
            </div>
            <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-700/50">
              <div className="font-medium mb-2 text-gray-400">Lateral Effect</div>
              <div className={`font-semibold ${Math.abs(result.lateralEffect) < 5 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {Math.abs(result.lateralEffect)} yards {result.lateralEffect > 0 ? 'right' : 'left'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
