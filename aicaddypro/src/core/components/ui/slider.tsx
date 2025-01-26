import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slider as RNSlider } from '@miblanchard/react-native-slider';

interface CustomSliderProps extends Omit<React.ComponentProps<typeof RNSlider>, 'minimumValue' | 'maximumValue'> {
  minimumValue?: number;
  maximumValue?: number;
  className?: string;
  style?: any;
}

const Slider = ({ 
  style,
  minimumValue = 0,
  maximumValue = 100,
  ...props 
}: CustomSliderProps) => {
  return (
    <View style={[styles.container, style]}>
      <RNSlider
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        minimumTrackTintColor="#0284C7"
        maximumTrackTintColor="#E5E7EB"
        thumbTintColor="#0284C7"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
  },
});

export { Slider };
