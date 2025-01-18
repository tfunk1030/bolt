import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useAppState } from './use-app-state';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationHook {
  token: string | null;
  permission: boolean;
  loading: boolean;
  error: string | null;
  sendWindAlert: (windSpeed: number, location: string) => Promise<void>;
  requestPermissions: () => Promise<boolean>;
}

export function useNotifications(): NotificationHook {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { preferences } = useAppState();

  const requestPermissions = useCallback(async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        setError('Permission not granted for notifications');
        setPermission(false);
        return false;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Replace with your actual project ID
      });
      
      setToken(tokenData.data);
      setPermission(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get notification permissions');
      return false;
    }
  }, []);

  const sendWindAlert = useCallback(async (windSpeed: number, location: string) => {
    if (!preferences.showWindAlerts || windSpeed < preferences.windAlertThreshold) {
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Wind Alert 🌬️',
          body: `Current wind speed at ${location} is ${windSpeed}${preferences.useMetricUnits ? 'km/h' : 'mph'}`,
          data: { windSpeed, location },
        },
        trigger: null, // Send immediately
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send wind alert');
    }
  }, [preferences]);

  useEffect(() => {
    async function setupNotifications() {
      try {
        setLoading(true);
        setError(null);

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('wind-alerts', {
            name: 'Wind Alerts',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }

        await requestPermissions();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to setup notifications');
      } finally {
        setLoading(false);
      }
    }

    setupNotifications();
  }, [requestPermissions]);

  return {
    token,
    permission,
    loading,
    error,
    sendWindAlert,
    requestPermissions,
  };
}

export type { NotificationHook };
