import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Wind, Target, Cloud, Settings } from 'lucide-react-native';
import CalculatorScreen from '@/src/features/calculator/screen';
import WindScreen from '@/src/features/wind/screen';
import SettingsScreen from '@/src/features/settings/screen';
import HomeScreen from '@/src/features/home/screen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabBarIcon = ({ icon: Icon, color, size }: { icon: any; color: string; size: number }) => (
  <Icon color={color} size={size} />
);

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, any> = {
            Home: Cloud,
            Calculator: Target,
            Wind: Wind,
            Settings: Settings,
          };
          return <TabBarIcon icon={icons[route.name]} color={color} size={size} />;
        },
        tabBarActiveTintColor: '#60A5FA',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#111827',
          borderTopColor: '#1F2937',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calculator" component={CalculatorScreen} />
      <Tab.Screen name="Wind" component={WindScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#111827' },
          headerTintColor: '#F9FAFB',
          contentStyle: { backgroundColor: '#1F2937' },
        }}
      >
        <Stack.Screen
          name="Root"
          component={MainTabs}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
