declare module '@tamagui/core' {
  import { ComponentType } from 'react';
  import { ViewStyle, TextStyle } from 'react-native';

  export interface TamaguiProviderProps {
    config: any;
    children?: React.ReactNode;
  }

  export interface StackProps extends ViewStyle {
    children?: React.ReactNode;
    space?: string;
    flex?: number;
    padding?: string;
    margin?: string;
    marginBottom?: string;
    gap?: string;
    alignItems?: string;
    justifyContent?: string;
  }

  export interface TextProps extends TextStyle {
    children?: React.ReactNode;
    fontSize?: string;
    fontWeight?: string;
    color?: string;
  }

  export interface ButtonProps extends ViewStyle {
    children?: React.ReactNode;
    onPress?: () => void;
    disabled?: boolean;
    opacity?: number;
    color?: string;
    hoverStyle?: ViewStyle;
  }

  export interface InputProps extends ViewStyle {
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
  }

  export interface SpinnerProps extends ViewStyle {
    size?: number | string;
    color?: string;
  }

  export interface IconProps {
    size?: number;
    color?: string;
  }

  export const TamaguiProvider: ComponentType<TamaguiProviderProps>;
  export const YStack: ComponentType<StackProps>;
  export const XStack: ComponentType<StackProps>;
  export const Text: ComponentType<TextProps>;
  export const Button: ComponentType<ButtonProps>;
  export const Input: ComponentType<InputProps>;
  export const Spinner: ComponentType<SpinnerProps>;

  export function useTheme(): {
    background: string;
    foreground: string;
  };

  export function createInterFont(config?: any): any;
}

declare module '@tamagui/lucide-icons' {
  import { ComponentType } from 'react';
  import { IconProps } from '@tamagui/core';

  export const Trash: ComponentType<IconProps>;
  export const Edit: ComponentType<IconProps>;
  export const Plus: ComponentType<IconProps>;
  export const Gauge: ComponentType<IconProps>;
  export const Mountain: ComponentType<IconProps>;
  export const Thermometer: ComponentType<IconProps>;
  export const Droplets: ComponentType<IconProps>;
  export const Target: ComponentType<IconProps>;
  export const ArrowUpRight: ComponentType<IconProps>;
  export const Icon: ComponentType<IconProps>;
}
