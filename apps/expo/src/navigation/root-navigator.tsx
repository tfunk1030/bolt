import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, ColorValue } from 'react-native';
import { useTheme } from '@tamagui/core';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, TabParamList } from '../types/navigation';
import { DashboardScreen } from '../features/dashboard/screen';
import { ShotCalculatorScreen } from '../features/shot-calculator/screen';
import { WindCalculatorScreen } from '../features/wind-calculator/screen';
import { SettingsScreen } from '../features/settings/screen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

interface TabIconProps {
  color: ColorValue;
  size: number;
}

function MainNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background.val,
          borderTopColor: theme.border.val,
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.primary.val,
        tabBarInactiveTintColor: theme.secondary.val,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ShotCalculatorScreen}
        options={{
          tabBarIcon: ({ color, size }: TabIconProps) => (
            <Ionicons name="golf-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background.val,
        },
        headerTintColor: theme.text.val,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={MainNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ShotCalculator"
        component={ShotCalculatorScreen}
      />
      <Stack.Screen
        name="WindCalculator"
        component={WindCalculatorScreen}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          presentation: 'modal',
          headerLeft: Platform.OS === 'ios' ? () => null : undefined,
        }}
      />
    </Stack.Navigator>
  );
}
