declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    getAllKeys(): Promise<string[]>;
  };
  export default AsyncStorage;
}

declare module 'nanoid' {
  export function nanoid(size?: number): string;
}

declare module '@tamagui/core' {
  import { ComponentType } from 'react';

  export interface GetProps<T> {
    [key: string]: any;
  }

  export const Button: ComponentType<any>;
  export const Text: ComponentType<any>;
  export const YStack: ComponentType<any>;
  export const XStack: ComponentType<any>;
  export const styled: any;
  export const createTamagui: any;
}

declare module '@tamagui/font-inter' {
  export function createInterFont(): any;
}

declare module '@tamagui/shorthands' {
  const shorthands: any;
  export default shorthands;
  export { shorthands };
}

declare module '@tamagui/themes' {
  const themes: any;
  const tokens: any;
  export default themes;
  export { themes, tokens };
}

declare module '@tamagui/lucide-icons' {
  import { ComponentType } from 'react';
  import { SvgProps } from 'react-native-svg';

  export interface IconProps extends SvgProps {
    size?: number;
    color?: string;
  }

  export const Thermometer: ComponentType<IconProps>;
  export const Droplets: ComponentType<IconProps>;
  export const Wind: ComponentType<IconProps>;
  export const Menu: ComponentType<IconProps>;
  export const X: ComponentType<IconProps>;
  export const Maximize: ComponentType<IconProps>;
}
