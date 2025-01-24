import { NavigationContainer } from '@react-navigation/native'
import { TamaguiProvider, Theme } from 'tamagui'
import { useFonts } from 'expo-font'
import { AppNavigator } from '@my/app/src/navigation/AppNavigator'
import config from './tamagui.config'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { useColorScheme } from 'react-native'
import { storage } from '@my/app/src/utils/mmkv'

// Initialize MMKV storage
if (!storage.contains('shot-store')) {
  storage.set('shot-store', JSON.stringify({ currentShot: null, shotHistory: [] }))
}

export default function App() {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  const colorScheme = useColorScheme()

  if (!loaded) {
    return null
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