# LastShot Mobile App Specifications

## Screen Sizes and Resolutions

### iOS
- iPhone SE (2nd gen): 375x667 pt (750x1334 px @2x)
- iPhone 8 Plus: 414x736 pt (1080x1920 px @3x)
- iPhone 12/13: 390x844 pt (1170x2532 px @3x)
- iPhone 12/13 Pro Max: 428x926 pt (1284x2778 px @3x)
- iPad (9th gen): 810x1080 pt (1620x2160 px @2x)
- iPad Pro: 1024x1366 pt (2048x2732 px @2x)

### Android
- Small phones: 360x640 dp (mdpi)
- Medium phones: 360x720 dp (hdpi)
- Large phones: 411x731 dp (xhdpi)
- Tablets: 800x1280 dp (mdpi)

## Navigation Patterns

### Bottom Tab Navigation
- Dashboard (Home)
- Shot Calculator
- Wind Calculator
- Settings

### Stack Navigation
- Modal presentation for detailed views
- Standard push/pop for drill-down navigation
- Custom transitions for cross-fade effects

## Platform-Specific Design Guidelines

### iOS (Human Interface Guidelines)
- Native iOS components from react-native
- SF Pro Display font family
- iOS-specific gestures (swipe back)
- Standard iOS tab bar styling
- Modal presentation with card style
- Pull-to-refresh implementation

### Android (Material Design)
- Material Design components
- Roboto font family
- Android-specific back button handling
- Material bottom navigation styling
- Modal presentation with slide-up style
- Standard Android refresh indicator

## Native Features Integration

### Location Services
- Background location updates
- Geofencing for course detection
- Precise location for accurate wind calculations
- Location permission handling

### Push Notifications
- Local notifications for wind alerts
- Remote notifications for updates
- Custom notification channels (Android)
- Rich notifications with images
- Deep linking support

### Camera Access
- Shot recording
- Course photo integration
- QR code scanning for quick course lookup
- Media library integration

### Sensors
- Compass for wind direction
- Accelerometer for shot analysis
- Gyroscope for club angle measurement
- Barometer for pressure readings

## Performance Optimization

### Memory Management
- Image caching and optimization
- Lazy loading of heavy components
- Memory leak prevention
- Background task optimization

### Network Optimization
- Offline-first architecture
- Data caching strategy
- Bandwidth-efficient API calls
- Background sync implementation

### Rendering Performance
- React Native Reanimated for animations
- List virtualization
- Image lazy loading
- Memoization of heavy computations

## Testing Requirements

### Unit Testing
- Jest for component testing
- React Native Testing Library
- Mock implementations for native modules
- High test coverage requirement (>80%)

### Integration Testing
- End-to-end testing with Detox
- API integration testing
- Navigation flow testing
- Deep linking testing

### Platform Testing
- Device-specific testing matrix
- OS version compatibility testing
- Screen size adaptation testing
- Offline mode testing

## Deployment Process

### App Store (iOS)
1. Code signing setup
2. App Store Connect configuration
3. Screenshots and metadata preparation
4. TestFlight distribution
5. App Store review guidelines compliance
6. Phased release strategy

### Google Play Store (Android)
1. Keystore management
2. Play Console setup
3. Store listing preparation
4. Internal testing distribution
5. Play Store policy compliance
6. Staged rollout implementation

## Development Guidelines

### Code Organization
- Feature-based directory structure
- Shared components library
- Platform-specific code separation
- Type-safe implementation

### State Management
- Zustand for global state
- React Query for server state
- Secure storage for sensitive data
- Persistence strategy

### Styling
- Tamagui for cross-platform styling
- Platform-specific theme tokens
- Dark mode support
- Responsive design system

### Error Handling
- Global error boundary
- Crash reporting integration
- User-friendly error messages
- Offline error states

### Accessibility
- VoiceOver/TalkBack support
- Dynamic type scaling
- Color contrast compliance
- Gesture alternatives

### Security
- Certificate pinning
- Secure storage implementation
- API key protection
- Authentication flow security
