# Codebase Summary

## Key Components and Their Interactions

### Core Screens (Mobile matching Web)
- Wind Calculator (`apps/expo/src/features/wind-calculator/screen.tsx`)
  - Exact match to web version (`app/wind-calc/`)
  - Identical calculation accuracy
  - Matching UI layout and functionality
  - Reuse of web calculation models

- Shot Calculator (`apps/expo/src/features/shot-calculator/screen.tsx`)
  - Perfect parity with web version (`app/shot-calculator/`)
  - Identical shot analysis algorithms
  - Matching UI and behavior
  - Same calculation precision

- Weather Display (in development)
  - To match web weather implementation exactly
  - Identical data processing and display
  - Same UI layout and features
  - Equal update frequency

- Settings (`apps/expo/src/features/settings/screen.tsx`)
  - Mirror web settings interface exactly
  - Identical functionality and options
  - Matching UI components
  - Same configuration capabilities

### Components Structure
- Web UI components (Reference Implementation)
  - Located in `components/ui`
  - Defines the standard for mobile implementation
  - Not to be modified
  - Serves as source of truth

- Mobile UI components
  - Located in `apps/expo/src/components/ui`
  - Must match web components' functionality exactly
  - Using React Native equivalents
  - Maintain feature parity

## Data Flow
- Identical calculation models between platforms
- Shared business logic to ensure consistency
- Same state management patterns
- Equal data processing accuracy

## External Dependencies

### Mobile Implementation
- react-native-safe-area-context for proper display
- @tamagui/core for UI components matching web
- Reuse of web calculation engines
- Same validation rules as web

### Web Reference
- Next.js implementation (source of truth)
- Defines UI/UX standards
- Establishes calculation accuracy
- Sets feature requirements

## Recent Significant Changes
1. Alignment of mobile implementation with web reference
2. Port of exact calculation models
3. UI component matching
4. Verification of calculation accuracy

## Version Control
- Web version (`app/`) serves as reference implementation
- Mobile version (`apps/expo/`) must match web exactly
- Shared logic ensures consistency
- No modifications to web version allowed

## Architecture Decisions
1. Web version is the source of truth
2. Mobile must maintain exact feature parity
3. Identical calculation accuracy required
4. UI/UX must match while using native components

## Development Guidelines
1. Always reference web implementation
2. Maintain exact calculation precision
3. Match UI layouts precisely
4. Verify feature parity continuously
5. Test accuracy against web version

## Known Issues
1. Need to verify calculation accuracy matches web
2. UI component parity verification needed
3. Cross-device testing required
