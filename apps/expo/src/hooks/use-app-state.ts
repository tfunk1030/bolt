import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  units: 'metric' | 'imperial';
  notifications: boolean;
  windAlertThreshold: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface AppState {
  preferences: UserPreferences;
  location: LocationData | null;
  isOnboarded: boolean;
  authToken: string | null;
  setPreferences: (newPreferences: Partial<UserPreferences>) => void;
  setTheme: (theme: UserPreferences['theme']) => void;
  setUnits: (units: UserPreferences['units']) => void;
  setNotifications: (enabled: boolean) => void;
  setWindAlertThreshold: (threshold: number) => void;
  setLocation: (latitude: number, longitude: number) => void;
  clearLocation: () => void;
  setIsOnboarded: (value: boolean) => void;
  setAuthToken: (token: string | null) => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'system',
  units: 'metric',
  notifications: true,
  windAlertThreshold: 15,
};

const customStorage = {
  getItem: async (name: string) => {
    const value = await SecureStore.getItemAsync(name);
    return value ?? null;
  },
  setItem: async (name: string, value: string) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name);
  },
};

export const useAppState = create(
  persist(
    (set: any) => ({
      preferences: defaultPreferences,
      location: null,
      isOnboarded: false,
      authToken: null,

      setPreferences: (newPreferences: Partial<UserPreferences>) =>
        set((state: AppState) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),

      setTheme: (value: UserPreferences['theme']) =>
        set((state: AppState) => ({
          preferences: { ...state.preferences, theme: value },
        })),

      setUnits: (value: UserPreferences['units']) =>
        set((state: AppState) => ({
          preferences: { ...state.preferences, units: value },
        })),

      setNotifications: (value: boolean) =>
        set((state: AppState) => ({
          preferences: { ...state.preferences, notifications: value },
        })),

      setWindAlertThreshold: (value: number) =>
        set((state: AppState) => ({
          preferences: { ...state.preferences, windAlertThreshold: value },
        })),

      setLocation: (latitude: number, longitude: number) =>
        set({
          location: {
            latitude,
            longitude,
            timestamp: Date.now(),
          },
        }),

      clearLocation: () => set({ location: null }),

      setIsOnboarded: (value: boolean) => set({ isOnboarded: value }),

      setAuthToken: (token: string | null) => set({ authToken: token }),
    }),
    {
      name: 'app-storage',
      storage: customStorage,
    }
  )
);
