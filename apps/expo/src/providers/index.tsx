import React from 'react';
import { SettingsProvider } from './settings';
import { ClubSettingsProvider } from './club-settings';
import { ShotCalcProvider } from './shot-calc';
import { QueryClientProvider, queryClient } from './query-client';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider>
      <SettingsProvider>
        <ClubSettingsProvider>
          <ShotCalcProvider>
            {children}
          </ShotCalcProvider>
        </ClubSettingsProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export { useSettings } from './settings';
export { useClubSettings } from './club-settings';
export { useShotCalc } from './shot-calc';
export { queryClient };
