import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { ClubSettingsProvider } from '@/src/features/settings/context/clubs';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome5>['name'];
  color: string;
}) {
  return <FontAwesome5 size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ClubSettingsProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#111827' },
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: '#6B7280',
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <FontAwesome5 name="thermometer-half" size={24} color={color} />
          }}
        />
        <Tabs.Screen
          name="shot"
          options={{
            title: 'Shot',
            tabBarIcon: ({ color }) => <FontAwesome5 name="bullseye" size={24} color={color} />
          }}
        />
        <Tabs.Screen
          name="wind"
          options={{
            title: 'Wind',
            tabBarIcon: ({ color }) => <FontAwesome5 name="wind" size={24} color={color} />
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <FontAwesome5 name="cog" size={24} color={color} />
          }}
        />
      </Tabs>
    </ClubSettingsProvider>
  );
}
