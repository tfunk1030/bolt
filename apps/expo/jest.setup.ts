import '@testing-library/jest-native/extend-expect';
import { jest } from '@jest/globals';

// Mock Expo modules
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: 'mock-token' }),
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  dismissNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: {
      latitude: 0,
      longitude: 0,
      altitude: null,
      accuracy: 1,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  }),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock react-native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
      addListener: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// Global setup
const mockConsole = {
  ...console,
  warn: jest.fn(),
  error: (...args: any[]) => {
    const ignoredWarnings = [
      'Warning: componentWill',
      'Warning: Each child in a list',
    ];
    const message = args.join(' ');
    if (!ignoredWarnings.some(warning => message.includes(warning))) {
      console.error(...args);
    }
  },
};

// @ts-ignore
console = mockConsole;

// Mock fetch
const mockFetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// @ts-ignore
window.fetch = mockFetch;

// Mock timers
jest.useFakeTimers();

// Cleanup after each test
jest.mock('@testing-library/jest-native/extend-expect', () => ({
  ...jest.requireActual('@testing-library/jest-native/extend-expect'),
  cleanup: jest.fn(),
}));

afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});
