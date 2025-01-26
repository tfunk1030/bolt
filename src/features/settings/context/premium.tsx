import React, { createContext, useContext, useState } from 'react';

interface PremiumContextType {
  isPremium: boolean;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
}

const PremiumContext = createContext<PremiumContextType>({
  isPremium: __DEV__, // Premium enabled in dev mode
  showUpgradeModal: false,
  setShowUpgradeModal: () => {}
});

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isPremium] = useState(__DEV__); // Initialize with dev mode status

  return (
    <PremiumContext.Provider value={{ 
      isPremium,
      showUpgradeModal,
      setShowUpgradeModal
    }}>
      {children}
    </PremiumContext.Provider>
  );
}

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within PremiumProvider');
  }
  return context;
};
