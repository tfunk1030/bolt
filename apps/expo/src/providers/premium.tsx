import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PremiumFeatures {
  advancedCalculations: boolean;
  customClubs: boolean;
  dataExport: boolean;
  windCalculator: boolean;
}

interface PremiumContextType {
  isPremium: boolean;
  features: PremiumFeatures;
  setPremiumStatus: (status: boolean) => Promise<void>;
}

const defaultFeatures: PremiumFeatures = {
  advancedCalculations: false,
  customClubs: false,
  dataExport: false,
  windCalculator: false,
};

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [features, setFeatures] = useState<PremiumFeatures>(defaultFeatures);

  useEffect(() => {
    async function loadPremiumStatus() {
      try {
        const storedStatus = await AsyncStorage.getItem('premium_status');
        if (storedStatus) {
          const status = JSON.parse(storedStatus);
          setIsPremium(status);
          setFeatures({
            advancedCalculations: status,
            customClubs: status,
            dataExport: status,
            windCalculator: status,
          });
        }
      } catch (error) {
        console.error('Error loading premium status:', error);
      }
    }
    loadPremiumStatus();
  }, []);

  const setPremiumStatus = async (status: boolean) => {
    setIsPremium(status);
    setFeatures({
      advancedCalculations: status,
      customClubs: status,
      dataExport: status,
      windCalculator: status,
    });
    await AsyncStorage.setItem('premium_status', JSON.stringify(status));
  };

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        features,
        setPremiumStatus,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}
