import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Settings {
  distanceUnit: 'yards' | 'meters';
  temperatureUnit: 'fahrenheit' | 'celsius';
  altitudeUnit: 'feet' | 'meters';
  theme: 'light' | 'dark';
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  formatDistance: (value: number) => string;
  formatTemperature: (value: number) => string;
  formatAltitude: (value: number) => string;
}

const defaultSettings: Settings = {
  distanceUnit: 'yards',
  temperatureUnit: 'fahrenheit',
  altitudeUnit: 'feet',
  theme: 'light',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  useEffect(() => {
    async function loadSettings() {
      try {
        const storedSettings = await AsyncStorage.getItem('settings');
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await AsyncStorage.setItem('settings', JSON.stringify(updatedSettings));
  };

  const formatDistance = (value: number) => {
    if (settings.distanceUnit === 'meters') {
      const meters = value * 0.9144; // Convert yards to meters
      return `${meters.toFixed(0)}m`;
    }
    return `${value}yd`;
  };

  const formatTemperature = (value: number) => {
    if (settings.temperatureUnit === 'fahrenheit') {
      const fahrenheit = (value * 9/5) + 32;
      return `${fahrenheit.toFixed(0)}°F`;
    }
    return `${value.toFixed(0)}°C`;
  };

  const formatAltitude = (value: number) => {
    if (settings.altitudeUnit === 'meters') {
      const meters = value * 0.3048; // Convert feet to meters
      return `${meters.toFixed(0)}m`;
    }
    return `${value.toFixed(0)}ft`;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        formatDistance,
        formatTemperature,
        formatAltitude,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
