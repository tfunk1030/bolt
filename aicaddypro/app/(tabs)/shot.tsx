// shot.tsx (mobile)
import * as React from 'react'
import { View, ScrollView, Text, StyleSheet, AppState, Alert } from 'react-native'
import { useEnvironmental } from '@/src/hooks/useEnvironmental'
import { useClubSettings } from '@/src/features/settings/context/clubs'
import { useSettings } from '@/src/core/context/settings'
import { useShotCalc } from '@/src/core/context/shotcalc'
import { YardageModelEnhanced, SkillLevel } from '@/src/core/models/YardageModel'
import { Gauge, Mountain, Thermometer, Droplets } from 'lucide-react-native'
import { normalizeClubName } from '@/src/features/settings/utils/club-mapping'
import { Card } from '@/src/core/components/ui/card'
import { Slider } from '@miblanchard/react-native-slider'
import { Button } from '@/src/core/components/ui/button'

const convertDistance = (value: number, unit: 'meters' | 'yards'): number => {
  return unit === 'meters' ? value * 0.9144 : value
}

interface ConditionIconProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

const ConditionIcon: React.FC<ConditionIconProps> = ({ icon: Icon, label, value }) => (
  <View style={styles.conditionItem}>
    <View style={styles.iconContainer}>
      <Icon size={16} color="#60A5FA" />
    </View>
    <Text style={styles.conditionLabel}>{label}</Text>
    <Text style={styles.conditionValue}>{value}</Text>
  </View>
)

