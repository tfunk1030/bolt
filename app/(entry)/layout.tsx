'use client'

import './globals.css'
import Navigation from '@/components/navigation'
import { ThemeProvider } from '@/src/contexts/theme-context'
import { WebGLProvider } from '@/src/contexts/webgl-context'
import { PremiumProvider } from '@/src/contexts/premium-context'
import { ClubSettingsProvider } from '@/src/contexts/club-settings-context'
import { SettingsProvider } from '@/src/contexts/settings-context'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { UpgradeModal } from '@/components/ui/upgrade-modal'
import { EnvironmentalService } from '@/lib/environmental-service'
import { ShotCalcProvider } from '@/lib/shot-calc-context'

// Initialize the environmental service
if (typeof window !== 'undefined') {
  EnvironmentalService.getInstance().startMonitoring();
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-900 text-gray-100 transition-colors">
        <ThemeProvider>
          <WebGLProvider>
            <PremiumProvider>
              <SettingsProvider>
                <ClubSettingsProvider>
                  <ShotCalcProvider>
                    <main className="pb-20">
                      {children}
                    </main>
                    <Navigation />
                    <ThemeToggle />
                    <UpgradeModal />
                  </ShotCalcProvider>
                </ClubSettingsProvider>
              </SettingsProvider>
            </PremiumProvider>
          </WebGLProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
