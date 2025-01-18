declare module 'react-native' {
  import type { FunctionComponent, ReactNode } from 'react';

  export type FlexStyle = {
    flex?: number;
    flexBasis?: number | string;
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    flexGrow?: number;
    flexShrink?: number;
    flexWrap?: 'wrap' | 'nowrap' | 'wrap-reverse';
  };

  export type LayoutStyle = {
    position?: 'absolute' | 'relative';
    width?: number | string;
    height?: number | string;
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
    minWidth?: number | string;
    maxWidth?: number | string;
    minHeight?: number | string;
    maxHeight?: number | string;
    margin?: number | string;
    marginTop?: number | string;
    marginRight?: number | string;
    marginBottom?: number | string;
    marginLeft?: number | string;
    padding?: number | string;
    paddingTop?: number | string;
    paddingRight?: number | string;
    paddingBottom?: number | string;
    paddingLeft?: number | string;
  };

  export interface ViewStyle extends FlexStyle, LayoutStyle {
    [key: string]: any;
  }

  export interface ViewProps {
    style?: ViewStyle | ViewStyle[];
    children?: ReactNode;
    [key: string]: any;
  }

  export const View: FunctionComponent<ViewProps>;
  
  export const StyleSheet: {
    create: <T extends { [key: string]: ViewStyle }>(styles: T) => T;
    compose: (...styles: (ViewStyle | undefined)[]) => ViewStyle;
  };
}
