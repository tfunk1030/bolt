import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Settings {
  distanceUnit: 'yards' | 'meters';
  temperatureUnit: 'celsius' | 'fahrenheit';
  altitudeUnit: 'feet' | 'meters';
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  convertDistance: (distance: number, to?: 'yards' | 'meters') => number;
  convertTemperature: (temp: number, to?: 'celsius' | 'fahrenheit') => number;
  convertAltitude: (altitude: number, to?: 'feet' | 'meters') => number;
  formatDistance: (distance: number) => string;
  formatTemperature: (temp: number) => string;
  formatAltitude: (altitude: number) => string;
}

const defaultSettings: Settings = {
  distanceUnit: 'yards',
  temperatureUnit: 'fahrenheit',
  altitudeUnit: 'feet'
};

const SettingsContext = React.createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: async () => {},
  convertDistance: () => 0,
  convertTemperature: () => 0,
  convertAltitude: () => 0,
  formatDistance: () => '',
  formatTemperature: () => '',
  formatAltitude: () => ''
});

export function SettingsProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [settings, setSettings] = React.useState<Settings>(defaultSettings);

  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem('userSettings');
        if (saved) setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  // Conversion functions remain unchanged
  const convertDistance = (distance: number, to?: 'yards' | 'meters') => {
    const unit = to || settings.distanceUnit;
    return unit === 'meters' ? distance * 0.9144 : distance / 0.9144;
  };

  const convertTemperature = (temp: number, to?: 'celsius' | 'fahrenheit') => {
    const unit = to || settings.temperatureUnit;
    return unit === 'fahrenheit' ? (temp * 9/5) + 32 : (temp - 32) * 5/9;
  };

  const convertAltitude = (altitude: number, to?: 'feet' | 'meters') => {
    const unit = to || settings.altitudeUnit;
    return unit === 'feet' ? altitude * 3.28084 : altitude / 3.28084;
  };

  const formatDistance = (distance: number) => 
    `${Math.round(distance)} ${settings.distanceUnit === 'yards' ? 'yds' : 'm'}`;

  const formatTemperature = (temp: number) => 
    `${(Math.round(temp * 10) / 10).toFixed(1)}°${settings.temperatureUnit[0].toUpperCase()}`;

  const formatAltitude = (altitude: number) => 
    `${Math.round(altitude)} ${settings.altitudeUnit === 'feet' ? 'ft' : 'm'}`;

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      convertDistance,
      convertTemperature,
      convertAltitude,
      formatDistance,
      formatTemperature,
      formatAltitude
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => React.useContext(SettingsContext);
