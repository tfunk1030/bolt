import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClubData } from '../../../core/models/YardageModel';

interface ClubSettingsContextType {
  clubs: ClubData[];
  addClub: (club: ClubData) => Promise<void>;
  updateClub: (index: number, club: ClubData) => Promise<void>;
  removeClub: (index: number) => Promise<void>;
  getRecommendedClub: (targetYardage: number) => ClubData | null;
}

const DEFAULT_CLUBS: ClubData[] = [
  { name: "Driver", yardage: 300, loft: 9, ball_speed: 175.5, launch_angle: 11.0, spin_rate: 2575, max_height: 40, land_angle: 39, spin_decay: 0.08, wind_sensitivity: 1.0 },
  { name: "3-Wood", yardage: 260, loft: 15, ball_speed: 160, launch_angle: 11.5, spin_rate: 3143, max_height: 38, land_angle: 42, spin_decay: 0.09, wind_sensitivity: 1.0 },
  { name: "5-Wood", yardage: 235, loft: 18, ball_speed: 156, launch_angle: 9.7, spin_rate: 4322, max_height: 34, land_angle: 37, spin_decay: 0.10, wind_sensitivity: 1.0 },
  { name: "Hybrid", yardage: 235, loft: 20, ball_speed: 149, launch_angle: 10.2, spin_rate: 4587, max_height: 34, land_angle: 37, spin_decay: 0.10, wind_sensitivity: 1.0 },
  { name: "3-Iron", yardage: 235, loft: 21, ball_speed: 144.4, launch_angle: 11.5, spin_rate: 3573, max_height: 34, land_angle: 37, spin_decay: 0.10, wind_sensitivity: 1.0 },
  { name: "4-Iron", yardage: 220, loft: 24, ball_speed: 135.4, launch_angle: 13.5, spin_rate: 3573, max_height: 36, land_angle: 40, spin_decay: 0.105, wind_sensitivity: 1.0 },
  { name: "5-Iron", yardage: 205, loft: 27, ball_speed: 132.4, launch_angle: 15.6, spin_rate: 4474, max_height: 37, land_angle: 42.6, spin_decay: 0.11, wind_sensitivity: 1.0 },
  { name: "6-Iron", yardage: 192, loft: 30, ball_speed: 130, launch_angle: 16.0, spin_rate: 5004, max_height: 36.5, land_angle: 46, spin_decay: 0.115, wind_sensitivity: 1.0 },
  { name: "7-Iron", yardage: 180, loft: 34, ball_speed: 124, launch_angle: 17.8, spin_rate: 6024, max_height: 35, land_angle: 48.2, spin_decay: 0.12, wind_sensitivity: 1.0 },
  { name: "8-Iron", yardage: 165, loft: 38, ball_speed: 116, launch_angle: 22.5, spin_rate: 6608, max_height: 33.5, land_angle: 47.3, spin_decay: 0.13, wind_sensitivity: 1.0 },
  { name: "9-Iron", yardage: 153, loft: 42, ball_speed: 112, launch_angle: 22.6, spin_rate: 7793, max_height: 32.5, land_angle: 49.6, spin_decay: 0.14, wind_sensitivity: 1.0 },
  { name: "PW", yardage: 138, loft: 46, ball_speed: 107.5, launch_angle: 24.3, spin_rate: 8836, max_height: 31.5, land_angle: 50.6, spin_decay: 0.15, wind_sensitivity: 1.0 },
  { name: "GW", yardage: 125, loft: 50, ball_speed: 95.8, launch_angle: 27.0, spin_rate: 9170, max_height: 30.5, land_angle: 51.1, spin_decay: 0.155, wind_sensitivity: 1.0 },
  { name: "SW", yardage: 110, loft: 54, ball_speed: 89, launch_angle: 25.3, spin_rate: 10800, max_height: 28, land_angle: 51.4, spin_decay: 0.16, wind_sensitivity: 1.0 },
  { name: "LW", yardage: 90, loft: 58, ball_speed: 77, launch_angle: 33.1, spin_rate: 11000, max_height: 22, land_angle: 52, spin_decay: 0.165, wind_sensitivity: 1.0 }
];

