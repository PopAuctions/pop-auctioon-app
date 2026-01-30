const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withScreenOrientation(config) {
  return withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application?.[0];
    if (!app?.activity) return config;

    const mainActivity = app.activity.find(
      (activity) => activity.$['android:name'] === '.MainActivity'
    );

    if (mainActivity) {
      // Force portrait at the Activity level (strongest place)
      mainActivity.$['android:screenOrientation'] = 'portrait';

      // DO NOT modify configChanges
    }

    return config;
  });
};
