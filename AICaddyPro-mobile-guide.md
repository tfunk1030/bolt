# AICaddyPro Mobile Conversion (Updated Approach)

## 1. Revised Monorepo Setup
```bash
# Create basic turbo repo
npx create-turbo@latest AICaddyPro
cd AICaddyPro

# Add Expo manually
yarn add -W expo @expo/vector-icons react-native-safe-area-context
npx expo install react-native-screens react-native-reanimated

# Create minimal structure
mkdir -p \
  apps/mobile/app \
  packages/core/src/{lib,components} \
  packages/shared-types
```

## 2. Core Configuration
```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false
    }
  }
}
```

## 3. Shared Code Migration
```bash
# From original project root:
cp -r lib/*-context.tsx aicaddypro/packages/core/src/lib/
cp lib/types.ts aicaddypro/packages/shared-types/src/

# Create symlink to preserve web app
cd apps
ln -s ../../project-bolt-github-nixuwvay web
```

## 4. Mobile Navigation Setup
```typescript
// apps/mobile/app/navigation.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

export const MobileNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="shot-calculator"
      component={ShotCalculatorScreen}
      options={{
        title: 'AICaddyPro Calculator',
        headerLargeTitle: true
      }}
    />
  </Stack.Navigator>
)
```

## 5. Component Sharing
```typescript
// packages/core/src/components/ShotCalculator.tsx
export function ShotCalculator({ mobile = false }) {
  return mobile ? (
    <MobileLayout>
      <CalculatorCore />
    </MobileLayout>
  ) : (
    <WebLayout>
      <CalculatorCore />
    </WebLayout>
  )
}
```

## 6. Mobile Entry Point
```typescript
// apps/mobile/App.tsx
import { NavigationContainer } from '@react-navigation/native'
import { MobileNavigator } from './app/navigation'

export default function App() {
  return (
    <NavigationContainer>
      <MobileNavigator />
    </NavigationContainer>
  )
}
```

## 7. Dependency Management
```bash
# Shared deps
yarn add -W \
  @tamagui/core \
  zustand \
  zod \
  react-native-gesture-handler

# Mobile-only
yarn workspace mobile add expo-sensors @react-navigation/native-stack
```

## 8. Migration Safety
```bash
# Test web remains functional
cd apps/web && yarn dev

# Check mobile
cd ../mobile && yarn start --clear
```

## Alternative Paths
1. **Mobile-First Approach**
```bash
npx create-expo-app AICaddyPro-mobile
cp -r project-bolt-github-nixuwvay/lib/* AICaddyPro-mobile/src/
```

2. **Next.js + Expo Coexistence**
```bash
mkdir AICaddyPro && cd AICaddyPro
npx create-next-app@latest web
npx create-expo-app mobile
mkdir packages/core
```

## Critical Preservation List
```bash
# Never modify these directly:
apps/web/app/shot-calculator/page.tsx
apps/web/lib/shot-calc-context.tsx
apps/web/lib/club-data.ts