import * as React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Slider } from '@miblanchard/react-native-slider'
import { useEnvironmental } from '../../../src/hooks/useEnvironmental'
import { useClubSettings } from '../../../src/features/settings/context/clubs'
import { usePremium } from '../../../src/features/settings/context/premium'
import { useSettings } from '../../../src/core/context/settings'
import { useShotCalc } from '../../../src/core/context/shotcalc'
import { YardageModelEnhanced, SkillLevel } from '../../../src/core/models/YardageModel'
import { Gauge, Mountain, Thermometer, Droplets } from 'lucide-react-native'
import { normalizeClubName } from '../../../src/features/settings/utils/club-mapping'
import { Card } from '../../../src/core/components/ui/card'
import { Button } from '../../../src/core/components/ui/button'

const convertDistance = (value: number, unit: 'meters' | 'yards'): number => {
  return unit === 'meters' ? value * 0.9144 : value
}

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

  // Add error boundary for the component
  React.useEffect(() => {
    const handleErrorEvent = (event: Event) => {
      if (event instanceof Error) {
        console.error('Shot calculator error:', event);
      }
    };

    globalThis.addEventListener('error', handleErrorEvent);
    return () => globalThis.removeEventListener('error', handleErrorEvent);
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
        <Text>Target Distance</Text>
        <View style={styles.sliderContainer}>
          <Slider
            minimumValue={settings.distanceUnit === 'yards' ? 50 : 45}
            maximumValue={settings.distanceUnit === 'yards' ? 360 : 330}
            value={targetYardage}
            onValueChange={(value) => setTargetYardage(value[0])}
            minimumTrackTintColor="#3B82F6"
            maximumTrackTintColor="#374151"
            thumbTintColor="#3B82F6"
          />
          <Text style={styles.distanceValue}>
            {formatDistance(targetYardage)}
          </Text>
        </View>
      </Card>

      {/* Remaining components converted similarly */}
    </View>
  )
}

const ConditionIcon = ({ icon: Icon, label, value }) => (
  <View style={styles.conditionItem}>
    <View style={styles.iconContainer}>
      <Icon size={16} color="#60A5FA" />
    </View>
    <Text style={styles.conditionLabel}>{label}</Text>
    <Text style={styles.conditionValue}>{value}</Text>
  </View>
)

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
    justifyContent: 'space-between'
  },
  conditionItem: {
    alignItems: 'center'
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4
  },
  conditionLabel: {
    color: '#9CA3AF',
    fontSize: 12
  },
  conditionValue: {
    color: 'white',
    fontSize: 14
  },
  sliderCard: {
    padding: 16,
    marginBottom: 16
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  slider: {
    flex: 1
  },
  distanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    width: 100,
    textAlign: 'right'
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 32
  },
  loadingPulse: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    marginBottom: 16,
    height: 32
  }
})