import { useCallback, useEffect, useState } from 'react'
import { View, ScrollView, StyleSheet, TextInput, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { usePremium } from '@/src/features/settings/context/premium'
import { useShotCalc } from '@/src/core/context/shot-calc'
import { useEnvironmental } from '@/src/hooks/useEnvironmental'
import { useClubSettings } from '@/src/features/settings/context/clubs'
import { YardageModelEnhanced, SkillLevel } from '@/src/core/models/YardageModel'
import WindDirectionCompass from '@/src/features/wind/components/compass'
import { normalizeClubName } from '@/src/features/settings/utils/club-mapping'

interface WindCalcResult {
  environmentalEffect: number
  windEffect: number
  lateralEffect: number
  totalDistance: number
  recommendedClub: string
}

export default function WindCalcScreen() {
  const { isPremium } = usePremium()
  const router = useRouter()
  const { shotCalcData } = useShotCalc()
  const { conditions } = useEnvironmental()
  const { getRecommendedClub } = useClubSettings()
  
  const [windDirection, setWindDirection] = useState(0)
  const [windSpeed, setWindSpeed] = useState(10)
  const [targetYardage, setTargetYardage] = useState(150)
  const [result, setResult] = useState<WindCalcResult | null>(null)
  const [yardageModel] = useState(() => new YardageModelEnhanced())

  useEffect(() => {
    if (shotCalcData.targetYardage) {
      setTargetYardage(shotCalcData.targetYardage)
    }
  }, [shotCalcData.targetYardage])

  useEffect(() => {
    if (!isPremium) {
      router.replace('/(tabs)')
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
      
      const clubKey = normalizeClubName(recommendedClub.name);
      console.log('Mapped Club Key:', clubKey);

      if (!yardageModel.clubExists(clubKey)) {
        console.error('Club not supported:', clubKey);
        return;
      }

      if (!yardageModel.set_ball_model) {
        console.error('Model not properly initialized');
        return;
      }

      yardageModel.set_ball_model("tour_premium");

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

      if (!envResult) {
        console.error('No environmental result from calculation in environment:', process.env.NODE_ENV);
        return;
      }

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
    } catch (error) {
      console.error('Error calculating wind effect:', error);
    }
  }, [conditions, targetYardage, windSpeed, windDirection])

  if (!isPremium) {
    return null
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Wind Calculator</Text>

        <View style={styles.card}>
          <View style={styles.compassContainer}>
            <View style={styles.windLabel}>
              <View style={styles.windDot} />
              <Text style={styles.windText}>Wind: {windDirection}°</Text>
            </View>
            <Text style={styles.instructions}>
              Drag the blue handle to set wind direction
            </Text>
            <View style={styles.compassWrapper}>
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
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Wind Speed: {windSpeed} mph</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(windSpeed)}
              onChangeText={(value) => setWindSpeed(Number(value))}
              placeholder="Wind Speed"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Target Yardage</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(targetYardage)}
              onChangeText={(value) => setTargetYardage(Number(value))}
              placeholder="Target Yardage"
            />
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={calculateWindEffect}
          >
            <Text style={styles.buttonText}>Calculate Wind Effect</Text>
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>
              Play this shot{' '}
              <Text style={styles.resultHighlight}>
                {Math.round(result.totalDistance)} yards
              </Text>
            </Text>
            
            {result.lateralEffect !== 0 && (
              <Text style={styles.resultTitle}>
                Aim{' '}
                <Text style={[styles.resultHighlight, styles.lateralHighlight]}>
                  {Math.abs(result.lateralEffect)} yards {result.lateralEffect > 0 ? 'left' : 'right'}
                </Text>
              </Text>
            )}

            <View style={styles.effectsGrid}>
              <View style={styles.effectBox}>
                <Text style={styles.effectLabel}>Weather Effect</Text>
                <Text style={[
                  styles.effectValue,
                  result.environmentalEffect < 0 ? styles.positiveEffect : styles.negativeEffect
                ]}>
                  {result.environmentalEffect > 0 ? '+' : ''}{Math.round(result.environmentalEffect)} yards
                </Text>
              </View>

              <View style={styles.effectBox}>
                <Text style={styles.effectLabel}>Wind Effect</Text>
                <Text style={[
                  styles.effectValue,
                  result.windEffect < 0 ? styles.positiveEffect : styles.negativeEffect
                ]}>
                  {result.windEffect > 0 ? '+' : ''}{Math.round(result.windEffect)} yards
                </Text>
              </View>

              <View style={styles.effectBox}>
                <Text style={styles.effectLabel}>Total Effect</Text>
                <Text style={[
                  styles.effectValue,
                  (result.environmentalEffect + result.windEffect) < 0 ? styles.positiveEffect : styles.negativeEffect
                ]}>
                  {(result.environmentalEffect + result.windEffect) > 0 ? '+' : ''}
                  {Math.round(result.environmentalEffect + result.windEffect)} yards
                </Text>
              </View>

              <View style={styles.effectBox}>
                <Text style={styles.effectLabel}>Lateral Effect</Text>
                <Text style={[
                  styles.effectValue,
                  Math.abs(result.lateralEffect) < 5 ? styles.positiveEffect : styles.warningEffect
                ]}>
                  {Math.abs(result.lateralEffect)} yards
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  card: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  compassContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  windLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.5)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 8,
  },
  windDot: {
    width: 8,
    height: 8,
    backgroundColor: '#3b82f6',
    borderRadius: 4,
    marginRight: 8,
  },
  windText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  instructions: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.75,
  },
  compassWrapper: {
    position: 'relative',
  },
  inputContainer: {
    backgroundColor: 'rgba(17, 24, 39, 0.3)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  label: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    color: '#ffffff',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  resultTitle: {
    fontSize: 18,
    color: '#9ca3af',
    marginBottom: 8,
  },
  resultHighlight: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  lateralHighlight: {
    color: '#10b981',
  },
  effectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  effectBox: {
    width: '48%',
    backgroundColor: 'rgba(17, 24, 39, 0.3)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    marginRight: '2%',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  effectLabel: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
  },
  effectValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  positiveEffect: {
    color: '#10b981',
  },
  negativeEffect: {
    color: '#ef4444',
  },
  warningEffect: {
    color: '#f59e0b',
  },
})