export default function ShotCalculatorScreen() {
  const { conditions } = useEnvironmental()
  const { getRecommendedClub } = useClubSettings()
  const { settings, formatDistance, formatTemperature, formatAltitude } = useSettings()
  const { setShotCalcData } = useShotCalc()
  const [targetYardage, setTargetYardage] = React.useState(150)
  const [lastUpdate, setLastUpdate] = React.useState<number | null>(null)
  const [yardageModel] = React.useState(() => new YardageModelEnhanced())

  const calculateShot = React.useCallback(() => {
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

  const shotData = React.useMemo(() => calculateShot(), [calculateShot])

  React.useEffect(() => {
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

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // Handle app state changes if needed
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  React.useEffect(() => {
    const handleError = (error: Error) => {
      console.error('Shot calculator error:', error);
      Alert.alert('Error', error.message);
    };

    const handleErrorEvent = (event: ErrorEvent) => {
      console.error('Shot calculator error:', event.error);
      Alert.alert('Error', event.error?.message || 'An error occurred');
    };

    // Note: React Native handles errors differently than web
    // This is a basic error handling implementation
    // You might want to use a more robust error boundary solution

    return () => {
      // Cleanup
    };
  }, []);

  if (!conditions) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingPulse} />
        <View style={[styles.loadingPulse, { height: 200 }]} />
        <View style={[styles.loadingPulse, { width: '50%' }]} />
      </View>
    )
  }

  // Used for displaying shot adjustments in the UI
  const formatAdjustment = (yards: number) => {
    const value = settings.distanceUnit === 'meters' 
      ? convertDistance(Math.abs(yards), 'meters')
      : Math.abs(yards)
    
    return `${yards >= 0 ? '+' : '-'}${Math.round(value)} ${
      settings.distanceUnit === 'yards' ? 'yds' : 'm'
    }`
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shot Calculator</Text>

      <Card style={styles.environmentCard}>
        <View style={styles.environmentRow}>
          <ConditionIcon icon={Gauge} label="Density" value={conditions?.density?.toFixed(3) ?? 'N/A'} />
          <ConditionIcon icon={Mountain} label="Altitude" value={formatAltitude(conditions.altitude)} />
          <ConditionIcon icon={Thermometer} label="Temp" value={formatTemperature(conditions.temperature)} />
          <ConditionIcon icon={Droplets} label="Humidity" value={`${conditions.humidity.toFixed(0)}%`} />
        </View>
      </Card>

      <Card style={styles.sliderCard}>
        <Text style={styles.sliderLabel}>Target Distance</Text>
        <View style={styles.sliderContainer}>
          <Slider
            minimumValue={settings.distanceUnit === 'yards' ? 50 : 45}
            maximumValue={settings.distanceUnit === 'yards' ? 360 : 330}
            value={targetYardage}
            onValueChange={(value: number[]) => setTargetYardage(value[0])}
            minimumTrackTintColor="#3B82F6"
            maximumTrackTintColor="#374151"
            thumbTintColor="#3B82F6"
          />
          <Text style={styles.distanceValue}>
            {formatDistance(targetYardage)}
          </Text>
        </View>
      </Card>

      {shotData && (
        <Card style={styles.adjustmentCard}>
          <Text style={styles.sectionTitle}>Shot Adjustment</Text>
          <View style={styles.adjustmentContent}>
            <View style={styles.adjustmentRow}>
              <Text>Environmental Effect</Text>
              <Text style={[
                styles.adjustmentValue,
                targetYardage >= shotData.result.carry_distance 
                  ? styles.adjustmentNegative 
                  : styles.adjustmentPositive
              ]}>
                {formatAdjustment(targetYardage - shotData.result.carry_distance)}
              </Text>
            </View>
            <View style={styles.adjustmentRow}>
              <Text>Plays Like</Text>
              <Text style={styles.adjustmentValue}>
                {formatDistance(targetYardage * (targetYardage / shotData.result.carry_distance))}
              </Text>
            </View>
          </View>
        </Card>
      )}

      {shotData?.recommendedClub && (
        <Card style={styles.clubCard}>
          <Text style={styles.sectionTitle}>Recommended Clubs</Text>
          <View style={styles.clubContent}>
            {(() => {
              const playsLikeDistance = targetYardage * (targetYardage / shotData.result.carry_distance)
              const exactClub = getRecommendedClub(playsLikeDistance)
              const isExactMatch = exactClub?.yardage === Math.round(playsLikeDistance)

              if (isExactMatch) {
                return (
                  <View style={styles.exactMatch}>
                    <View style={styles.clubRow}>
                      <Text style={styles.clubLabel}>Perfect Club</Text>
                      <Text style={styles.clubValue}>{exactClub.name}</Text>
                    </View>
                    <View style={styles.clubRow}>
                      <Text style={styles.clubLabel}>Normal Carry</Text>
                      <Text style={styles.clubValue}>{formatDistance(exactClub.yardage)}</Text>
                    </View>
                  </View>
                )
              }

              return (
                <View style={styles.alternativeClubs}>
                  <View style={styles.clubSection}>
                    <Text style={styles.clubTitle}>Longer Option</Text>
                    <View style={styles.clubRow}>
                      <Text style={styles.clubLabel}>Club</Text>
                      <Text style={styles.clubValue}>
                        {getRecommendedClub(playsLikeDistance + 7)?.name || shotData.recommendedClub.name}
                      </Text>
                    </View>
                    <View style={styles.clubRow}>
                      <Text style={styles.clubLabel}>Normal Carry</Text>
                      <Text style={styles.clubValue}>
                        {formatDistance(getRecommendedClub(playsLikeDistance + 7)?.yardage || shotData.recommendedClub.yardage)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.clubSection}>
                    <Text style={styles.clubTitle}>Shorter Option</Text>
                    <View style={styles.clubRow}>
                      <Text style={styles.clubLabel}>Club</Text>
                      <Text style={styles.clubValue}>
                        {getRecommendedClub(playsLikeDistance)?.name || shotData.recommendedClub.name}
                      </Text>
                    </View>
                    <View style={styles.clubRow}>
                      <Text style={styles.clubLabel}>Normal Carry</Text>
                      <Text style={styles.clubValue}>
                        {formatDistance(getRecommendedClub(playsLikeDistance)?.yardage || shotData.recommendedClub.yardage)}
                      </Text>
                    </View>
                  </View>
                </View>
              )
            })()}
          </View>
        </Card>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#111827'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16
  },
  environmentCard: {
    marginBottom: 16,
    padding: 12
  },
  environmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  conditionItem: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  conditionLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  conditionValue: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '500',
  },
  sliderCard: {
    marginBottom: 16,
    padding: 16,
  },
  cardTitle: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  sliderContainer: {
    marginTop: 8,
  },
  distanceValue: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  resultsCard: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 16,
  },
  clubContent: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    overflow: 'hidden',
  },
  exactMatch: {
    padding: 16,
  },
  alternativeClubs: {
    flexDirection: 'column',
  },
  clubSection: {
    padding: 16,
  },
  clubTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 12,
  },
  clubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  clubLabel: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  clubValue: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
  },
});
