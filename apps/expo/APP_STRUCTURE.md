# Mobile App Structure Overview

## Directory Structure

```
apps/expo/
├── src/
│   ├── components/         # Shared UI components
│   │   └── ui/            # Base UI components using Tamagui
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── spinner.tsx
│   │
│   ├── features/          # Feature-specific screens and components
│   │   ├── dashboard/
│   │   ├── shot-calculator/
│   │   ├── wind-calculator/
│   │   └── settings/
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── use-app-state.ts
│   │   ├── use-location.ts
│   │   ├── use-notifications.ts
│   │   ├── use-storage.ts
│   │   ├── use-theme.ts
│   │   ├── use-weather.ts
│   │   └── use-wind-calculations.ts
│   │
│   ├── navigation/        # Navigation configuration
│   │   └── root-navigator.tsx
│   │
│   ├── providers/         # Context providers
│   │   ├── index.tsx
│   │   └── query-client.tsx
│   │
│   ├── types/            # TypeScript type definitions
│   │   ├── env.d.ts
│   │   ├── global.d.ts
│   │   ├── jest.d.ts
│   │   ├── modules.d.ts
│   │   ├── navigation.ts
│   │   ├── react.d.ts
│   │   ├── react-native.d.ts
│   │   └── tamagui.d.ts
│   │
│   └── utils/            # Utility functions and helpers
│       ├── date.ts
│       ├── test-utils.ts
│       ├── units.ts
│       └── validation.ts
│
├── App.tsx               # Root application component
└── index.ts             # Entry point
```

## Key Components

### UI Components
- `Button`: Cross-platform button component with variants
- `Card`: Container component with elevation and outline styles
- `Input`: Text input component with validation states
- `Spinner`: Loading indicator with size variants

### Features
- `Dashboard`: Main overview screen
- `Shot Calculator`: Shot analysis and calculation feature
- `Wind Calculator`: Wind condition analysis
- `Settings`: App configuration and preferences

### Navigation
- Bottom tab navigation for main features
- Stack navigation for detailed views
- Modal presentations for quick actions

### State Management
- React Query for server state
- Zustand for global app state
- Context for theme and localization

## Architecture

### Data Flow
1. API Layer
   - REST endpoints
   - Data validation with Zod
   - Error handling

2. State Management
   - Server state with React Query
   - Local state with Zustand
   - UI state with React hooks

3. UI Layer
   - Tamagui components
   - Feature-specific screens
   - Shared UI components

### Cross-Platform Considerations

#### iOS
- Native iOS components through React Native
- SF Pro font family
- iOS-specific gestures
- Standard iOS spacing

#### Android
- Material Design components
- Roboto font family
- Android navigation patterns
- Material elevation and shadows

### Testing Infrastructure

#### Unit Tests
- Jest for test running
- React Native Testing Library
- Mock implementations for native modules

#### Integration Tests
- Navigation testing
- State management testing
- API integration testing

### Development Tools
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Jest for testing

## Environment Configuration

### Development
- Local development server
- Hot reloading
- Debug tools
- Environment variables

### Production
- Optimized builds
- Error tracking
- Analytics
- Release channels

## Performance Optimizations

### Image Handling
- Lazy loading
- Caching
- Size optimization

### State Management
- Memoization
- Selective updates
- Background processing

### Network
- Request caching
- Offline support
- Error recovery

## Security Measures

### Data Protection
- Secure storage
- API authentication
- Certificate pinning

### User Privacy
- Permission handling
- Data encryption
- Secure preferences

## Deployment Process

### App Store (iOS)
- Automated builds
- TestFlight distribution
- App Store Connect setup

### Google Play (Android)
- Release builds
- Internal testing
- Play Store listing

## Documentation

### Code
- TypeScript types
- JSDoc comments
- README files

### Features
- User documentation
- API documentation
- Component storybook
