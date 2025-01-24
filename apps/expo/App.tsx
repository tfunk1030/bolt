import { NavigationContainer } from '@react-navigation/native'
import { TamaguiProvider, Theme } from 'tamagui'
import { useFonts } from 'expo-font'
import { AppNavigator } from '@my/app/src/navigation/AppNavigator'
import config from './tamagui.config'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'react-native'
import { mmkv } from '@my/app/src/utils/mmkv'

// Initialize store
const initializeStore = async () => {
  const stored = await mmkv.getItem('shot-store')
  if (!stored) {
    await mmkv.setItem('shot-store', JSON.stringify({ currentShot: null, shotHistory: [] }))
  }
}

initializeStore().catch(console.error)

export default function App(): JSX.Element {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  const colorScheme = useColorScheme()

  if (!loaded) {
    return <></> // Return empty fragment instead of null
  }

  return (
    <TamaguiProvider config={config}>
      <Theme name={colorScheme === 'dark' ? 'dark' : 'light'}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </Theme>
    </TamaguiProvider>
  )
} 