type MockFn = {
  (...args: any[]): any;
  calls: any[][];
  implementation?: (...args: any[]) => any;
  mockImplementation: (fn: (...args: any[]) => any) => MockFn;
  mockReturnValue: (value: any) => MockFn;
  mockResolvedValue: (value: any) => MockFn;
  mockRejectedValue: (value: any) => MockFn;
  mockClear: () => MockFn;
  mockReset: () => MockFn;
  mockRestore: () => void;
};

export interface MockGeolocation {
  getCurrentPosition: MockFn;
  watchPosition: MockFn;
  clearWatch: MockFn;
}

export interface MockNotifications {
  requestPermissionsAsync: MockFn;
  getExpoPushTokenAsync: MockFn;
  setNotificationHandler: MockFn;
  scheduleNotificationAsync: MockFn;
  dismissNotificationAsync: MockFn;
  cancelAllScheduledNotificationsAsync: MockFn;
}

export interface MockNavigation {
  navigate: MockFn;
  goBack: MockFn;
  reset: MockFn;
  setOptions: MockFn;
  addListener: MockFn;
  removeListener: MockFn;
}

export interface MockRoute {
  params: Record<string, any>;
  key: string;
  name: string;
}

export interface MockApiResponse<T> {
  ok: boolean;
  status: number;
  data: T;
  headers: {
    get: MockFn;
    set: MockFn;
  };
}

export function createMockFunction(): MockFn {
  const calls: any[][] = [];
  let implementation: ((...args: any[]) => any) | undefined;

  const mockFn = function (...args: any[]) {
    calls.push(args);
    return implementation?.(...args);
  } as MockFn;

  mockFn.calls = calls;
  mockFn.implementation = implementation;

  mockFn.mockImplementation = function (fn) {
    implementation = fn;
    return this;
  };

  mockFn.mockReturnValue = function (value) {
    implementation = () => value;
    return this;
  };

  mockFn.mockResolvedValue = function (value) {
    implementation = () => Promise.resolve(value);
    return this;
  };

  mockFn.mockRejectedValue = function (value) {
    implementation = () => Promise.reject(value);
    return this;
  };

  mockFn.mockClear = function () {
    calls.length = 0;
    return this;
  };

  mockFn.mockReset = function () {
    calls.length = 0;
    implementation = undefined;
    return this;
  };

  mockFn.mockRestore = function () {
    calls.length = 0;
    implementation = undefined;
  };

  return mockFn;
}
