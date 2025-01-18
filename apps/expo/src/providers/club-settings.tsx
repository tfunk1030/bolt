import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Club, defaultClubs } from '../utils/club-mapping';

interface ClubSettings {
  clubs: Club[];
  userAdjustments: Record<string, number>; // Club name -> yardage adjustment
}

interface ClubSettingsContextType {
  settings: ClubSettings;
  updateClubYardage: (clubName: string, adjustment: number) => Promise<void>;
  getRecommendedClub: (targetYardage: number) => Club | null;
  resetToDefaults: () => Promise<void>;
}

const defaultSettings: ClubSettings = {
  clubs: defaultClubs,
  userAdjustments: {},
};

const ClubSettingsContext = createContext<ClubSettingsContextType>({
  settings: defaultSettings,
  updateClubYardage: async () => {},
  getRecommendedClub: () => null,
  resetToDefaults: async () => {},
});

export function ClubSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ClubSettings>(defaultSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('clubSettings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Error loading club settings:', error);
    }
  };

  const saveSettings = async (newSettings: ClubSettings) => {
    try {
      await AsyncStorage.setItem('clubSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving club settings:', error);
    }
  };

  const updateClubYardage = async (clubName: string, adjustment: number) => {
    const newSettings = {
      ...settings,
      userAdjustments: {
        ...settings.userAdjustments,
        [clubName]: adjustment,
      },
    };
    await saveSettings(newSettings);
  };

  const getRecommendedClub = (targetYardage: number): Club | null => {
    // Get clubs with user adjustments applied
    const adjustedClubs = settings.clubs.map(club => ({
      ...club,
      normalYardage: club.normalYardage + (settings.userAdjustments[club.name] || 0),
    }));

    // Sort clubs by yardage difference from target
    const sortedClubs = [...adjustedClubs].sort((a, b) => {
      const aDiff = Math.abs(a.normalYardage - targetYardage);
      const bDiff = Math.abs(b.normalYardage - targetYardage);
      return aDiff - bDiff;
    });

    // Return the closest match
    return sortedClubs[0] || null;
  };

  const resetToDefaults = async () => {
    await saveSettings(defaultSettings);
  };

  return (
    <ClubSettingsContext.Provider
      value={{
        settings,
        updateClubYardage,
        getRecommendedClub,
        resetToDefaults,
      }}
    >
      {children}
    </ClubSettingsContext.Provider>
  );
}

export function useClubSettings() {
  const context = useContext(ClubSettingsContext);
  if (!context) {
    throw new Error('useClubSettings must be used within a ClubSettingsProvider');
  }
  return context;
}
