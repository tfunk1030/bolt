declare module 'react-native' {
  import React from 'react';

  export interface ViewStyle {
    [key: string]: any;
  }

  export interface TextStyle {
    [key: string]: any;
  }

  export interface ImageStyle {
    [key: string]: any;
  }

  export type StyleProp<T> = T | Array<T>;
  export type ColorValue = string;

  export interface ViewProps {
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export interface TextProps {
    style?: StyleProp<TextStyle>;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export interface ImageProps {
    style?: StyleProp<ImageStyle>;
    source: { uri: string } | number;
    [key: string]: any;
  }

  export interface ActivityIndicatorProps extends ViewProps {
    animating?: boolean;
    color?: string;
    size?: 'small' | 'large' | number;
  }

  export const View: React.ComponentType<ViewProps>;
  export const Text: React.ComponentType<TextProps>;
  export const Image: React.ComponentType<ImageProps>;
  export const ActivityIndicator: React.ComponentType<ActivityIndicatorProps>;

  export interface TouchableOpacityProps extends ViewProps {
    onPress?: () => void;
    activeOpacity?: number;
  }

  export const TouchableOpacity: React.ComponentType<TouchableOpacityProps>;

  export interface ScrollViewProps extends ViewProps {
    horizontal?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    showsVerticalScrollIndicator?: boolean;
  }

  export const ScrollView: React.ComponentType<ScrollViewProps>;

  export interface TextInputProps extends ViewProps {
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  }

  export const TextInput: React.ComponentType<TextInputProps>;

  export interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }

  export interface AlertOptions {
    cancelable?: boolean;
    onDismiss?: () => void;
  }

  export interface AlertStatic {
    alert: (
      title: string,
      message?: string,
      buttons?: AlertButton[],
      options?: AlertOptions
    ) => void;
  }

  export const Alert: AlertStatic;

  export interface PlatformStatic {
    OS: 'ios' | 'android' | 'web';
    Version: number | string;
    select: <T extends Record<string, any>>(specifics: T) => T[keyof T];
  }

  export const Platform: PlatformStatic;

  export function useColorScheme(): 'light' | 'dark' | null;
}
