import * as React from 'react';
import { View, ScrollView, TextInput, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEnvironmental } from '../../hooks/useEnvironmental';
import { useShotCalc } from '../../core/context/shotcalc';
import WindDirectionCompass from './components/compass';
import { YardageModelEnhanced, SkillLevel } from '../../core/models/YardageModel';
import { Button } from '../../core/components/ui/button';
import { Card } from '../../core/components/ui/card';
import { usePremium } from '../settings/context/premium';
import { useClubSettings } from '../settings/context/clubs';
import { normalizeClubName } from '../settings/utils/club-mapping';

export default function WindCalcScreen() {
  const navigation = useNavigation();
  const { isPremium } = usePremium();
  const { shotCalcData } = useShotCalc();
  const { conditions } = useEnvironmental();
  const { getRecommendedClub } = useClubSettings();
  const [windDirection, setWindDirection] = React.useState(0);
  const [windSpeed, setWindSpeed] = React.useState('10');
  const [targetYardage, setTargetYardage] = React.useState('150');
  const [result, setResult] = React.useState<{
    adjustedYardage: number;
    windEffect: number;
    club: string;
  } | null>(null);
  const [yardageModel] = React.useState(() => new YardageModelEnhanced());

  React.useEffect(() => {
    if (shotCalcData.targetYardage) {
      setTargetYardage(shotCalcData.targetYardage.toString());
    }
  }, [shotCalcData.targetYardage]);

  React.useEffect(() => {
    if (!isPremium) {
      navigation.goBack();
    }
  }, [isPremium, navigation]);

  const calculateWindEffect = React.useCallback(() => {
    if (!conditions) return;

    const numericTargetYardage = parseInt(targetYardage) || 150;
    const numericWindSpeed = parseInt(windSpeed) || 0;
    const recommendedClub = getRecommendedClub(numericTargetYardage);

    if (!recommendedClub) return;

    try {
      const clubKey = normalizeClubName(recommendedClub.name);
      if (!yardageModel.clubExists(clubKey)) return;

      yardageModel.set_ball_model("tour_premium");
      yardageModel.set_conditions(
        conditions.temperature,
        conditions.altitude,
        numericWindSpeed,
        windDirection,
        conditions.pressure,
        conditions.humidity
      );

      const envResult = yardageModel.calculate_adjusted_yardage(
        numericTargetYardage,
        SkillLevel.PROFESSIONAL,
        clubKey
      );

      const windResult = yardageModel.calculate_adjusted_yardage(
        numericTargetYardage,
        SkillLevel.PROFESSIONAL,
        clubKey
      );

      const envEffect = -(envResult.carry_distance - numericTargetYardage);
      const windEffect = -(windResult.carry_distance - envResult.carry_distance);
      const lateralEffect = windResult.lateral_movement;

      setResult({
        environmentalEffect: envEffect,
        windEffect: windEffect,
        lateralEffect: lateralEffect,
        totalDistance: windResult.carry_distance,
        recommendedClub: recommendedClub.name
      });
    } catch (error) {
      console.error('Calculation error:', error);
    }
  }, [conditions, targetYardage, windSpeed, windDirection]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Wind Calculator</Text>

      <Card style={styles.card}>
        <View style={styles.compassContainer}>
          <WindDirectionCompass
            windDirection={windDirection}
            shotDirection={0}
            onChange={(type, degrees) => setWindDirection(degrees)}
            size={280}
            lockShot={true}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Wind Speed (mph)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={windSpeed}
            onChangeText={setWindSpeed}
            placeholder="10"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target Distance</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={targetYardage}
            onChangeText={setTargetYardage}
            placeholder="150"
          />
        </View>

        <Button onPress={calculateWindEffect}>Calculate</Button>
      </Card>

      {result && (
        <Card style={styles.resultCard}>
          <Text style={styles.resultTitle}>
            Adjusted Distance:{" "}
            <Text style={styles.resultHighlight}>
              {Math.round(result.totalDistance)} yds
            </Text>
          </Text>
          
          <View style={styles.effectsGrid}>
            <View style={styles.effectBox}>
              <Text style={styles.effectLabel}>Environment Effect</Text>
              <Text style={[
                styles.effectValue,
                { color: result.environmentalEffect > 0 ? '#2ecc71' : '#e74c3c' }
              ]}>
                {Math.round(result.environmentalEffect)} yds
              </Text>
            </View>

            <View style={styles.effectBox}>
              <Text style={styles.effectLabel}>Wind Effect</Text>
              <Text style={[
                styles.effectValue,
                { color: result.windEffect > 0 ? '#2ecc71' : '#e74c3c' }
              ]}>
                {Math.round(result.windEffect)} yds
              </Text>
            </View>

            <View style={styles.effectBox}>
              <Text style={styles.effectLabel}>Lateral Adjustment</Text>
              <Text style={[
                styles.effectValue,
                { color: result.lateralEffect !== 0 ? '#e74c3c' : '#ffffff' }
              ]}>
                {Math.abs(result.lateralEffect)} yds {result.lateralEffect > 0 ? 'left' : 'right'}
              </Text>
            </View>

            <View style={styles.effectBox}>
              <Text style={styles.effectLabel}>Recommended Club</Text>
              <Text style={styles.effectValue}>
                {result.club}
              </Text>
            </View>
          </View>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#111827',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
  },
  compassContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#9CA3AF',
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#1F2937',
    color: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  button: {
    marginTop: 8,
  },
  resultCard: {
    marginTop: 16,
  },
  resultTitle: {
    fontSize: 18,
    color: '#9CA3AF',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultHighlight: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  effectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  effectBox: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 16,
    flex: 1,
    minWidth: '48%',
    borderWidth: 1,
    borderColor: '#374151',
  },
  effectLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  effectValue: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '600',
  },
});
