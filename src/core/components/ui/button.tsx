import React from 'react';
import { Pressable, Text, StyleSheet, PressableProps, ViewStyle, TextStyle } from 'react-native';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: React.ReactNode;
}

const Button = ({ 
  variant = 'default', 
  size = 'default',
  children,
  ...props 
}: ButtonProps) => {
  const getSizeStyle = () => {
    switch (size) {
      case 'sm': return styles.sizeSm;
      case 'lg': return styles.sizeLg;
      case 'icon': return styles.sizeIcon;
      default: return styles.sizeDefault;
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'destructive': return styles.destructive;
      case 'outline': return styles.outline;
      case 'secondary': return styles.secondary;
      case 'ghost': return styles.ghost;
      case 'link': return styles.link;
      default: return styles.default;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'destructive': return styles.destructiveText;
      case 'outline': return styles.outlineText;
      case 'secondary': return styles.secondaryText;
      case 'ghost': return styles.ghostText;
      case 'link': return styles.linkText;
      default: return styles.defaultText;
    }
  };

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [
        styles.base,
        getSizeStyle(),
        getVariantStyle(),
        props.disabled && styles.disabled,
        pressed && styles.pressed
      ]}
    >
      <Text style={[styles.text, getTextStyle()]}>
        {children}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  pressed: {
    opacity: 0.8,
  },
  // Variant styles
  default: {
    backgroundColor: '#0284C7',
  },
  destructive: {
    backgroundColor: '#EF4444',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondary: {
    backgroundColor: '#F3F4F6',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  link: {
    backgroundColor: 'transparent',
  },
  // Size styles
  sizeSm: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sizeDefault: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sizeLg: {
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  sizeIcon: {
    width: 36,
    height: 36,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Text styles
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  defaultText: {
    color: '#FFFFFF',
  },
  destructiveText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#111827',
  },
  secondaryText: {
    color: '#111827',
  },
  ghostText: {
    color: '#111827',
  },
  linkText: {
    color: '#0284C7',
    textDecorationLine: 'underline',
  },
  // States
  disabled: {
    opacity: 0.5,
  },
});

export { Button };
