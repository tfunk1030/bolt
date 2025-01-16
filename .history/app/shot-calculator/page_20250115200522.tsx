'use client'

import { useState, useMemo, useEffect } from 'react'
import { useEnvironmental } from '@/lib/hooks/use-environmental'
import { useClubSettings } from '@/lib/club-settings-context'
import { usePremium } from '@/lib/premium-context'
import { useSettings } from '@/lib/settings-context'
import { useShotCalc } from '@/lib/shot-calc-context'
import { YardageModelEnhanced, SkillLevel } from '@/lib/yardage-model'
import { 
  Target, 
  Wind, 
  Thermometer, 
  Droplets, 
  Mountain, 
  Gauge,
  Lock
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export default function ShotCalculatorPage() {
  const { conditions } = useEnvironmental()
  const { getRecommendedClub } = useClubSettings()
  const { isPremium, setShowUpgradeModal } = usePremium()
  const { settings, convertDistance, formatDistance, formatTemperature, formatAltitude } = useSettings()
  const { setShotCalcData } = useShotCalc()
  const [targetYardage, setTargetYardage] = useState(150)
  const [lastUpdate, setLastUpdate] = useState<number | null>(null)
  const [yardageModel] = useState(() => new YardageModelEnhanced())

  // Calculate all adjustments in one memoized function
  const calculateAdjustments = () => {
    if (!conditions) return null;

    // Set all environmental conditions
    yardageModel.set_conditions(
      conditions.temperature,
      conditions.altitude,
      0, // No wind in basic calculator
      0,
      conditions.pressure,
      conditions.humidity
    );

    // Calculate adjusted distance using the model's built-in physics
    const result = yardageModel.calculate_adjusted_yardage(
      targetYardage,
      SkillLevel.INTERMEDIATE,
      'driver'
    );

    return {
      adjustedYardage: result.carry_distance,
      totalEffect: result.carry_distance - targetYardage
    };
  };

  const adjustments = useMemo(() => calculateAdjustments(), [conditions, targetYardage])

  // Update context only when needed
  useEffect(() => {
    const now = Date.now()
    if (lastUpdate && now - lastUpdate < 100) return;

    if (conditions && adjustments) {
      setLastUpdate(now)
      setShotCalcData({
        targetYardage,
        elevation: conditions.altitude,
        temperature: conditions.temperature,
        humidity: conditions.humidity,
        pressure: conditions.pressure,
        adjustedDistance: adjustments.adjustedYardage
      })
    }
  }, [conditions, adjustments, targetYardage, setShotCalcData, lastUpdate])

  const recommendedClub = useMemo(() => 
    adjustments ? getRecommendedClub(adjustments.adjustedYardage) : null, 
    [adjustments, getRecommendedClub]
  )

  return (
    <div className="flex flex-col gap-6 pb-32">
      {/* Target Distance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Target Distance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              value={targetYardage}
              onChange={(e) => setTargetYardage(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-muted-foreground">yds</span>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Conditions Card */}
      {conditions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="w-5 h-5" />
              Environmental Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Temperature</span>
                </div>
                <div className="text-lg">{formatTemperature(conditions.temperature)}</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Humidity</span>
                </div>
                <div className="text-lg">{conditions.humidity}%</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Mountain className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Altitude</span>
                </div>
                <div className="text-lg">{formatAltitude(conditions.altitude)}</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Pressure</span>
                </div>
                <div className="text-lg">{conditions.pressure} mb</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shot Adjustments Card */}
      {conditions && adjustments && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Shot Adjustments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span>Total Adjustment</span>
                <span className={cn(
                  "font-mono",
                  adjustments.totalEffect > 0 ? "text-green-500" : 
                  adjustments.totalEffect < 0 ? "text-red-500" : ""
                )}>
                  {adjustments.totalEffect > 0 ? "+" : ""}
                  {adjustments.totalEffect} yds
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span>Playing Distance</span>
                <span className="font-mono">
                  {adjustments.adjustedYardage} yds
                </span>
              </div>
              {recommendedClub && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span>Recommended Club</span>
                    <span className="font-mono">
                      {recommendedClub}
                    </span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Premium Features Teaser */}
      {!isPremium && (
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Premium Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-gray-400">
                Upgrade to access advanced features:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Wind adjustments</li>
                <li>Shot shape optimization</li>
                <li>Club-specific calculations</li>
                <li>Historical shot tracking</li>
              </ul>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}