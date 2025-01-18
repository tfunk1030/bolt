declare module '@testing-library/react-native' {
  export * from '@testing-library/react-native'
  export function render(
    ui: React.ReactElement,
    options?: any
  ): {
    container: any
    debug: (message?: string) => void
    unmount: () => void
    rerender: (ui: React.ReactElement) => void
    asJSON: () => any
    toJSON: () => any
    queryByTestId: (id: string) => HTMLElement | null
    getByTestId: (id: string) => HTMLElement
    findByTestId: (id: string) => Promise<HTMLElement>
    queryByText: (text: string | RegExp) => HTMLElement | null
    getByText: (text: string | RegExp) => HTMLElement
    findByText: (text: string | RegExp) => Promise<HTMLElement>
  }
}

declare module '@testing-library/jest-native' {
  export const toHaveStyle: (received: any, style: any) => { pass: boolean; message(): string }
  export const toBeDisabled: (received: any) => { pass: boolean; message(): string }
  export const toBeEnabled: (received: any) => { pass: boolean; message(): string }
  export const toBeEmpty: (received: any) => { pass: boolean; message(): string }
  export const toBeVisible: (received: any) => { pass: boolean; message(): string }
  export const toBeFocused: (received: any) => { pass: boolean; message(): string }
}
