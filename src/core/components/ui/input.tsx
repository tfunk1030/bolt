import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';

export interface InputProps extends TextInputProps {}

const Input = React.forwardRef<TextInput, InputProps>(({ 
  style, 
  ...props 
}, ref) => {
  return (
    <TextInput
      ref={ref}
      style={[styles.input, style]}
      placeholderTextColor="#6B7280"
      {...props}
    />
  );
});

const styles = StyleSheet.create({
  input: {
    height: 40,
    width: '100%',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },
});

export { Input };
