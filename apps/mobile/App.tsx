import { TamaguiProvider } from 'tamagui'
import { NavigationProvider } from './navigation'
import tamaguiConfig from '../../tamagui.config'

export default function App() {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      <NavigationProvider />
    </TamaguiProvider>
  )
}