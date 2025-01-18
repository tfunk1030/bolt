import React from 'react';
import { TamaguiProvider } from 'tamagui';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { config } from './tamagui.config';
import { Providers } from './providers';
import { RootNavigator } from './navigation/root-navigator';

export default function App() {
  return (
    <TamaguiProvider config={config}>
      <SafeAreaProvider>
        <Providers>
          <StatusBar style="auto" />
          <RootNavigator />
        </Providers>
      </SafeAreaProvider>
    </TamaguiProvider>
  );
}
