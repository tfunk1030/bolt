import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useEnvironmental } from '@/src/hooks/useEnvironmental';
import { useSettings } from '@/src/core/context/settings';
import { Thermometer, Droplets, Mountain, Gauge, Wind } from 'lucide-react-native';

export default function WeatherScreen() {
  const { conditions } = useEnvironmental();
  const { formatTemperature, formatAltitude } = useSettings();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded || !conditions) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading conditions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Conditions</Text>

      <View style={styles.mainCard}>
        <View style={styles.temperatureContainer}>
          <View style={styles.iconWrapper}>
            <Thermometer size={24} color="#60a5fa" />
          </View>
          <Text style={styles.temperatureText}>
            {formatTemperature(conditions.temperature)}
          </Text>
        </View>
      </View>

      <View style={styles.gridContainer}>
        <View style={styles.gridRow}>
          <ConditionItem
            icon={<Droplets size={20} color="#60a5fa" />}
            label="Humidity"
            value={`${conditions.humidity.toFixed(0)}%`}
          />
          <ConditionItem
            icon={<Mountain size={20} color="#60a5fa" />}
            label="Altitude"
            value={formatAltitude(conditions.altitude)}
          />
        </View>

        <View style={styles.gridRow}>
          <ConditionItem
            icon={<Gauge size={20} color="#60a5fa" />}
            label="Pressure"
            value={`${conditions.pressure.toFixed(0)} hPa`}
          />
          <ConditionItem
            icon={<Wind size={20} color="#60a5fa" />}
            label="Air Density"
            value={`${conditions.density?.toFixed(3)} kg/m³`}
          />
        </View>
      </View>
    </View>
  );
}

const ConditionItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <View style={styles.conditionCard}>
    <View style={styles.conditionHeader}>
      <View style={styles.iconWrapper}>{icon}</View>
      <Text style={styles.conditionLabel}>{label}</Text>
    </View>
    <Text style={styles.conditionValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1f2937',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  mainCard: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  temperatureText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  gridContainer: {
    flexDirection: 'column',
    gap: 16,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  conditionCard: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
  },
  conditionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  conditionLabel: {
    color: '#9ca3af',
    fontSize: 14,
    marginLeft: 8,
  },
  conditionValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});
