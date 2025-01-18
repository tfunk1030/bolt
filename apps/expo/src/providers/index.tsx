import React from 'react';
import { SettingsProvider } from './settings';
import { ClubSettingsProvider } from './club-settings';
import { ShotCalcProvider } from './shot-calc';
import { QueryClientProvider, queryClient } from './query-client';
import { TamaguiProvider } from './tamagui-provider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <TamaguiProvider>
      <QueryClientProvider>
        <SettingsProvider>
          <ClubSettingsProvider>
            <ShotCalcProvider>
              {children}
            </ShotCalcProvider>
          </ClubSettingsProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </TamaguiProvider>
  );
}

export { useSettings } from './settings';
export { useClubSettings } from './club-settings';
export { useShotCalc } from './shot-calc';
export { queryClient };
