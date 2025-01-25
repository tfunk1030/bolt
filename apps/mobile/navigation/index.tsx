import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationProvider as SolitoNavigationProvider } from 'solito'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Platform } from 'react-native'
import { HomeScreen } from '../app/screens/home'
import { WindCompassTestScreen } from '../app/screens/WindCompassTestScreen'
import { ClubSelectionScreen } from '../app/screens/ClubSelectionScreen'
import { ShotCalculatorScreen } from '../app/screens/ShotCalculatorScreen'

const Stack = createNativeStackNavigator()

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  return (
    <SolitoNavigationProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: 'transparent' }
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="WindCompass" component={WindCompassTestScreen} />
            <Stack.Screen name="ClubSelection" component={ClubSelectionScreen} />
            <Stack.Screen name="ShotCalculator" component={ShotCalculatorScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SolitoNavigationProvider>
  )
}