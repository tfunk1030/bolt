# Focused Mobile Conversion Plan

## 1. Core Screen Components (Priority 1)
- [ ] Convert `shot-calculator/page.tsx` to Tamagui mobile layout
- [ ] Update `wind-calc/page.tsx` with react-native-skia visualizations
- [ ] Implement touch-optimized `WindProfileViz` component
- [ ] Convert `simple-weather-display.tsx` to Tamagui with gesture support
- [ ] Refactor settings page for mobile-first navigation patterns

## 2. State & Model Integration (Priority 2)
- [ ] Migrate `shot-calc-context.tsx` and `club-settings-context.tsx` to Zustand
- [ ] Integrate LATETS01 model into mobile state management
- [ ] Implement offline storage for club data and model parameters
- [ ] Create mobile validation service using Zod+Tamagui
- [ ] Add gesture state handlers for wind/weather inputs

## 3. Performance Optimization (Priority 3)
- [ ] Implement list virtualization for shot history
- [ ] Optimize LATETS01 model calculations for mobile
- [ ] Add memoization to weather data processing
- [ ] Implement progressive loading for trajectory visualizations

## Conversion Strategy
1. **Screen-First Approach**: Implement mobile layouts before component optimization
2. **Model Integration**: Wrap LATETS01 model in mobile-safe service worker
3. **State Hydration**: Implement Zustand+MMKV for offline-ready state
4. **Input Handling**: Unified gesture system across wind/weather/shot screens
5. **Performance**: Profile with React Native Debugger during conversions

