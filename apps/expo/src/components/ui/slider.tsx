import { Text, XStack, YStack } from 'tamagui';
import RNSlider from '@react-native-community/slider';
import type { StyleProp, ViewStyle } from 'react-native';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  style?: StyleProp<ViewStyle>;
}

export function CustomSlider({ value, min, max, step = 1, onChange, formatValue, style }: SliderProps) {
  return (
    <YStack padding="$4">
      <XStack justifyContent="space-between" marginBottom="$2">
        <Text color="$gray11">{formatValue ? formatValue(min) : min}</Text>
        <Text color="$gray11">{formatValue ? formatValue(max) : max}</Text>
      </XStack>
      <YStack>
        <RNSlider
          style={[{ width: '100%', height: 40 }, style]}
          value={value}
          minimumValue={min}
          maximumValue={max}
          step={step}
          onValueChange={onChange}
          minimumTrackTintColor="#3B82F6"
          maximumTrackTintColor="#E5E7EB"
          thumbTintColor="#3B82F6"
        />
        <Text textAlign="center" color="$gray12" fontSize="$3" marginTop="$2">
          {formatValue ? formatValue(value) : value}
        </Text>
      </YStack>
    </YStack>
  );
}

// Re-export as Slider for backward compatibility
export { CustomSlider as Slider };
