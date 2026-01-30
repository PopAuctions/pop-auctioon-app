const { withAndroidManifest } = require('@expo/config-plugins');

const withScreenOrientation = (config) => {
  return withAndroidManifest(config, (config) => {
    const mainActivity =
      config.modResults.manifest.application[0].activity.find(
        (activity) => activity.$['android:name'] === '.MainActivity'
      );

    if (mainActivity) {
      // Set screenOrientation to nosensor (most restrictive - ignores accelerometer)
      mainActivity.$['android:screenOrientation'] = 'nosensor';

      // Remove orientation from configChanges to prevent rotation handling
      const configChanges = mainActivity.$['android:configChanges'];
      if (configChanges) {
        mainActivity.$['android:configChanges'] = configChanges
          .split('|')
          .filter((change) => change !== 'orientation')
          .join('|');
      }
    }

    return config;
  });
};

module.exports = withScreenOrientation;
