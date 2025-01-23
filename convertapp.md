# Comprehensive Mobile Conversion Guide - Option 1

## Full Native Implementation with React Native/Expo/Tamagui/Solito

### 1. Monorepo Initialization
```bash
# Create new monorepo with Solito template
npx create-turbo@latest -e with-solito windsurf-mobile
cd windsurf-mobile

# Install core dependencies
yarn add \
  @tamagui/core @tamagui/vite-plugin \
  @tamagui/config react-native-reanimated \
  expo-sensors react-native-gesture-handler

# Verify structure
.
├── apps/
│   ├── next/         # Existing web app
│   └── expo/         # New mobile app
├── packages/
│   └── core/         # Shared codebase
└── turbo.json        # Monorepo configuration
```

### 2. Core Package Configuration
```typescript
// packages/core/package.json
{
  "name": "core",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "dependencies": {
    "@tamagui/core": "^1.0.0",
    "zod": "^3.0.0",
    "zustand": "^4.0.0"
  }
}
```

### 3. Shared Code Migration
1. Move existing business logic:
```bash
mv ../project-bolt-github-nixuwvay/lib packages/core/src/
mv ../project-bolt-github-nixuwvay/types packages/core/src/
```

2. Create cross-platform entry points:
```typescript
// packages/core/src/index.ts
export * from './lib/club-settings-context'
export * from './lib/shot-calc-context'
export * from './types/club-data'
```

### 4. Mobile App Setup
```typescript
// apps/expo/app/(tabs)/index.native.tsx
import { ClubSettingsProvider } from 'core/src/lib/club-settings-context'
import { ShotCalculator } from 'core/src/components/shot-calculator'

export function HomeScreen() {
  return (
    <ClubSettingsProvider>
      <ShotCalculator mobileLayout />
    </ClubSettingsProvider>
  )
}
```

### 5. Tamagui Component Adaptation
```typescript
// packages/core/src/components/button.tsx
import { Button as TamaguiButton } from '@tamagui/core'

export const Button = ({ children, ...props }) => (
  <TamaguiButton
    backgroundColor="$blue8"
    color="white"
    pressStyle={{ opacity: 0.8 }}
    {...props}
  >
    {children}
  </TamaguiButton>
)
```

### 6. Navigation Implementation
```typescript
// apps/expo/app/navigation/native.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator<RootStackParamList>()

export const NativeNavigation = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="shot-calculator"
        component={ShotCalculatorScreen}
        options={{
          animation: 'slide_from_right',
          gestureEnabled: true
        }}
      />
    </Stack.Navigator>
  </NavigationContainer>
)
```

### 7. Sensor Integration
```typescript
// packages/core/src/lib/sensor-service.ts
import { Accelerometer, Gyroscope } from 'expo-sensors'

export class MobileSensorService {
  private static instance: MobileSensorService
  
  public static getInstance(): MobileSensorService {
    if (!MobileSensorService.instance) {
      MobileSensorService.instance = new MobileSensorService()
    }
    return MobileSensorService.instance
  }

  public async initialize() {
    await Promise.all([
      Accelerometer.isAvailableAsync(),
      Gyroscope.isAvailableAsync()
    ])
    
    Accelerometer.setUpdateInterval(100)
    Gyroscope.setUpdateInterval(100)
  }

  public subscribeToMotion(callback: (data: SensorData) => void) {
    const accelSub = Accelerometer.addListener((accelData) => {
      callback({ ...accelData, type: 'acceleration' })
    })
    
    const gyroSub = Gyroscope.addListener((gyroData) => {
      callback({ ...gyroData, type: 'rotation' })
    })

    return () => {
      accelSub.remove()
      gyroSub.remove()
    }
  }
}
```

### 8. Platform-Specific Implementations
```typescript
// packages/core/src/hooks/use-environmental.native.ts
import { useEffect } from 'react'
import { MobileSensorService } from '../lib/sensor-service'

export const useEnvironmental = () => {
  useEffect(() => {
    const sensorService = MobileSensorService.getInstance()
    const cleanup = sensorService.subscribeToMotion((data) => {
      // Handle mobile sensor data
    })
    
    return () => cleanup()
  }, [])
}
```

### 9. Build Configuration
```javascript
// apps/expo/app.json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "enableProguardInReleaseBuilds": true
          },
          "ios": {
            "flipper": true
          }
        }
      ]
    ],
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png"
      }
    }
  }
}
```

### 10. Testing & QA
```bash
# Unit tests
yarn workspace core test

# Component tests
yarn workspace expo test

# E2E tests
yarn global install detox-cli
detox build -c ios.sim.release
detox test -c ios.sim.release
```

### 11. Deployment Pipeline
```yaml
# .github/workflows/mobile.yml
name: Mobile CI

on:
  push:
    branches: [main]
    paths:
      - 'apps/expo/**'
      - 'packages/core/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18.x
      
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      
      - name: Build Android
        run: |
          yarn workspace expo eas build --platform android --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
      
      - name: Build iOS
        run: |
          yarn workspace expo eas build --platform ios --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

### 12. Post-Conversion Checklist
1. Shared State Validation
```typescript
// packages/core/src/lib/state-validation.ts
import { z } from 'zod'

export const ClubSettingsSchema = z.object({
  clubs: z.array(
    z.object({
      name: z.string(),
      normalYardage: z.number().positive(),
      loft: z.number().min(10).max(60)
    })
  )
})
```

2. Performance Optimization
```javascript
// apps/expo/babel.config.js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      '@tamagui/babel-plugin',
      {
        components: ['core'],
        config: './packages/core/tamagui.config.ts'
      }
    ]
  ]
}
```

3. Monitoring Setup
```bash
# Install monitoring tools
yarn workspace expo add \
  @sentry/react-native \
  @sentry/profiling-node \
  react-native-performance
```

### Implementation Timeline
| Phase       | Duration | Tasks                                  |
|-------------|----------|----------------------------------------|
| Setup       | 3 days   | Monorepo, shared configs, CI pipeline  |
| Core Migration | 5 days | Shared logic, type definitions, tests  |
| UI Adaptation | 7 days | Component conversion, navigation       |
| Mobile Features | 4 days | Sensors, gestures, platform APIs      |
| QA & Polish | 5 days   | Testing, performance, app store prep   |

### Required Team Roles
1. **Mobile Architect**: Monorepo setup & core configuration
2. **React Native Developer**: Component adaptation
3. **QA Engineer**: Cross-platform testing
4. **DevOps Engineer**: CI/CD pipeline setup