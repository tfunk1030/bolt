# Mobile Conversion Structural Guide

## Final Monorepo Structure
```bash
windsurf-app/
├── apps/
│   ├── web/               # Existing Next.js app
│   │   ├── app/          # Keep original pages
│   │   └── lib/ -> ../../packages/core/src/lib # Symlink to shared code
│   │
│   └── mobile/           # New Expo app
│       ├── app/
│       │   ├── (tabs)/   # Mobile screens
│       │   └── navigation/
│       └── lib/ -> ../../packages/core/src/lib
│
├── packages/
│   └── core/             # Shared code
│       ├── src/
│       │   ├── lib/      # Original business logic
│       │   ├── components/ # Universal UI components
│       │   ├── types/    # TypeScript definitions
│       │   └── hooks/    # Shared hooks
│       └── tamagui.config.ts
│
└── turbo.json            # Monorepo build config
```

## Safe File Migration Strategy

### 1. Create Symlinks for Shared Code
```bash
# From monorepo root:
cd apps/web
ln -s ../../packages/core/src/lib lib/shared
cd ../mobile
ln -s ../../packages/core/src/lib lib/shared
```

### 2. Gradual Core Migration
```bash
# Phase 1: Move non-UI files
mv project-bolt-github-nixuwvay/lib/club-data.ts packages/core/src/lib/
mv project-bolt-github-nixuwvay/lib/shot-calc-context.tsx packages/core/src/lib/

# Phase 2: Move UI components last
mv project-bolt-github-nixuwvay/components/ui/ packages/core/src/components/
```

## Page Conversion Steps

### Example: Shot Calculator Page
1. **Create Mobile Screen**
```bash
mkdir -p apps/mobile/app/(tabs)/shot-calculator
touch apps/mobile/app/(tabs)/shot-calculator/screen.native.tsx
```

2. **Adapt Layout**
```typescript
// apps/mobile/app/(tabs)/shot-calculator/screen.native.tsx
import { ShotCalculator } from 'core/src/components/shot-calculator'
import { SafeAreaView } from 'react-native'

export function ShotCalculatorScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ShotCalculator mobileLayout />
    </SafeAreaView>
  )
}
```

3. **Update Web Version**
```typescript
// apps/web/app/shot-calculator/page.tsx
'use client'
import { ShotCalculator } from 'core/src/components/shot-calculator'

export default function Page() {
  return <ShotCalculator desktopLayout />
}
```

## Component Adaptation Guide

### Before (Web-only):
```typescript
// Old component
export const WindSlider = () => (
  <input 
    type="range" 
    className="w-full slider"
    min={0} 
    max={30}
  />
)
```

### After (Cross-platform):
```typescript
// packages/core/src/components/wind-slider.tsx
import { Slider } from '@tamagui/slider'
import { isWeb } from 'core/src/utils/platform'

export const WindSlider = () => (
  <Slider
    size="$4"
    min={0}
    max={30}
    orientation={isWeb ? 'horizontal' : 'vertical'}
    {...(isWeb && { className: 'w-full' })}
  >
    <Slider.Track>
      <Slider.TrackActive />
    </Slider.Track>
    <Slider.Thumb circular elevate />
  </Slider>
)
```

## Navigation Setup

1. **Mobile Navigation Config**
```typescript
// apps/mobile/app/navigation/native.tsx
const Stack = createNativeStackNavigator()

export const NativeNavigation = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ 
      headerLargeTitle: true,
      headerTransparent: true
    }}>
      <Stack.Screen
        name="shot-calculator"
        component={ShotCalculatorScreen}
        options={{
          title: 'Shot Calculator',
          animation: 'slide_from_right'
        }}
      />
    </Stack.Navigator>
  </NavigationContainer>
)
```

2. **Web Navigation Preservation**
```typescript
// apps/web/components/navigation.tsx (keep existing)
export function Navigation() {
  return (
    <nav className="flex space-x-4">
      <Link href="/shot-calculator">Calculator</Link>
      {/* Existing links remain unchanged */}
    </nav>
  )
}
```

## Critical Path Conversion Order
1. **Data Layers First**
   - Club settings context
   - Environmental service
   - Sensor adapters

2. **Core UI Components**
   - Buttons
   - Sliders
   - Form inputs

3. **Page Layouts**
   - Shot calculator
   - Wind analysis
   - Settings

4. **Platform-Specific Features**
   - Mobile sensor integration
   - Web 3D visualization

## Migration Safety Checklist
```bash
# After each migration step:
yarn workspaces foreach run lint  # Check for errors
yarn web dev                      # Verify web functionality
yarn mobile start                 # Test mobile changes
```

## Dependency Management
```bash
# Shared deps (core package):
yarn workspace core add \
  zustand \
  zod \
  @tamagui/core

# Mobile-specific:
yarn workspace mobile add \
  expo-sensors \
  react-native-reanimated

# Web-specific:
yarn workspace web add \
  three \
  @react-three/fiber
```

## Conversion Phases Timeline

| Phase | Duration | Key Tasks |
|-------|----------|-----------|
| Setup | 2 days | Monorepo init, CI/CD, shared configs |
| Data Layer | 3 days | Contexts, services, types |
| UI Core | 5 days | Components, hooks, theme |
| Pages | 4 days | Screen adaption, navigation |
| Polish | 3 days | Testing, perf optimization |