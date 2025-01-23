import { NavigationProvider } from 'solito/providers'
import { TamaguiProvider } from 'tamagui'
import config from '../../tamagui.config'

export function App({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProvider config={config}>
      <NavigationProvider>
        {children}
      </NavigationProvider>
    </TamaguiProvider>
  )
}