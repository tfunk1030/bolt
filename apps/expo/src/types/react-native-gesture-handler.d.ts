declare module 'react-native-gesture-handler' {
  import type { FunctionComponent, ReactNode } from 'react';

  export interface GestureDetectorProps {
    gesture: any;
    children: ReactNode;
  }

  export class Gesture {
    static Pan(): {
      onUpdate: (callback: (event: { x: number; y: number }) => void) => any;
    };
  }

  export const GestureDetector: FunctionComponent<GestureDetectorProps>;
}
