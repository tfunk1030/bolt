declare module 'react-native-safe-area-context' {
  import { ViewProps } from 'react-native';
  import React from 'react';

  export interface SafeAreaViewProps extends ViewProps {
    children?: React.ReactNode;
  }

  export const SafeAreaView: React.FC<SafeAreaViewProps>;
  export const SafeAreaProvider: React.FC<{ children: React.ReactNode }>;
  export const View: React.FC<ViewProps>;
}
