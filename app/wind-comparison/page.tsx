'use client'

import { usePremium } from '@/lib/premium-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { useShotCalc } from '@/lib/shot-calc-context'
import { useClubSettings } from '@/lib/club-settings-context'
import { useEnvironmental } from '@/lib/hooks/use-environmental'
import { YardageModelEnhanced as YardageModelLegacy } from '@/lib/yardage-model'
import { YardageModelEnhanced as YardageModelRevised } from '@/lib/revised-yardage-model'
import { YardageModelEnhanced as LatestYardageModel } from '@/lib/latest-yardage-model'
import { SkillLevel } from '@/lib/yardage_modelds'
import WindDirectionCompass from '@/components/wind-direction-compass'
import { normalizeClubName } from '@/lib/utils/club-mapping'

interface ModelResult {
  windEffect: number
  lateralEffect: number
}

export default function WindComparisonPage() {
  const { isPremium } = usePremium()
  const router = useRouter()
  const { shotCalcData } = useShotCalc()
  const { conditions } = useEnvironmental()
  const { getRecommendedClub } = useClubSettings()
  const [windDirection, setWindDirection] = useState(0)
  const [windSpeed, setWindSpeed] = useState(10)
  const [targetYardage, setTargetYardage] = useState(150)
  const [results, setResults] = useState<{
    [x: string]: any
    revised: ModelResult | null
    legacy: ModelResult | null
  }>({
    revised: null,
    legacy: null
  })

  const [models] = useState(() => ({
    revised: new YardageModelRevised(),
    legacy: new YardageModelLegacy(),
    latest: new LatestYardageModel()
  }))

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

  const calculateModelEffect = useCallback((
    model: YardageModelRevised | YardageModelLegacy | LatestYardageModel, 
    clubKey: string
  ): ModelResult | null => {
    if (!conditions) return null;

    try {
      console.log('\nCalculation Debug:');
      console.log('Club Key:', clubKey);
      console.log('Environmental Conditions:', conditions);
      console.log('Target Yardage:', targetYardage);
      console.log('Wind Speed:', windSpeed);
      console.log('Wind Direction:', windDirection);

      model.set_ball_model("tour_premium");
      console.log('Ball Model: tour_premium');

      // First calculate environmental effects without wind
      console.log('\nNo Wind Calculation:');
      model.set_conditions(
        conditions.temperature,
        conditions.altitude,
        0,  // No wind
        0,  // No wind direction
        conditions.pressure,
        conditions.humidity
      )

      const envResult = model.calculate_adjusted_yardage(
        targetYardage,
        SkillLevel.PROFESSIONAL,
        clubKey
      )
      console.log('Environment Only Result:', envResult);

      // Then calculate with wind added
      console.log('\nWith Wind Calculation:');
      model.set_conditions(
        conditions.temperature,
        conditions.altitude,
        windSpeed,
        windDirection,
        conditions.pressure,
        conditions.humidity
      )

      const windResult = model.calculate_adjusted_yardage(
        targetYardage,
        SkillLevel.PROFESSIONAL,
        clubKey
      )
      console.log('Wind Added Result:', windResult);

      // Calculate wind effect exactly as in wind-calc page
      const windEffect = -(windResult.carry_distance - envResult.carry_distance)
      console.log('\nFinal Effects:');
      console.log('Wind Effect:', windEffect);
      console.log('Lateral Effect:', windResult.lateral_movement);

      return {
        windEffect,
        lateralEffect: windResult.lateral_movement
      }
    } catch (error) {
      console.error('Error calculating model effect:', error);
      return null;
    }
  }, [conditions, targetYardage, windSpeed, windDirection])

  const calculateWindEffect = useCallback(() => {
    if (!conditions) return;

    const recommendedClub = getRecommendedClub(targetYardage)
    if (!recommendedClub) return;

    const clubKey = normalizeClubName(recommendedClub.name)

    setResults({
      revised: calculateModelEffect(models.revised, clubKey),
      legacy: calculateModelEffect(models.legacy, clubKey),
      latest: calculateModelEffect(models.latest, clubKey)
    })
  }, [conditions, targetYardage, windSpeed, windDirection, calculateModelEffect, getRecommendedClub, models])

  if (!isPremium) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <title>Wind Model Comparison - Bolt Golf</title>
      <h1 className="text-3xl font-bold mb-8">Wind Model Comparison</h1>

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

        {/* Results Panel */}
        {results.revised && (
          <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-700/50">
            {[
              { name: "Revised Model", result: results.revised },
              { name: "Legacy Model", result: results.legacy },
              { name: "Latest Model", result: results.latest }
            ].map(({ name, result }) => result && (
              <div key={name} className="py-3 first:pt-0 last:pb-0 border-b last:border-0 border-gray-700">
                <div className="text-sm font-medium text-gray-400">{name}</div>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div className="text-lg font-semibold">
                    {result.windEffect.toFixed(1)} yards
                  </div>
                  <div className="text-lg font-semibold">
                    {Math.abs(result.lateralEffect).toFixed(1)} yards {result.lateralEffect > 0 ? 'right' : 'left'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
