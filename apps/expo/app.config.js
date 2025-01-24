const { withPlugins } = require('@expo/config-plugins');
const withMMKV = require('./plugins/withMMKV');

module.exports = ({ config }) => {
  return withPlugins(config, [
    withMMKV,
    // Other plugins can be added here
  ]);
};