# LastShot Mobile

A cross-platform mobile application for golf shot analysis and wind calculations.

## Features

- Real-time wind calculations
- Shot analysis and tracking
- Course management
- Weather integration
- Offline support

## Prerequisites

- Node.js 18 or higher
- Yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS development environment (for iOS)
  - Xcode 14 or higher
  - CocoaPods
- Android development environment (for Android)
  - Android Studio
  - JDK 11
  - Android SDK

## Setup

1. Install dependencies:
```bash
yarn install
```

2. Create a `.env` file in the root directory and add required environment variables:
```bash
cp .env.example .env
```

3. Update the environment variables in `.env` with your API keys.

## Development

Start the development server:
```bash
yarn start
```

### iOS
```bash
yarn ios
```

### Android
```bash
yarn android
```

## Testing

Run unit tests:
```bash
yarn test
```

Run integration tests:
```bash
yarn test:e2e
```

## Building

### iOS
1. Configure app signing in Xcode
2. Build the app:
```bash
yarn build:ios
```

### Android
1. Configure keystore in `android/app`
2. Build the app:
```bash
yarn build:android
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── features/       # Feature-specific screens and components
├── hooks/          # Custom React hooks
├── navigation/     # Navigation configuration
├── providers/      # Context providers
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Architecture

- React Native with Expo
- TypeScript for type safety
- Tamagui for UI components
- React Navigation for routing
- Zustand for state management
- React Query for data fetching
- Jest for testing

## Contributing

1. Create a new branch from `main`
2. Make your changes
3. Submit a pull request

## License

MIT
