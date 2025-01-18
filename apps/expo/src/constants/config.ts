import Constants from 'expo-constants';

interface ExtraConfig {
  openWeatherApiKey?: string;
}

const extra = Constants.expoConfig?.extra as ExtraConfig;

export const config = {
  openWeatherApiKey: extra?.openWeatherApiKey || '',
};
