import React from 'react'
import { Pressable, Text, StyleSheet, PressableProps, ViewStyle, TextStyle } from 'react-native'

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant
  size?: ButtonSize
  children?: React.ReactNode
}

interface ButtonStyles {
  base: ViewStyle
  default: ViewStyle
  destructive: ViewStyle
  outline: ViewStyle
  secondary: ViewStyle
  ghost: ViewStyle
  link: ViewStyle
  sizeSm: ViewStyle
  sizeDefault: ViewStyle
  sizeLg: ViewStyle
  sizeIcon: ViewStyle
  text: TextStyle
  defaultText: TextStyle
  destructiveText: TextStyle
  outlineText: TextStyle
  secondaryText: TextStyle
  ghostText: TextStyle
  linkText: TextStyle
  disabled: ViewStyle
}

export function Button({ 
  variant = 'default', 
  size = 'default',
  children,
  ...props 
}: ButtonProps) {
  const sizeStyle = `size${size.charAt(0).toUpperCase()}${size.slice(1)}` as keyof ButtonStyles

  return (
    <Pressable
      {...props}
      style={[
        styles.base,
        styles[variant],
        styles[sizeStyle],
        props.disabled && styles.disabled
      ]}
    >
      <Text style={[
        styles.text,
        styles[`${variant}Text` as keyof ButtonStyles]
      ]}>
        {children}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create<ButtonStyles>({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  // Variant styles
  default: {
    backgroundColor: '#0284C7', // primary color
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
})
