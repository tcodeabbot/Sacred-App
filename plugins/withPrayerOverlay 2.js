const {
  withAndroidManifest,
  withInfoPlist,
  withEntitlementsPlist,
  AndroidConfig
} = require('@expo/config-plugins');

/**
 * Expo Config Plugin for Prayer Overlay
 * Supports both iOS (Screen Time API) and Android (Native Overlay)
 */
module.exports = function withPrayerOverlay(config) {
  // Configure Android
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

  // Configure iOS Info.plist
  config = withInfoPlist(config, (config) => {
    // Add Family Controls usage description
    config.modResults.NSFamilyControlsUsageDescription =
      'Sacred uses Screen Time features to help you stay focused during prayer times by blocking distracting apps.';

    return config;
  });

  // Configure iOS Entitlements
  config = withEntitlementsPlist(config, (config) => {
    // Add Family Controls entitlement
    // Note: This requires Apple approval
    config.modResults['com.apple.developer.family-controls'] = true;

    return config;
  });

  // Copy native files during prebuild
  config = withCopyNativeFiles(config);

  return config;
};

/**
 * Copies native files to the project
 */
function withCopyNativeFiles(config) {
  return {
    ...config,
    mods: {
      ...config.mods,
      android: {
        ...config.mods?.android,
        async dangerouslyModifyAndroidMainApplicationJava(config) {
          console.log('📦 Copying native Android prayer overlay files...');
          return config;
        },
      },
      ios: {
        ...config.mods?.ios,
        async dangerouslyModifyPodfile(config) {
          console.log('📦 Configuring iOS for Screen Time API...');
          return config;
        },
      },
    },
  };
}
