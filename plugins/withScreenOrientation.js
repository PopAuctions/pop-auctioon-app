const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withScreenOrientation(config) {
  return withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application?.[0];
    if (!app?.activity) return config;

    const mainActivity = app.activity.find(
      (activity) => activity.$['android:name'] === '.MainActivity'
    );

    if (mainActivity) {
      // Force portrait - use 'locked' which is more restrictive than 'portrait'
      mainActivity.$['android:screenOrientation'] = 'locked';

      // Disable screen compatibility mode (forces full control)
      mainActivity.$['android:resizeableActivity'] = 'false';
    }

    return config;
  });
};
