declare module '@shopify/react-native-skia' {
  import type { FunctionComponent, ReactNode } from 'react';

  export interface CanvasProps {
    style?: any;
    children?: ReactNode;
  }

  export interface CircleProps {
    cx: number;
    cy: number;
    r: number;
    style?: string;
    strokeWidth?: number;
    color?: string;
    children?: ReactNode;
  }

  export interface PathProps {
    path: string;
    style?: string;
    strokeWidth?: number;
    color?: string;
    children?: ReactNode;
  }

  export interface GradientProps {
    c?: { x: number; y: number };
    r?: number;
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
  }

  export interface GroupProps {
    children?: ReactNode;
  }

  export const Canvas: FunctionComponent<CanvasProps>;
  export const Circle: FunctionComponent<CircleProps>;
  export const Path: FunctionComponent<PathProps>;
  export const Group: FunctionComponent<GroupProps>;
  export const LinearGradient: FunctionComponent<GradientProps>;
  export const RadialGradient: FunctionComponent<GradientProps>;

  export function vec(x: number, y: number): { x: number; y: number };
}