const ClubSettingsContext = React.createContext<ClubSettingsContextType>({
  clubs: DEFAULT_CLUBS,
  addClub: async () => {},
  updateClub: async () => {},
  removeClub: async () => {},
  getRecommendedClub: () => null
});

export function ClubSettingsProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [clubs, setClubs] = React.useState<ClubData[]>(DEFAULT_CLUBS);

  // Load saved clubs on mount
  React.useEffect(() => {
    const loadSavedClubs = async () => {
      try {
        const savedClubs = await AsyncStorage.getItem('clubSettings');
        if (savedClubs) {
          const parsedClubs = JSON.parse(savedClubs);
          const validatedClubs = parsedClubs.map((club: Partial<ClubData>) => ({
            name: club.name ?? 'Unknown Club',
            yardage: club.yardage ?? 0,
            loft: club.loft ?? getDefaultLoft(club.name ?? 'Unknown Club')
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
    return [...clubs].sort((a, b) => b.yardage - a.yardage);
  };

  const saveClubs = async (clubsToSave: ClubData[]) => {
    try {
      await AsyncStorage.setItem('clubSettings', JSON.stringify(clubsToSave));
    } catch (error) {
      console.error('Failed to save club settings:', error);
    }
  };

  const addClub = React.useCallback(async (club: ClubData) => {
    setClubs(prev => {
      const newClubs = sortClubs([...prev, club]);
      saveClubs(newClubs);
      return newClubs;
    });
  }, []);

  const updateClub = React.useCallback(async (index: number, club: ClubData) => {
    setClubs(prev => {
      const newClubs = [...prev];
      newClubs[index] = club;
      const sortedClubs = sortClubs(newClubs);
      saveClubs(sortedClubs);
      return sortedClubs;
    });
  }, []);

  const removeClub = React.useCallback(async (index: number) => {
    setClubs(prev => {
      const newClubs = prev.filter((_, i) => i !== index);
      saveClubs(newClubs);
      return newClubs;
    });
  }, []);

  const getRecommendedClub = React.useCallback((targetYardage: number): ClubData | null => {
    console.log('Getting recommended club for yardage:', targetYardage);
    
    // Basic club distance ranges
    const clubRanges = [
      { name: 'Driver', min: 230, max: 320 },
      { name: '3-Wood', min: 215, max: 260 },
      { name: '5-Wood', min: 200, max: 240 },
      { name: '4-Iron', min: 180, max: 210 },
      { name: '5-Iron', min: 170, max: 195 },
      { name: '6-Iron', min: 160, max: 180 },
      { name: '7-Iron', min: 150, max: 170 },
      { name: '8-Iron', min: 140, max: 160 },
      { name: '9-Iron', min: 130, max: 150 },
      { name: 'PW', min: 115, max: 135 },
      { name: 'GW', min: 100, max: 120 },
      { name: 'SW', min: 80, max: 100 },
      { name: 'LW', min: 60, max: 90 },
    ];

    // Find the first club that matches the target yardage
    const recommendedClub = clubRanges.find(
      club => targetYardage >= club.min && targetYardage <= club.max
    );

    console.log('Found recommended club:', recommendedClub);
    return recommendedClub;
  }, []);

  const providerValue = React.useMemo(() => ({
    clubs,
    addClub,
    updateClub,
    removeClub,
    getRecommendedClub
  }), [clubs, addClub, updateClub, removeClub, getRecommendedClub]);

  return (
    <ClubSettingsContext.Provider value={providerValue}>
      {children}
    </ClubSettingsContext.Provider>
  );
}

export const useClubSettings = () => {
  const context = React.useContext(ClubSettingsContext);
  if (!context) {
    throw new Error('useClubSettings must be used within ClubSettingsProvider');
  }
  return context;
};
