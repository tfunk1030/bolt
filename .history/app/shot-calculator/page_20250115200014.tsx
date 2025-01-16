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
      <Card>
        <CardHeader>
          <CardTitle>Target Distance</CardTitle>
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

      {conditions && adjustments && (
        <Card>
          <CardHeader>
            <CardTitle>Shot Adjustments</CardTitle>
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}