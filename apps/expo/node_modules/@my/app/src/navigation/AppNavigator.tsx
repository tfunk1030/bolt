import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ShotCalculatorScreen } from '../screens/ShotCalculatorScreen'
import { ShotAnalysisScreen } from '../screens/ShotAnalysisScreen'
import { SettingsScreen } from '../screens/SettingsScreen'
import { useTranslation } from '../hooks/useTranslation'

const Stack = createNativeStackNavigator()

export function AppNavigator() {
  const { t } = useTranslation()

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="ShotCalculator"
        component={ShotCalculatorScreen}
        options={{ title: t('nav.shotCalculator') }}
      />
      <Stack.Screen
        name="ShotAnalysis"
        component={ShotAnalysisScreen}
        options={{ title: t('nav.shotAnalysis') }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: t('nav.settings') }}
      />
    </Stack.Navigator>
  )
} 