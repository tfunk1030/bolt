import React from 'react';
import { TouchableOpacity, Text, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';

export const Button = ({
  onPress,
  children,
  style
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => {
  return (
    <TouchableOpacity 
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#007bff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
