import { View } from 'react-native'
import { Stack } from 'expo-router'
import Navigation from '@/src/navigation/stack/root-navigator'
import { ThemeProvider } from '@/src/core/context/theme-context'
import { ClubSettingsProvider } from '@/src/features/settings/context/clubs'
import { SettingsProvider } from '@/src/core/context/settings'
import { UpgradeModal } from '@/src/core/components/ui/upgrade-modal'
import { EnvironmentalService } from '@/src/services/environmental-service'
import { ShotCalcProvider } from '@/src/core/context/shot-calc'
import { PremiumProvider } from '@/src/features/settings/context/premium'

// Initialize the environmental service
EnvironmentalService.getInstance().startMonitoring();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <PremiumProvider>
        <SettingsProvider>
          <ClubSettingsProvider>
            <ShotCalcProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: '#111827' }
                }}
              />
              <View style={{ flex: 1, paddingBottom: 20 }}>
                {children}
              </View>
              <Navigation />
              <UpgradeModal />
            </ShotCalcProvider>
          </ClubSettingsProvider>
        </SettingsProvider>
      </PremiumProvider>
    </ThemeProvider>
  )
}
