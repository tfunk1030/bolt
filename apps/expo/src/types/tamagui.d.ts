declare module '@tamagui/core' {
  import { ComponentType } from 'react';

  interface StackProps {
    children?: React.ReactNode;
    position?: 'relative' | 'absolute';
    width?: number | string;
    height?: number | string;
    style?: any;
  }

  export const YStack: ComponentType<StackProps>;
  export const XStack: ComponentType<StackProps>;
  export const Stack: ComponentType<StackProps>;
}
