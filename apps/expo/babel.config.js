module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          blacklist: null,
          whitelist: ['EXPO_PUBLIC_OPENWEATHER_API_KEY'],
          safe: true,
          allowUndefined: false,
        },
      ],
      'react-native-reanimated/plugin',
      [
        '@tamagui/babel-plugin',
        {
          components: ['@tamagui/core'],
          config: './src/tamagui.config.ts',
        },
      ],
    ],
  };
};
