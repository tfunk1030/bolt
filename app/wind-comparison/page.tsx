'use client'

import { usePremium } from '@/lib/premium-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { useShotCalc } from '@/lib/shot-calc-context'
import { useEnvironmental } from '@/lib/hooks/use-environmental'
import { useClubSettings } from '@/lib/club-settings-context'
import { YardageModelEnhanced as YardageModelDS, SkillLevel } from '@/lib/yardage_modelds'
import { YardageModelEnhanced as YardageModelLegacy } from '@/lib/yardage-model'
import WindDirectionCompass from '@/components/wind-direction-compass'
import { normalizeClubName } from '@/lib/utils/club-mapping'
import { Card } from '@/components/ui/card'

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

export default function WindComparisonPage() {
  const { isPremium } = usePremium()
  const router = useRouter()
  const { shotCalcData } = useShotCalc()
  const { conditions } = useEnvironmental()
  const { getRecommendedClub } = useClubSettings()
  
  const [windDirection, setWindDirection] = useState(0)
  const [windSpeed, setWindSpeed] = useState(10)
  const [targetYardage, setTargetYardage] = useState(150)
  const [dsResult, setDsResult] = useState<ModelResult | null>(null)
  const [legacyResult, setLegacyResult] = useState<ModelResult | null>(null)
  const [yardageModelDS] = useState(() => new YardageModelDS())
  const [yardageModelLegacy] = useState(() => new YardageModelLegacy())

  const handleWindDirectionChange = useCallback((type: "wind" | "shot", degrees: number) => {
    if (type === "wind") {
      setWindDirection(degrees)
    }
  }, [])

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

    const recommendedClub = getRecommendedClub(targetYardage)
    if (!recommendedClub) return;

    try {
      const clubKey = normalizeClubName(recommendedClub.name);
      
      // DS Model Calculations
      yardageModelDS.set_ball_model("tour_premium");
      yardageModelDS.set_conditions(
        conditions.temperature,
        conditions.altitude,
        windSpeed,
        windDirection,
        conditions.pressure,
        conditions.humidity
      )

      const dsResult = yardageModelDS.calculate_adjusted_yardage(
        targetYardage,
        SkillLevel.PROFESSIONAL,
        clubKey
      )

      // Legacy Model Calculations
      yardageModelLegacy.set_ball_model("tour_premium");
      yardageModelLegacy.set_conditions(
        conditions.temperature,
        conditions.altitude,
        windSpeed,
        windDirection,
        conditions.pressure,
        conditions.humidity
      )

      const legacyResult = yardageModelLegacy.calculate_adjusted_yardage(
        targetYardage,
        SkillLevel.PROFESSIONAL,
        clubKey
      )

      setDsResult({
        environmentalEffect: dsResult.carry_distance - targetYardage,
        windEffect: dsResult.carry_distance - targetYardage,
        lateralEffect: dsResult.lateral_movement,
        totalDistance: dsResult.carry_distance,
        recommendedClub: recommendedClub.name,
        clubData: {
          name: recommendedClub.name,
          normalCarry: targetYardage,
          adjustedCarry: dsResult.carry_distance,
          lateral: dsResult.lateral_movement
        }
      })

      setLegacyResult({
        environmentalEffect: legacyResult.carry_distance - targetYardage,
        windEffect: legacyResult.carry_distance - targetYardage,
        lateralEffect: legacyResult.lateral_movement,
        totalDistance: legacyResult.carry_distance,
        recommendedClub: recommendedClub.name,
        clubData: {
          name: recommendedClub.name,
          normalCarry: targetYardage,
          adjustedCarry: legacyResult.carry_distance,
          lateral: legacyResult.lateral_movement
        }
      })

    } catch (error) {
      console.error('Error calculating wind effect:', error)
    }
  }, [conditions, targetYardage, windSpeed, windDirection, getRecommendedClub])

  return (
    <div className="p-6 space-y-6">
      {/* Input Controls */}
      <div className="space-y-4">
        {/* Target Distance */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">
            Target Distance (yards)
          </label>
          <input
            type="number"
            min="50"
            max="300"
            value={targetYardage}
            onChange={e => setTargetYardage(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          />
        </div>

        {/* Wind Speed */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">
            Wind Speed (mph)
          </label>
          <input
            type="number"
            min="0"
            max="40"
            value={windSpeed}
            onChange={e => setWindSpeed(Number(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
          />
        </div>

        {/* Wind Direction */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-400">
            Wind Direction
          </label>
          <div className="flex justify-center">
            <WindDirectionCompass
              onChange={handleWindDirectionChange}
              windDirection={windDirection}
              shotDirection={0}
              size={280}
              lockShot={true}
            />
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculateWindEffect}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          Calculate Wind Effects
        </button>
      </div>

      {/* Results Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Enhanced Model */}
        <Card className="p-4 bg-gray-800/50">
          <h2 className="text-lg font-semibold mb-4">Enhanced Model</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Wind Effect</span>
              <span>{dsResult?.windEffect.toFixed(0)} yards</span>
            </div>
            <div className="flex justify-between">
              <span>Lateral Effect</span>
              <span>{dsResult?.lateralEffect.toFixed(0)} yards</span>
            </div>
          </div>
        </Card>

        {/* Current Model (previously Legacy) */}
        <Card className="p-4 bg-gray-800/50">
          <h2 className="text-lg font-semibold mb-4">Current Model</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Wind Effect</span>
              <span>{legacyResult?.windEffect.toFixed(0)} yards</span>
            </div>
            <div className="flex justify-between">
              <span>Lateral Effect</span>
              <span>{legacyResult?.lateralEffect.toFixed(0)} yards</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}