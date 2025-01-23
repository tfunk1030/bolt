# Mobile-Only Conversion Guide

## 1. Project Setup
```bash
# Create new Expo project
npx create-expo-app windsurf-mobile
cd windsurf-mobile

# Install core dependencies
npx expo install react-native-screens react-native-safe-area-context
yarn add @tamagui/core @tamagui/vite-plugin react-native-reanimated react-native-gesture-handler @react-navigation/native @react-navigation/native-stack expo-sensors zod
```

## 2. File Structure Setup
```bash
mkdir -p \
  src/lib/contexts \
  src/components/ui \
  src/app/shot-calculator \
  src/app/wind-calc \
  src/navigation
```

## 3. Core Logic Migration
```bash
# From original project to new mobile
cp ../project-bolt-github-nixuwvay/lib/club-data.ts src/lib/
cp ../project-bolt-github-nixuwvay/lib/shot-calc-context.tsx src/lib/contexts/
cp ../project-bolt-github-nixuwvay/lib/environmental-service.ts src/lib/
cp ../project-bolt-github-nixuwvay/types.ts src/lib/

# Remove web-only files
rm -rf ../project-bolt-github-nixuwvay/app  # Remove Next.js pages
rm ../project-bolt-github-nixuwvay/lib/webgl-context.tsx  # WebGL not needed
```

## 4. Tamagui Configuration
```typescript
// tamagui.config.ts
import { createTamagui } from '@tamagui/core'

export default createTamagui({
  themes: {
    light: {
      background: '#ffffff',
      color: '#222222',
      primary: '#007bff',
    },
    dark: {
      background: '#222222',
      color: '#ffffff', 
      primary: '#4dabf7',
    }
  },
  fonts: {
    body: {
      normal: 'Inter',
      bold: 'InterBold'
    }
  }
})
```

## 5. Screen Conversion Example
```typescript
// src/app/shot-calculator/screen.tsx
import { Button, XStack, YStack } from '@tamagui/core'
import { useShotCalculator } from '../../lib/contexts/shot-calc-context'

export default function ShotCalculatorScreen() {
  const { calculateShot } = useShotCalculator()

  return (
    <YStack f={1} p="$4" bg="$background">
      <XStack space="$4">
        <Button onPress={() => calculateShot()}>
          Calculate
        </Button>
      </XStack>
    </YStack>
  )
}
```

## 6. Navigation Setup
```typescript
// src/navigation/index.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NavigationContainer } from '@react-navigation/native'
import ShotCalculatorScreen from '../app/shot-calculator/screen'

const Stack = createNativeStackNavigator()

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="shot-calculator"
          component={ShotCalculatorScreen}
          options={{
            title: 'Shot Calculator',
            headerLargeTitle: true,
            animation: 'slide_from_right'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
```

## 7. Context Provider Adaptation
```typescript
// src/providers/contexts.tsx
import { ClubSettingsProvider } from '../lib/contexts/club-settings-context'
import { EnvironmentalProvider } from '../lib/contexts/environmental-context'

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClubSettingsProvider>
      <EnvironmentalProvider>
        {children}
      </EnvironmentalProvider>
    </ClubSettingsProvider>
  )
}
```

## 8. Sensor Integration
```typescript
// src/lib/sensors.ts
import { Accelerometer, Gyroscope } from 'expo-sensors'

export class SensorService {
  static async initialize() {
    await Promise.all([
      Accelerometer.isAvailableAsync(),
      Gyroscope.isAvailableAsync()
    ])
    
    Accelerometer.setUpdateInterval(100)
    Gyroscope.setUpdateInterval(100)
  }

  static subscribe(callback: (data: SensorEvent) => void) {
    const subs = [
      Accelerometer.addListener(data => callback({...data, type: 'accel'})),
      Gyroscope.addListener(data => callback({...data, type: 'gyro'}))
    ]
    
    return () => subs.forEach(sub => sub.remove())
  }
}
```

## 9. Entry File Configuration
```typescript
// App.tsx
import { TamaguiProvider } from '@tamagui/core'
import config from './tamagui.config'
import Navigation from './navigation'
import { RootProvider } from './providers/contexts'

export default function App() {
  return (
    <TamaguiProvider config={config}>
      <RootProvider>
        <Navigation />
      </RootProvider>
    </TamaguiProvider>
  )
}
```

## 10. Build & Deployment
```bash
# Android build
npx expo prebuild --platform android
npx eas build --platform android

# iOS build  
npx expo prebuild --platform ios
npx eas build --platform ios

# Local development
npx expo start
```

## Post-Migration Checklist
1. Remove all web-specific files:
```bash
rm -rf \
  src/styles \
  next.config.js \
  postcss.config.js \
  tailwind.config.js
```

2. Update all imports from:
```typescript
// Change
import { x } from '@/lib/...'
// To
import { x } from '../lib/...'
```

3. Test core features:
- Shot calculation
- Club selection
- Sensor integration
- Navigation flows

4. Add mobile-specific features:
```bash
yarn add expo-location expo-camera  # Optional device features
```

## Final Structure
```
windsurf-mobile/
├── src/
│   ├── app/             # Screens
│   ├── lib/             # Business logic
│   ├── components/      # UI components
│   ├── navigation/      # Routing
│   └── providers/       # Contexts
├── app.json             # Expo config
└── package.json