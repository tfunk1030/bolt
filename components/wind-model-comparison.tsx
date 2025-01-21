'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { SkillLevel, YardageModelEnhanced as YardageModelRevised } from '@/lib/revised-yardage-model'
import { YardageModelEnhanced as LatestYardageModel } from '@/lib/latest-yardage-model'
import { YardageModelEnhanced as YardageModelLegacy } from '@/lib/yardage-model'
import { useEnvironmental } from '@/lib/hooks/use-environmental'
import { useClubSettings } from '@/lib/club-settings-context'
import { useShotCalc } from '@/lib/shot-calc-context'
import WindDirectionCompass from '@/components/wind-direction-compass'
import { normalizeClubName } from '@/lib/utils/club-mapping'

interface ModelResult {
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
}

export function WindModelComparison() {
  const { shotCalcData } = useShotCalc()
  const { conditions } = useEnvironmental()
  const { getRecommendedClub } = useClubSettings()
  const [windDirection, setWindDirection] = useState(0)
  const [windSpeed, setWindSpeed] = useState(10)
  const [targetYardage, setTargetYardage] = useState(150)
  const [results, setResults] = useState<{
    revised: ModelResult | null
    ds: ModelResult | null
    legacy: ModelResult | null
  }>({
    revised: null,
    ds: null,
    legacy: null
  })

  const [models] = useState(() => ({
    revised: new LatestYardageModel(),
    ds: new LatestYardageModel(),
    legacy: new LatestYardageModel()
  }))

  // Update target yardage when shot calc data changes
  useEffect(() => {
    if (shotCalcData.targetYardage) {
      setTargetYardage(shotCalcData.targetYardage)
    }
  }, [shotCalcData.targetYardage])

  const calculateModelEffect = useCallback((
    model: YardageModelRevised | LatestYardageModel | YardageModelLegacy,
    recommendedClub: ReturnType<typeof getRecommendedClub>,
    clubKey: string
  ): ModelResult | null => {
    if (!conditions || !recommendedClub) return null;

    try {
      // Set ball model with enhanced features
      model.set_ball_model("tour_premium");

      // First calculate environmental effects without wind
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

      // Then calculate with wind added
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

      // Calculate effects
      const envEffect = -(envResult.carry_distance - targetYardage)
      const windEffect = -(windResult.carry_distance - envResult.carry_distance)
      const lateralEffect = windResult.lateral_movement

      return {
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
      revised: calculateModelEffect(models.revised, recommendedClub, clubKey),
      ds: calculateModelEffect(models.ds, recommendedClub, clubKey),
      legacy: calculateModelEffect(models.legacy, recommendedClub, clubKey)
    })

    // Scroll to results
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }, 100)
  }, [conditions, targetYardage, windSpeed, windDirection, calculateModelEffect, getRecommendedClub, models])

  const renderModelResults = (modelName: string, result: ModelResult | null) => {
    if (!result) return null;

    return (
      <div className="mt-6 bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700/50 shadow-xl">
        <h3 className="text-lg font-semibold mb-4">{modelName}</h3>
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
                {Math.abs(result.lateralEffect)} yards {result.lateralEffect > 0 ? 'left' : 'right'}
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
              {Math.abs(result.lateralEffect)} yards
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="p-4">
      <h2 className="text-3xl font-bold mb-8">Wind Model Comparison</h2>

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

      {/* Results Panels */}
      {renderModelResults("Revised Model", results.revised)}
      {renderModelResults("DS Model", results.ds)}
      {renderModelResults("Legacy Model", results.legacy)}
    </Card>
  )
}
