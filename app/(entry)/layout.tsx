import { Slot } from 'expo-router';
import { ThemeProvider } from '@/src/core/context/theme-context';
import { ClubSettingsProvider } from '@/src/features/settings/context/clubs';
import { SettingsProvider } from '@/src/core/context/settings';
import { EnvironmentalService } from '@/src/services/environmental-service';
import { ShotCalcProvider } from '@/src/core/context/shot-calc';
import { PremiumProvider } from '@/src/features/settings/context/premium';

// Initialize environmental monitoring
EnvironmentalService.getInstance().startMonitoring();

export default function RootLayout() {
  return (
    <ThemeProvider>
      <PremiumProvider>
        <SettingsProvider>
          <ClubSettingsProvider>
            <ShotCalcProvider>
              <Slot />
            </ShotCalcProvider>
          </ClubSettingsProvider>
        </SettingsProvider>
      </PremiumProvider>
    </ThemeProvider>
  );
}
