const { withPlugins } = require('expo/config-plugins')

module.exports = function withMMKVPlugin(config) {
  return withPlugins(config, ['react-native-mmkv'])
}