import { Slot } from 'expo-router';
import { ThemeProvider } from '../../src/core/context/theme';
import { ClubSettingsProvider } from '../../src/features/settings/context/clubs';
import { SettingsProvider } from '../../src/core/context/settings';
import { EnvironmentalService } from '../../src/services/environmental-service';
import { ShotCalcProvider } from '../../src/core/context/shotcalc';
import { PremiumProvider } from '../../src/features/settings/context/premium';

// Initialize environmental monitoring
EnvironmentalService.getInstance().startMonitoring();

// Replace Stack with proper Expo Router structure
export default function RootLayout() {
  return (
    <ThemeProvider>
      <PremiumProvider>
        <SettingsProvider>
          <ClubSettingsProvider>
            <ShotCalcProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="calculator" />
                <Stack.Screen name="wind" />
                <Stack.Screen name="settings" />
              </Stack>
              <UpgradeModal />
            </ShotCalcProvider>
          </ClubSettingsProvider>
        </SettingsProvider>
      </PremiumProvider>
    </ThemeProvider>
  );
}

