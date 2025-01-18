import * as React from 'react'
import { render as rtlRender } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TamaguiProvider } from 'tamagui'
import { config } from '../tamagui.config'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

interface ProvidersProps {
  children: React.ReactNode
}

function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={config}>
        {children}
      </TamaguiProvider>
    </QueryClientProvider>
  )
}

const customRender = (ui: React.ReactElement, options = {}) =>
  rtlRender(ui, {
    wrapper: Providers,
    ...options,
  })

// re-export everything
export * from '@testing-library/react-native'

// override render method
export { customRender as render }
