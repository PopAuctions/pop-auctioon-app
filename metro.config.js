const { withNativeWind } = require('nativewind/metro');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(process.cwd());

module.exports = withNativeWind(config, { input: './global.css' });
