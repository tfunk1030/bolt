/// <reference types="react" />
/// <reference types="react-native" />

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';

declare module '@react-native-community/slider' {
  import { ViewStyle } from 'react-native';
  import { Component } from 'react';

  export interface SliderProps {
    value?: number;
    disabled?: boolean;
    minimumValue?: number;
    maximumValue?: number;
    step?: number;
    minimumTrackTintColor?: string;
    maximumTrackTintColor?: string;
    thumbTintColor?: string;
    onValueChange?: (value: number) => void;
    onSlidingComplete?: (value: number) => void;
    style?: ViewStyle;
  }

  export default class Slider extends Component<SliderProps> {}
}

declare module '@tanstack/react-query' {
  export * from '@tanstack/react-query';
}

declare module 'expo-location' {
  export interface LocationObject {
    coords: {
      latitude: number;
      longitude: number;
      altitude: number | null;
      accuracy: number | null;
      altitudeAccuracy: number | null;
      heading: number | null;
      speed: number | null;
    };
    timestamp: number;
  }

  export interface LocationSubscription {
    remove: () => void;
  }

  export interface LocationPermissionResponse {
    status: 'granted' | 'denied';
    granted: boolean;
    canAskAgain: boolean;
  }

  export function requestForegroundPermissionsAsync(): Promise<LocationPermissionResponse>;
  export function getCurrentPositionAsync(options?: any): Promise<LocationObject>;
  export function watchPositionAsync(
    options: any,
    callback: (location: LocationObject) => void
  ): Promise<LocationSubscription>;

  export const Accuracy: {
    Balanced: number;
    High: number;
    Highest: number;
    Low: number;
    Lowest: number;
  };
}

declare module 'expo-constants' {
  interface Constants {
    expoConfig?: {
      extra?: {
        openWeatherApiKey?: string;
      };
    };
  }
  const constants: Constants;
  export default constants;
}
