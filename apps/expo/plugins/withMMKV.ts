import { ConfigPlugin, withPlugins } from '@expo/config-plugins'

const withMMKV: ConfigPlugin = (config) => {
  return withPlugins(config, [
    ['react-native-mmkv', {
      ios: {},
      android: {}
    }]
  ])
}

export default withMMKV 