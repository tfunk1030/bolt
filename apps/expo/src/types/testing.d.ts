declare module '@testing-library/react-native' {
  import { ReactElement } from 'react'

  export interface RenderOptions {
    wrapper?: React.ComponentType<any>
    [key: string]: any
  }

  export interface RenderResult {
    container: any
    debug: (message?: string) => void
    unmount: () => void
    rerender: (ui: ReactElement) => void
    asJSON: () => any
    toJSON: () => any
    queryByTestId: (id: string) => any
    getByTestId: (id: string) => any
    findByTestId: (id: string) => Promise<any>
    queryByText: (text: string | RegExp) => any
    getByText: (text: string | RegExp) => any
    findByText: (text: string | RegExp) => Promise<any>
  }

  export function render(
    ui: ReactElement,
    options?: RenderOptions
  ): RenderResult & { [key: string]: any }

  export function cleanup(): void
  export function act(callback: () => void): void
  export function fireEvent(element: any, eventName: string, eventData?: any): void
}

declare module 'tamagui' {
  import { ReactNode } from 'react'

  export interface TamaguiProviderProps {
    config: any
    children?: ReactNode
  }

  export const TamaguiProvider: React.ComponentType<TamaguiProviderProps>
}
