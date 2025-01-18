declare module '@testing-library/react-native' {
  import { ReactElement } from 'react'

  export interface RenderOptions {
    wrapper?: React.ComponentType<any>
    [key: string]: any
  }

  export interface RenderAPI {
    container: any
    debug: (message?: string) => void
    unmount: () => void
    rerender: (ui: ReactElement) => void
    queryByTestId: (id: string) => HTMLElement | null
    getByTestId: (id: string) => HTMLElement
    findByTestId: (id: string) => Promise<HTMLElement>
    queryByText: (text: string | RegExp) => HTMLElement | null
    getByText: (text: string | RegExp) => HTMLElement
    findByText: (text: string | RegExp) => Promise<HTMLElement>
    [key: string]: any
  }

  export function render(
    ui: ReactElement,
    options?: RenderOptions
  ): RenderAPI

  export function cleanup(): void
  export function act(callback: () => void): void
  export function fireEvent(element: any, eventName: string, eventData?: any): void
}

declare module '@testing-library/jest-native' {
  export function toHaveStyle(received: any, style: any): { pass: boolean; message(): string }
  export function toBeDisabled(received: any): { pass: boolean; message(): string }
  export function toBeEnabled(received: any): { pass: boolean; message(): string }
  export function toBeEmpty(received: any): { pass: boolean; message(): string }
  export function toBeVisible(received: any): { pass: boolean; message(): string }
  export function toBeFocused(received: any): { pass: boolean; message(): string }
}

declare module '@tanstack/react-query' {
  export interface QueryClientConfig {
    defaultOptions?: {
      queries?: {
        retry?: boolean | number
        [key: string]: any
      }
      [key: string]: any
    }
  }

  export class QueryClient {
    constructor(config?: QueryClientConfig)
  }

  export interface QueryClientProviderProps {
    client: QueryClient
    children?: React.ReactNode
  }

  export const QueryClientProvider: React.ComponentType<QueryClientProviderProps>
}
