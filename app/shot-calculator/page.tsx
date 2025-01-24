'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { useEnvironmental } from '@/lib/hooks/use-environmental'
import { useClubSettings } from '@/lib/club-settings-context'
import { usePremium } from '@/lib/premium-context'
import { useSettings } from '@/lib/settings-context'
import { useShotCalc } from '@/lib/shot-calc-context'
import { YardageModelEnhanced, SkillLevel } from '@/lib/latetso1model'
import {
  Gauge,
  Thermometer,
  Droplets,
  Mountain
} from '@tamagui/lucide-icons'
import { normalizeClubName } from '@/lib/utils/club-mapping'

function convertDistance(value: number, unit: 'meters' | 'yards'): number {
  return unit === 'meters' ? value * 0.9144 : value
}

import { Button, H1, H2, H3, Paragraph, XStack, YStack, Slider, Card, Text, Separator } from 'tamagui'
import { z } from 'zod'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ShotCalculatorPage() {
  const insets = useSafeAreaInsets()
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
      console.log('YardageModel initialized:', !!yardageModel);
      console.log('YardageModel methods:', Object.keys(yardageModel));
      
      const clubKey = normalizeClubName(recommendedClub.name);
      console.log('Mapped Club Key:', clubKey);
      
      // Validate recommended club against model
      if (!yardageModel.clubExists(clubKey)) {
        console.error('Club not supported:', clubKey);
        return null;
      }

      // Ensure model is initialized
      if (!yardageModel.set_ball_model) {
        console.error('Model not properly initialized');
        return null;
      }

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

      return {
        result,
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
      <YStack flex={1} backgroundColor="$gray900" padding="$4">
        <YStack enterStyle={{ opacity: 0 }} opacity={0.5} space="$4">
          <YStack height="$2" backgroundColor="$gray800" width="25%" borderRadius={4} />
          <YStack height="$12" backgroundColor="$gray800" borderRadius={4} />
          <YStack height="$2" backgroundColor="$gray800" width="50%" borderRadius={4} />
        </YStack>
      </YStack>
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
    <YStack
      flex={1}
      padding="$4"
      paddingTop={insets.top}
      backgroundColor="$background"
      space="$4"
    >
      <H1 fontSize="$3" fontWeight="600">Shot Calculator</H1>

      {/* Environmental Conditions - Streamlined */}
      <XStack backgroundColor="$gray800" borderRadius={16} padding="$3" marginBottom="$6"
        justifyContent="space-between" alignItems="center">
        <XStack gap="$6">
          {/* Air Density */}
          <XStack gap="$2" alignItems="center">
            <YStack width={24} height={24} backgroundColor="$blue500/20" borderRadius={12}
              justifyContent="center" alignItems="center">
              <Gauge width={12} height={12} color="$blue400" />
            </YStack>
            <YStack>
              <Text fontSize={12} color="$color10">Density</Text>
              <Text fontSize={14}>{conditions?.density?.toFixed(3) ?? 'N/A'}</Text>
            </YStack>
          </XStack>

          {/* Altitude */}
          <XStack gap="$2" alignItems="center">
            <YStack width={24} height={24} backgroundColor="$blue500/20" borderRadius={12}
              justifyContent="center" alignItems="center">
              <Mountain width={12} height={12} color="$blue400" />
            </YStack>
            <YStack>
              <Text fontSize={12} color="$color10">Altitude</Text>
              <Text fontSize={14}>{formatAltitude(conditions.altitude)}</Text>
            </YStack>
          </XStack>

          {/* Temperature */}
          <XStack gap="$2" alignItems="center">
            <YStack width={24} height={24} backgroundColor="$blue500/20" borderRadius={12}
              justifyContent="center" alignItems="center">
              <Thermometer width={12} height={12} color="$blue400" />
            </YStack>
            <YStack>
              <Text fontSize={12} color="$color10">Temp</Text>
              <Text fontSize={14}>{formatTemperature(conditions.temperature)}</Text>
            </YStack>
          </XStack>

          {/* Humidity */}
          <XStack gap="$2" alignItems="center">
            <YStack width={24} height={24} backgroundColor="$blue500/20" borderRadius={12}
              justifyContent="center" alignItems="center">
              <Droplets width={12} height={12} color="$blue400" />
            </YStack>
            <YStack>
              <Text fontSize={12} color="$color10">Humidity</Text>
              <Text fontSize={14}>{conditions.humidity.toFixed(0)}%</Text>
            </YStack>
          </XStack>
        </XStack>
      </XStack>

      {/* Target Distance Input */}
      <Card backgroundColor="$gray800" borderRadius={16} padding="$6" marginBottom="$6">
        <Text fontSize="$1" color="$color10" marginBottom="$2">Target Distance</Text>
        <XStack alignItems="center" gap="$4">
          <Slider
            flex={1}
            min={settings.distanceUnit === 'yards' ? 50 : 45}
            max={settings.distanceUnit === 'yards' ? 360 : 330}
            value={[targetYardage]}
            onValueChange={([val]) => setTargetYardage(val)}
            size="$2"
          >
            <Slider.Track backgroundColor="$gray700">
              <Slider.TrackActive backgroundColor="$blue500" />
            </Slider.Track>
            <Slider.Thumb circular index={0} />
          </Slider>
          <Text fontSize={24} fontWeight="700" minWidth={40} textAlign="right">
            {formatDistance(targetYardage)}
          </Text>
        </XStack>
      </Card>

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
              <div className="text-sm text-gray-400">Play's Like</div>
              <Text fontSize={18} fontWeight="700">
                {formatDistance(targetYardage * (targetYardage / shotData.result.carry_distance))}
              </Text>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Clubs */}
      {shotData?.recommendedClub && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recommended Clubs</h2>
          
          {/* Calculate the "plays like" distance */}
          {(() => {
            const playsLikeDistance = targetYardage * (targetYardage / shotData.result.carry_distance)
            
            // Find the club that matches the plays-like distance exactly (if any)
            const exactClub = getRecommendedClub(playsLikeDistance)
            const isExactMatch = exactClub?.normalYardage === Math.round(playsLikeDistance)
            
              return isExactMatch ? (
                <YStack space="$2">
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text color="$color10">Perfect Club</Text>
                    <Text fontWeight="700" fontSize={20}>{exactClub.name}</Text>
                  </XStack>
                    <XStack justifyContent="space-between">
                    <Text color="$color10">Normal Carry</Text>
                    <Text>{formatDistance(exactClub.normalYardage)}</Text>
                  </XStack>
                </YStack>
              ) : (
                <YStack space="$4">
                  {/* Longer Club */}
                  <YStack space="$2">
                    <XStack justifyContent="space-between" alignItems="center">
                      <Text color="$color10">Longer Option</Text>
                      <Text fontWeight="700" fontSize={18}>
                        {getRecommendedClub(playsLikeDistance + 7)?.name || shotData.recommendedClub.name}
                      </Text>
                    </XStack>
                    <XStack justifyContent="space-between">
                      <Text color="$color10">Normal Carry</Text>
                      <Text>
                        {formatDistance(getRecommendedClub(playsLikeDistance + 7)?.normalYardage || shotData.recommendedClub.normalYardage)}
                      </Text>
                    </XStack>
                  </YStack>

                  <Separator borderColor="$borderColor" />

                  {/* Shorter Club */}
                  <YStack space="$2">
                    <XStack justifyContent="space-between" alignItems="center">
                      <Text color="$color10">Shorter Option</Text>
                      <Text fontWeight="700" fontSize={18}>
                        {getRecommendedClub(playsLikeDistance)?.name || shotData.recommendedClub.name}
                      </Text>
                    </XStack>
                    <XStack justifyContent="space-between">
                      <Text color="$color10">Normal Carry</Text>
                      <Text>
                        {formatDistance(getRecommendedClub(playsLikeDistance)?.normalYardage || shotData.recommendedClub.normalYardage)}
                      </Text>
                    </XStack>
                  </YStack>
                </YStack>
            )
          })()}
        </div>
      )}
    </YStack>
  )
}
