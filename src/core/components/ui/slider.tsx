import React from 'react';
import { View, Slider as RNSlider, SliderProps, StyleSheet } from 'react-native';

interface CustomSliderProps extends SliderProps {
  className?: string;
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
