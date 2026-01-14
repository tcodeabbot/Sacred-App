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
  const { withDangerousMod } = require('@expo/config-plugins');
  const fs = require('fs');
  const path = require('path');

  // Copy Android native files
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const sourceDir = path.join(projectRoot, 'android-native/prayer');
      const targetDir = path.join(
        projectRoot,
        'android/app/src/main/java/com/sacred/app/prayer'
      );

      // Only copy if source directory exists
      if (fs.existsSync(sourceDir)) {
        console.log('📦 Copying native Android prayer overlay files...');

        // Create target directory
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        // Copy all Java files
        const files = fs.readdirSync(sourceDir);
        files.forEach((file) => {
          if (file.endsWith('.java')) {
            const sourcePath = path.join(sourceDir, file);
            const targetPath = path.join(targetDir, file);
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`  ✅ Copied ${file}`);
          }
        });

        // Update MainApplication.kt to register the package
        const mainAppPath = path.join(
          projectRoot,
          'android/app/src/main/java/com/sacred/app/MainApplication.kt'
        );

        if (fs.existsSync(mainAppPath)) {
          let mainAppContent = fs.readFileSync(mainAppPath, 'utf8');

          // Add import if not present
          if (!mainAppContent.includes('import com.sacred.app.prayer.PrayerOverlayPackage')) {
            mainAppContent = mainAppContent.replace(
              /(package com\.sacred\.app)/,
              '$1\n\nimport com.sacred.app.prayer.PrayerOverlayPackage'
            );
          }

          // Add package to the list if not present
          if (!mainAppContent.includes('PrayerOverlayPackage()')) {
            mainAppContent = mainAppContent.replace(
              /(packages\.add\(.*?\))/s,
              '$1\n        packages.add(PrayerOverlayPackage())'
            );
          }

          fs.writeFileSync(mainAppPath, mainAppContent);
          console.log('  ✅ Updated MainApplication.kt');
        }
      } else {
        console.log('⚠️  Native Android files not found, skipping copy');
      }

      return config;
    },
  ]);

  return config;
}
