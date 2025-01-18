import { View } from 'react-native';
import { Text, YStack } from '@tamagui/core';
import { SafeAreaView } from 'react-native-safe-area-context';

export function WindCalculatorScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} padding="$4">
        <Text fontSize="$6" fontWeight="bold">
          Wind Calculator
        </Text>
        <View style={{ flex: 1 }}>
          {/* Wind calculator content will go here */}
        </View>
      </YStack>
    </SafeAreaView>
  );
}
