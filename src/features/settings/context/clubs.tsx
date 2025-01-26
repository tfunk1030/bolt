import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClubData } from '@/src/core/models/YardageModel';

interface ClubSettingsContextType {
  clubs: ClubData[];
  addClub: (club: ClubData) => Promise<void>;
  updateClub: (index: number, club: ClubData) => Promise<void>;
  removeClub: (index: number) => Promise<void>;
  getRecommendedClub: (targetYardage: number) => ClubData | null;
}

const DEFAULT_CLUBS: ClubData[] = [
  { name: "Driver", normalYardage: 282, loft: 9.5 },
  { name: "3-Wood", normalYardage: 249, loft: 15 },
  { name: "5-Wood", normalYardage: 236, loft: 18 },
  { name: "Hybrid", normalYardage: 231, loft: 20 },
  { name: "3-Iron", normalYardage: 218, loft: 21 },
  { name: "4-Iron", normalYardage: 209, loft: 24 },
  { name: "5-Iron", normalYardage: 199, loft: 27 },
  { name: "6-Iron", normalYardage: 188, loft: 30 },
  { name: "7-Iron", normalYardage: 176, loft: 34 },
  { name: "8-Iron", normalYardage: 164, loft: 38 },
  { name: "9-Iron", normalYardage: 152, loft: 42 },
  { name: "PW", normalYardage: 142, loft: 46 },
  { name: "GW", normalYardage: 130, loft: 50 },
  { name: "SW", normalYardage: 118, loft: 54 },
  { name: "LW", normalYardage: 106, loft: 58 }
];

const ClubSettingsContext = createContext<ClubSettingsContextType>({
  clubs: DEFAULT_CLUBS,
  addClub: async () => {},
  updateClub: async () => {},
  removeClub: async () => {},
  getRecommendedClub: () => null
});

export function ClubSettingsProvider({ children }: { children: React.ReactNode }) {
  const [clubs, setClubs] = useState<ClubData[]>(DEFAULT_CLUBS);

  // Load saved clubs on mount
  useEffect(() => {
    const loadSavedClubs = async () => {
      try {
        const savedClubs = await AsyncStorage.getItem('clubSettings');
        if (savedClubs) {
          const parsedClubs = JSON.parse(savedClubs);
          const validatedClubs = parsedClubs.map((club: Partial<ClubData>) => ({
            name: club.name || 'Unknown Club',
            normalYardage: club.normalYardage || 0,
            loft: club.loft || getDefaultLoft(club.name || 'Unknown Club')
          }));
          setClubs(sortClubs(validatedClubs));
        }
      } catch (error) {
        console.error('Failed to load club settings:', error);
      }
    };

    loadSavedClubs();
  }, []);

  const getDefaultLoft = (clubName: string): number => {
    return DEFAULT_CLUBS.find(c => c.name === clubName)?.loft || 0;
  };

  const sortClubs = (clubs: ClubData[]): ClubData[] => {
    return [...clubs].sort((a, b) => b.normalYardage - a.normalYardage);
  };

  const saveClubs = async (clubsToSave: ClubData[]) => {
    try {
      await AsyncStorage.setItem('clubSettings', JSON.stringify(clubsToSave));
    } catch (error) {
      console.error('Failed to save club settings:', error);
    }
  };

  const addClub = useCallback(async (club: ClubData) => {
    setClubs(prev => {
      const newClubs = sortClubs([...prev, club]);
      saveClubs(newClubs);
      return newClubs;
    });
  }, []);

  const updateClub = useCallback(async (index: number, club: ClubData) => {
    setClubs(prev => {
      const newClubs = [...prev];
      newClubs[index] = club;
      const sortedClubs = sortClubs(newClubs);
      saveClubs(sortedClubs);
      return sortedClubs;
    });
  }, []);

  const removeClub = useCallback(async (index: number) => {
    setClubs(prev => {
      const newClubs = prev.filter((_, i) => i !== index);
      saveClubs(newClubs);
      return newClubs;
    });
  }, []);

  const getRecommendedClub = useCallback((targetYardage: number): ClubData | null => {
    if (!clubs.length) return null;

    return clubs.reduce((closest, current) => 
      Math.abs(current.normalYardage - targetYardage) < 
      Math.abs(closest.normalYardage - targetYardage) 
        ? current 
        : closest
    );
  }, [clubs]);

  return (
    <ClubSettingsContext.Provider value={{ 
      clubs,
      addClub,
      updateClub,
      removeClub,
      getRecommendedClub
    }}>
      {children}
    </ClubSettingsContext.Provider>
  );
}

export const useClubSettings = () => {
  const context = useContext(ClubSettingsContext);
  if (!context) {
    throw new Error('useClubSettings must be used within ClubSettingsProvider');
  }
  return context;
};
