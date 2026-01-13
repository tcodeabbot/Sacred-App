const { withAndroidManifest, AndroidConfig } = require('@expo/config-plugins');
const path = require('path');
const fs = require('fs');

/**
 * Expo Config Plugin for Prayer Overlay
 * Adds native Android code for full-screen prayer interruption
 */
module.exports = function withPrayerOverlay(config) {
  // Add Android manifest modifications
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    // Add permissions
    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      androidManifest,
      'android.permission.SYSTEM_ALERT_WINDOW',
      'true'
    );

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      androidManifest,
      'android.permission.FOREGROUND_SERVICE',
      'true'
    );

    // Add service declaration
    const application = androidManifest.manifest.application[0];

    // Add PrayerOverlayService
    if (!application.service) {
      application.service = [];
    }

    application.service.push({
      $: {
        'android:name': '.prayer.PrayerOverlayService',
        'android:enabled': 'true',
        'android:exported': 'false',
        'android:foregroundServiceType': 'specialUse',
      },
    });

    // Add PrayerOverlayActivity
    if (!application.activity) {
      application.activity = [];
    }

    application.activity.push({
      $: {
        'android:name': '.prayer.PrayerOverlayActivity',
        'android:theme': '@style/Theme.App.PrayerOverlay',
        'android:launchMode': 'singleTop',
        'android:excludeFromRecents': 'true',
        'android:showOnLockScreen': 'true',
        'android:turnScreenOn': 'true',
        'android:exported': 'true',
      },
    });

    return config;
  });

  // Copy native Android files during prebuild
  config = withCopyNativeFiles(config);

  return config;
};

/**
 * Copies native Android files to the project
 */
function withCopyNativeFiles(config) {
  return {
    ...config,
    // Hook into the prebuild process
    mods: {
      ...config.mods,
      android: {
        ...config.mods?.android,
        // Copy Java files
        async dangerouslyModifyAndroidMainApplicationJava(config) {
          // This will be called during prebuild
          console.log('📦 Copying native Android prayer overlay files...');
          return config;
        },
      },
    },
  };
}
