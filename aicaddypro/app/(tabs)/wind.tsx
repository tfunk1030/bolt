// wind.tsx (mobile)
import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, AppState, Alert, ScrollView } from 'react-native'
import { usePremium } from '@/src/features/settings/context/premium'
import { useShotCalc } from '@/src/core/context/shotcalc'
import { useEnvironmental } from '@/src/hooks/useEnvironmental'
import { useClubSettings } from '@/src/features/settings/context/clubs'
import { YardageModelEnhanced, SkillLevel } from '@/src/core/models/YardageModel'
import { normalizeClubName } from '@/src/features/settings/utils/club-mapping'
import { Card } from '@/src/core/components/ui/card'
import { Slider } from '@miblanchard/react-native-slider'
import { Button } from '@/components/Button'
import WindDirectionCompass from '@/src/features/wind/components/compass'

export default function WindCalcScreen() {
  const { isPremium } = usePremium()
  const { shotCalcData } = useShotCalc()
  const { conditions } = useEnvironmental()
  const { getRecommendedClub } = useClubSettings()

  const [windDirection, setWindDirection] = useState(0)
  const [windSpeed, setWindSpeed] = useState(10)
  const [targetYardage, setTargetYardage] = useState(150)
  const [result, setResult] = useState({
    environmentalEffect: 0,
    windEffect: 0,
    lateralEffect: 0,
    totalDistance: 0,
    recommendedClub: ''
  })
  const [yardageModel] = useState(() => new YardageModelEnhanced())

  useEffect(() => {
    if (shotCalcData.targetYardage) {
      setTargetYardage(shotCalcData.targetYardage)
    }
  }, [shotCalcData.targetYardage])

  useEffect(() => {
    if (!isPremium) {
      // Navigate to home screen if not premium
      // Implement navigation logic here
    }
  }, [isPremium])

  const calculateWindEffect = useCallback(() => {
    if (!conditions) return

    const recommendedClub = getRecommendedClub(targetYardage)
    if (!recommendedClub) return

    try {
      const clubKey = normalizeClubName(recommendedClub.name)

      if (!yardageModel.clubExists(clubKey)) return

      if (!yardageModel.set_ball_model) return

      yardageModel.set_ball_model("tour_premium")

      // Calculate environmental effect without wind
      yardageModel.set_conditions(
        conditions.temperature,
        conditions.altitude,
        0,
        0,
        conditions.pressure,
        conditions.humidity
      )

      const envResult = yardageModel.calculate_adjusted_yardage(
        targetYardage,
        SkillLevel.PROFESSIONAL,
        clubKey
      )

      if (!envResult) return

      // Calculate with wind
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

      if (!windResult) return

      const envEffect = -(envResult.carry_distance - targetYardage)
      const windEffect = -(windResult.carry_distance - envResult.carry_distance)
      const lateralEffect = windResult.lateral_movement

      setResult({
        environmentalEffect: envEffect,
        windEffect: windEffect,
        lateralEffect: lateralEffect,
        totalDistance: targetYardage + envEffect + windEffect,
        recommendedClub: recommendedClub.name
      })

    } catch (error: unknown) {
      console.error('Error calculating wind effect:', error)
      Alert.alert('Error', error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }, [conditions, targetYardage, windSpeed, windDirection])

  if (!isPremium) return null

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
      bounces={true}
      alwaysBounceVertical={true}
    >
      <Text style={styles.title}>Wind Calculator</Text>

      <Card style={styles.mainCard}>
        <View style={styles.compassContainer}>
          <WindDirectionCompass
            windDirection={windDirection}
            shotDirection={0}
            onChange={(type, degrees) => setWindDirection(degrees)}
            size={280}
            lockShot={true}
          />
          <Text style={styles.windDirectionLabel}>
            Wind Direction: {windDirection}°
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Slider
            minimumValue={0}
            maximumValue={30}
            value={windSpeed}
            onValueChange={(value) => setWindSpeed(value[0])}
            minimumTrackTintColor="#3B82F6"
            maximumTrackTintColor="#374151"
            thumbTintColor="#3B82F6"
          />
          <Text style={styles.inputLabel}>
            Wind Speed: {windSpeed} mph
          </Text>

          <Slider
            minimumValue={50}
            maximumValue={300}
            value={targetYardage}
            onValueChange={(value) => setTargetYardage(value[0])}
            minimumTrackTintColor="#3B82F6"
            maximumTrackTintColor="#374151"
            thumbTintColor="#3B82F6"
          />
          <Text style={styles.inputLabel}>
            Target Yardage: {targetYardage}
          </Text>
        </View>

        <Button
          onPress={calculateWindEffect}
          style={styles.button}
        >
          <Text>Calculate Wind Effect</Text>
        </Button>
      </Card>

      {result && (
        <Card style={styles.resultsCard}>
          <View style={styles.resultsContent}>
            <Text style={styles.resultTitle}>
              Play this shot {Math.round(result.totalDistance)} yards
            </Text>
            {result.lateralEffect !== 0 && (
              <Text style={styles.resultSubtitle}>
                Aim {Math.abs(result.lateralEffect)} yards {result.lateralEffect > 0 ? 'left' : 'right'}
              </Text>
            )}
            <View style={styles.effectsGrid}>
              <View style={styles.effectItem}>
                <Text style={styles.effectLabel}>Weather Effect</Text>
                <Text style={[styles.effectValue, result.environmentalEffect < 0 ? styles.positive : styles.negative]}>
                  {result.environmentalEffect > 0 ? '+' : ''}{Math.round(result.environmentalEffect)} yards
                </Text>
              </View>
              <View style={styles.effectItem}>
                <Text style={styles.effectLabel}>Wind Effect</Text>
                <Text style={[styles.effectValue, result.windEffect < 0 ? styles.positive : styles.negative]}>
                  {result.windEffect > 0 ? '+' : ''}{Math.round(result.windEffect)} yards
                </Text>
              </View>
              <View style={styles.effectItem}>
                <Text style={styles.effectLabel}>Total Effect</Text>
                <Text style={[styles.effectValue, (result.environmentalEffect + result.windEffect) < 0 ? styles.positive : styles.negative]}>
                  {(result.environmentalEffect + result.windEffect) > 0 ? '+' : ''}{Math.round(result.environmentalEffect + result.windEffect)} yards
                </Text>
              </View>
              <View style={styles.effectItem}>
                <Text style={styles.effectLabel}>Lateral Effect</Text>
                <Text style={styles.effectValue}>
                  {Math.abs(result.lateralEffect)} yards
                </Text>
              </View>
            </View>
          </View>
        </Card>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32, // Add extra padding at bottom for better scrolling
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center'
  },
  mainCard: {
    marginBottom: 16,
    padding: 16
  },
  compassContainer: {
    alignItems: 'center',
    marginBottom: 24
  },
  windDirectionLabel: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8
  },
  inputContainer: {
    marginBottom: 24
  },
  inputLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16
  },
  resultsCard: {
    padding: 16,
    marginTop: 16
  },
  resultsContent: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 16
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center'
  },
  resultSubtitle: {
    fontSize: 18,
    color: '#10B981',
    marginBottom: 16,
    textAlign: 'center'
  },
  effectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12
  },
  effectItem: {
    backgroundColor: '#111827',
    padding: 12,
    borderRadius: 8,
    width: '45%'
  },
  effectLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4
  },
  effectValue: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  },
  positive: {
    color: '#10B981'
  },
  negative: {
    color: '#EF4444'
  }
})
