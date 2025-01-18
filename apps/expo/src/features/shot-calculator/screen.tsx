import React, { useState } from 'react';
import { View } from 'react-native';
import { Text, YStack, XStack } from 'tamagui';
import { Card } from '../../components/ui/card';
import { Slider } from '../../components/ui/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEnvironmental } from '../../hooks/use-environmental';
import { useSettings } from '../../providers/settings';
import { useShot } from '../../hooks/use-shot';
import { Gauge, Mountain, Thermometer, Droplets, Target, ArrowUpRight } from '@tamagui/lucide-icons';

export function ShotCalculatorScreen() {
  const { conditions } = useEnvironmental();
  const { formatTemperature, formatAltitude, formatDistance, settings } = useSettings();
  const [targetYardage, setTargetYardage] = useState(150);
  const { shotData } = useShot(targetYardage);

  if (!conditions) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <YStack flex={1} padding="$4" space="$4">
          <Text fontSize="$6" fontWeight="bold">Shot Calculator</Text>
          <Card>
            <Text>Loading environmental conditions...</Text>
          </Card>
        </YStack>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} padding="$4" space="$4">
        <Text fontSize="$6" fontWeight="bold">
          Shot Calculator
        </Text>

        {/* Environmental Conditions */}
        <Card>
          <XStack space="$4" justifyContent="space-between">
            {/* Air Density */}
            <XStack space="$2" alignItems="center">
              <View style={{ 
                width: 24, 
                height: 24, 
                backgroundColor: 'rgba(59, 130, 246, 0.2)', 
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Gauge size={12} color="$blue10" />
              </View>
              <YStack>
                <Text color="$gray11" fontSize="$2">Density</Text>
                <Text fontSize="$2">{conditions?.density?.toFixed(3) ?? 'N/A'}</Text>
              </YStack>
            </XStack>

            {/* Altitude */}
            <XStack space="$2" alignItems="center">
              <View style={{ 
                width: 24, 
                height: 24, 
                backgroundColor: 'rgba(59, 130, 246, 0.2)', 
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Mountain size={12} color="$blue10" />
              </View>
              <YStack>
                <Text color="$gray11" fontSize="$2">Altitude</Text>
                <Text fontSize="$2">{formatAltitude(conditions.altitude)}</Text>
              </YStack>
            </XStack>

            {/* Temperature */}
            <XStack space="$2" alignItems="center">
              <View style={{ 
                width: 24, 
                height: 24, 
                backgroundColor: 'rgba(59, 130, 246, 0.2)', 
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Thermometer size={12} color="$blue10" />
              </View>
              <YStack>
                <Text color="$gray11" fontSize="$2">Temp</Text>
                <Text fontSize="$2">{formatTemperature(conditions.temperature)}</Text>
              </YStack>
            </XStack>

            {/* Humidity */}
            <XStack space="$2" alignItems="center">
              <View style={{ 
                width: 24, 
                height: 24, 
                backgroundColor: 'rgba(59, 130, 246, 0.2)', 
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Droplets size={12} color="$blue10" />
              </View>
              <YStack>
                <Text color="$gray11" fontSize="$2">Humidity</Text>
                <Text fontSize="$2">{conditions.humidity.toFixed(0)}%</Text>
              </YStack>
            </XStack>
          </XStack>
        </Card>

        {/* Target Distance Input */}
        <Card>
          <Slider
            value={targetYardage}
            min={settings.distanceUnit === 'yards' ? 50 : 45}
            max={settings.distanceUnit === 'yards' ? 360 : 330}
            step={1}
            onChange={setTargetYardage}
            formatValue={formatDistance}
          />
        </Card>

        {/* Shot Results */}
        {shotData && (
          <Card>
            <YStack space="$4">
              <Text fontSize="$5" fontWeight="bold" textAlign="center">
                Shot Details
              </Text>
              
              <XStack space="$4" justifyContent="space-between">
                {/* Target Distance */}
                <XStack space="$2" alignItems="center">
                  <View style={{ 
                    width: 24, 
                    height: 24, 
                    backgroundColor: 'rgba(59, 130, 246, 0.2)', 
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Target size={12} color="$blue10" />
                  </View>
                  <YStack>
                    <Text color="$gray11" fontSize="$2">Target</Text>
                    <Text fontSize="$2">{formatDistance(targetYardage)}</Text>
                  </YStack>
                </XStack>

                {/* Adjusted Distance */}
                <XStack space="$2" alignItems="center">
                  <View style={{ 
                    width: 24, 
                    height: 24, 
                    backgroundColor: 'rgba(59, 130, 246, 0.2)', 
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ArrowUpRight size={12} color="$blue10" />
                  </View>
                  <YStack>
                    <Text color="$gray11" fontSize="$2">Plays Like</Text>
                    <Text fontSize="$2">{formatDistance(shotData.result.carry_distance)}</Text>
                  </YStack>
                </XStack>
              </XStack>

              {/* Club Recommendation */}
              <YStack space="$2" alignItems="center">
                <Text color="$gray11" fontSize="$3">Recommended Club</Text>
                <Text fontSize="$4" fontWeight="bold">
                  {shotData.recommendedClub.name}
                </Text>
              </YStack>
            </YStack>
          </Card>
        )}
      </YStack>
    </SafeAreaView>
  );
}
