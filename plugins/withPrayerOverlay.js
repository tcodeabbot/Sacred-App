const {
  withXcodeProject,
  withEntitlementsPlist,
  withInfoPlist,
  withAndroidManifest,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const APP_GROUP = 'group.com.sacred.app';

const EXTENSIONS = [
  {
    name: 'DeviceActivityMonitorExtension',
    extensionPointId: 'com.apple.deviceactivity.monitor-extension',
    principalClass: 'DeviceActivityMonitorExtension',
    frameworks: ['DeviceActivity', 'ManagedSettings', 'FamilyControls'],
  },
  {
    name: 'ShieldConfigurationExtension',
    extensionPointId: 'com.apple.ManagedSettingsUI.shield-configuration-service',
    principalClass: 'ShieldConfigurationExtension',
    frameworks: ['ManagedSettings', 'ManagedSettingsUI'],
  },
  {
    name: 'ShieldActionExtension',
    extensionPointId: 'com.apple.ManagedSettings.shield-action-service',
    principalClass: 'ShieldActionExtension',
    frameworks: ['ManagedSettings', 'ManagedSettingsUI'],
  },
];

module.exports = function withPrayerOverlay(config) {
  const bundleId = config.ios?.bundleIdentifier || 'com.eidos.sacred-mobile-app';

  // iOS: Main app entitlements
  config = withEntitlementsPlist(config, (config) => {
    config.modResults['com.apple.developer.family-controls'] = true;
    config.modResults['com.apple.security.application-groups'] = [APP_GROUP];
    return config;
  });

  // iOS: Info.plist
  config = withInfoPlist(config, (config) => {
    config.modResults.NSFamilyControlsUsageDescription =
      'Sacred uses Screen Time features to help you stay focused during prayer times by blocking distracting apps.';
    return config;
  });

  // iOS: Xcode project — copy files + add extension targets
  config = withXcodeProject(config, (config) => {
    const project = config.modResults;
    const projectRoot = config.modRequest.projectRoot;
    const projectName = config.modRequest.projectName || 'Sacred';
    const iosDir = path.join(projectRoot, 'ios');
    const appDir = path.join(iosDir, projectName);

    console.log('🙏 Setting up Prayer Screen Time extensions...');

    // Step 1: Write native module files to main app directory
    writeNativeModuleFiles(appDir, projectRoot);

    // Step 2: Add native module files to main Xcode target
    addNativeModuleToMainTarget(project, projectName);

    // Step 3: Write extension files to disk and add targets
    for (const ext of EXTENSIONS) {
      const extBundleId = `${bundleId}.${ext.name}`;
      writeExtensionFiles(iosDir, ext);
      addExtensionTarget(project, ext, extBundleId);
    }

    console.log('✅ Prayer Screen Time extensions configured');
    return config;
  });

  // Android: Manifest modifications
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const application = androidManifest.manifest.application[0];

    if (!application.service) application.service = [];
    if (!application.service.some((s) => s.$['android:name'] === '.prayer.PrayerOverlayService')) {
      application.service.push({
        $: {
          'android:name': '.prayer.PrayerOverlayService',
          'android:enabled': 'true',
          'android:exported': 'false',
          'android:foregroundServiceType': 'specialUse',
        },
      });
    }

    if (!application.activity) application.activity = [];
    if (!application.activity.some((a) => a.$['android:name'] === '.prayer.PrayerOverlayActivity')) {
      application.activity.push({
        $: {
          'android:name': '.prayer.PrayerOverlayActivity',
          'android:launchMode': 'singleTop',
          'android:excludeFromRecents': 'true',
          'android:exported': 'true',
        },
      });
    }

    return config;
  });

  // Android: Copy native files
  config = withCopyAndroidNativeFiles(config);

  return config;
};

// =============================================================================
// FILE GENERATION
// =============================================================================

function writeNativeModuleFiles(appDir, projectRoot) {
  const srcDir = path.join(projectRoot, 'ios-native', 'prayer');

  const filesToCopy = [
    { src: 'PrayerScreenTimeManager.swift', dest: 'PrayerScreenTimeManager.swift' },
    { src: 'PrayerScreenTimeManager.m', dest: 'PrayerScreenTimeManager.m' },
  ];

  for (const file of filesToCopy) {
    const srcPath = path.join(srcDir, file.src);
    const destPath = path.join(appDir, file.dest);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  ✅ Copied ${file.dest} to ${path.basename(appDir)}/`);
    } else {
      console.log(`  ⚠️  Source not found: ${srcPath}, generating...`);
      fs.writeFileSync(destPath, getGeneratedSwiftContent(file.dest));
    }
  }
}

function writeExtensionFiles(iosDir, ext) {
  const extDir = path.join(iosDir, ext.name);
  if (!fs.existsSync(extDir)) {
    fs.mkdirSync(extDir, { recursive: true });
  }

  // Info.plist
  fs.writeFileSync(
    path.join(extDir, 'Info.plist'),
    getExtensionInfoPlist(ext)
  );

  // Entitlements
  fs.writeFileSync(
    path.join(extDir, `${ext.name}.entitlements`),
    getExtensionEntitlements()
  );

  // Swift source
  fs.writeFileSync(
    path.join(extDir, `${ext.name}.swift`),
    getExtensionSwiftSource(ext.name)
  );

  console.log(`  ✅ Created ${ext.name}/ with source, Info.plist, and entitlements`);
}

// =============================================================================
// XCODE PROJECT MODIFICATIONS
// =============================================================================

function addNativeModuleToMainTarget(project, projectName) {
  const files = [
    { name: 'PrayerScreenTimeManager.swift', type: 'sourcecode.swift' },
    { name: 'PrayerScreenTimeManager.m', type: 'sourcecode.c.objc' },
  ];

  const objects = project.hash.project.objects;
  const mainTargetUuid = project.getFirstTarget().uuid;

  // Find the Sacred group
  const sacredGroupKey = findGroupKey(objects, projectName);

  // Find the main target's Sources build phase
  const sourcesPhaseKey = findSourcesBuildPhase(objects, mainTargetUuid);

  for (const file of files) {
    // Check if already added
    if (fileReferenceExists(objects, file.name)) {
      console.log(`  ℹ️  ${file.name} already in project`);
      continue;
    }

    // Create PBXFileReference
    const fileRefUuid = project.generateUuid();
    objects['PBXFileReference'][fileRefUuid] = {
      isa: 'PBXFileReference',
      fileEncoding: 4,
      lastKnownFileType: file.type,
      name: file.name,
      path: `${projectName}/${file.name}`,
      sourceTree: '"<group>"',
    };
    objects['PBXFileReference'][fileRefUuid + '_comment'] = file.name;

    // Create PBXBuildFile
    const buildFileUuid = project.generateUuid();
    objects['PBXBuildFile'][buildFileUuid] = {
      isa: 'PBXBuildFile',
      fileRef: fileRefUuid,
      fileRef_comment: file.name,
    };
    objects['PBXBuildFile'][buildFileUuid + '_comment'] = `${file.name} in Sources`;

    // Add to Sacred group
    if (sacredGroupKey) {
      objects['PBXGroup'][sacredGroupKey].children.push({
        value: fileRefUuid,
        comment: file.name,
      });
    }

    // Add to Sources build phase
    if (sourcesPhaseKey) {
      objects['PBXSourcesBuildPhase'][sourcesPhaseKey].files.push({
        value: buildFileUuid,
        comment: `${file.name} in Sources`,
      });
    }

    console.log(`  ✅ Added ${file.name} to main target`);
  }
}

function addExtensionTarget(project, ext, bundleId) {
  const objects = project.hash.project.objects;

  // Use the built-in addTarget to create the basic structure
  const target = project.addTarget(ext.name, 'app_extension', ext.name, bundleId);

  // Fix up build settings for each configuration
  const nativeTarget = objects['PBXNativeTarget'][target.uuid];
  const configListUuid = nativeTarget.buildConfigurationList;
  const configList = objects['XCConfigurationList'][configListUuid];

  if (configList && configList.buildConfigurations) {
    for (const configRef of configList.buildConfigurations) {
      const configUuid = configRef.value;
      const config = objects['XCBuildConfiguration'][configUuid];
      if (!config || !config.buildSettings) continue;

      Object.assign(config.buildSettings, {
        INFOPLIST_FILE: `"${ext.name}/Info.plist"`,
        CODE_SIGN_ENTITLEMENTS: `"${ext.name}/${ext.name}.entitlements"`,
        SWIFT_VERSION: '5.0',
        IPHONEOS_DEPLOYMENT_TARGET: '16.0',
        TARGETED_DEVICE_FAMILY: '"1,2"',
        CURRENT_PROJECT_VERSION: '1',
        MARKETING_VERSION: '1.0',
        GENERATE_INFOPLIST_FILE: 'NO',
        SWIFT_EMIT_LOC_STRINGS: 'YES',
        SWIFT_OPTIMIZATION_LEVEL: '"-Onone"',
      });
    }
  }

  // Create file references for extension files
  const swiftFileRefUuid = project.generateUuid();
  objects['PBXFileReference'][swiftFileRefUuid] = {
    isa: 'PBXFileReference',
    lastKnownFileType: 'sourcecode.swift',
    path: `"${ext.name}.swift"`,
    sourceTree: '"<group>"',
  };
  objects['PBXFileReference'][swiftFileRefUuid + '_comment'] = `${ext.name}.swift`;

  const plistFileRefUuid = project.generateUuid();
  objects['PBXFileReference'][plistFileRefUuid] = {
    isa: 'PBXFileReference',
    lastKnownFileType: 'text.plist.xml',
    path: '"Info.plist"',
    sourceTree: '"<group>"',
  };
  objects['PBXFileReference'][plistFileRefUuid + '_comment'] = 'Info.plist';

  const entFileRefUuid = project.generateUuid();
  objects['PBXFileReference'][entFileRefUuid] = {
    isa: 'PBXFileReference',
    lastKnownFileType: 'text.plist.entitlements',
    path: `"${ext.name}.entitlements"`,
    sourceTree: '"<group>"',
  };
  objects['PBXFileReference'][entFileRefUuid + '_comment'] = `${ext.name}.entitlements`;

  // Create PBXGroup for this extension
  const groupUuid = project.generateUuid();
  objects['PBXGroup'][groupUuid] = {
    isa: 'PBXGroup',
    children: [
      { value: swiftFileRefUuid, comment: `${ext.name}.swift` },
      { value: plistFileRefUuid, comment: 'Info.plist' },
      { value: entFileRefUuid, comment: `${ext.name}.entitlements` },
    ],
    path: `"${ext.name}"`,
    sourceTree: '"<group>"',
  };
  objects['PBXGroup'][groupUuid + '_comment'] = ext.name;

  // Add group to main project group
  const projectSection = objects['PBXProject'];
  for (const projKey in projectSection) {
    if (typeof projectSection[projKey] === 'string') continue;
    const proj = projectSection[projKey];
    if (proj.mainGroup) {
      const mainGroup = objects['PBXGroup'][proj.mainGroup];
      if (mainGroup) {
        mainGroup.children.push({
          value: groupUuid,
          comment: ext.name,
        });
      }
      break;
    }
  }

  // Create PBXBuildFile for the Swift source
  const buildFileUuid = project.generateUuid();
  objects['PBXBuildFile'][buildFileUuid] = {
    isa: 'PBXBuildFile',
    fileRef: swiftFileRefUuid,
    fileRef_comment: `${ext.name}.swift`,
  };
  objects['PBXBuildFile'][buildFileUuid + '_comment'] = `${ext.name}.swift in Sources`;

  // Create Sources build phase for the extension target
  const sourcesBPUuid = project.generateUuid();
  objects['PBXSourcesBuildPhase'] = objects['PBXSourcesBuildPhase'] || {};
  objects['PBXSourcesBuildPhase'][sourcesBPUuid] = {
    isa: 'PBXSourcesBuildPhase',
    buildActionMask: 2147483647,
    files: [
      { value: buildFileUuid, comment: `${ext.name}.swift in Sources` },
    ],
    runOnlyForDeploymentPostprocessing: 0,
  };
  objects['PBXSourcesBuildPhase'][sourcesBPUuid + '_comment'] = 'Sources';

  // Create Frameworks build phase
  const fwBPUuid = project.generateUuid();
  const fwBuildFiles = [];
  for (const fwName of ext.frameworks) {
    const fwFileRefUuid = project.generateUuid();
    objects['PBXFileReference'][fwFileRefUuid] = {
      isa: 'PBXFileReference',
      lastKnownFileType: 'wrapper.framework',
      name: `"${fwName}.framework"`,
      path: `"System/Library/Frameworks/${fwName}.framework"`,
      sourceTree: 'SDKROOT',
    };
    objects['PBXFileReference'][fwFileRefUuid + '_comment'] = `${fwName}.framework`;

    const fwBuildFileUuid = project.generateUuid();
    objects['PBXBuildFile'][fwBuildFileUuid] = {
      isa: 'PBXBuildFile',
      fileRef: fwFileRefUuid,
      fileRef_comment: `${fwName}.framework`,
    };
    objects['PBXBuildFile'][fwBuildFileUuid + '_comment'] = `${fwName}.framework in Frameworks`;

    fwBuildFiles.push({
      value: fwBuildFileUuid,
      comment: `${fwName}.framework in Frameworks`,
    });
  }

  objects['PBXFrameworksBuildPhase'] = objects['PBXFrameworksBuildPhase'] || {};
  objects['PBXFrameworksBuildPhase'][fwBPUuid] = {
    isa: 'PBXFrameworksBuildPhase',
    buildActionMask: 2147483647,
    files: fwBuildFiles,
    runOnlyForDeploymentPostprocessing: 0,
  };
  objects['PBXFrameworksBuildPhase'][fwBPUuid + '_comment'] = 'Frameworks';

  // Add build phases to the target
  nativeTarget.buildPhases = [
    { value: sourcesBPUuid, comment: 'Sources' },
    { value: fwBPUuid, comment: 'Frameworks' },
  ];

  console.log(`  ✅ Added extension target: ${ext.name}`);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function findGroupKey(objects, name) {
  const groups = objects['PBXGroup'];
  for (const key in groups) {
    if (typeof groups[key] === 'string') continue;
    if (groups[key].name === name || groups[key].name === `"${name}"`) {
      if (groups[key].children && groups[key].children.length > 2) {
        return key;
      }
    }
  }
  return null;
}

function findSourcesBuildPhase(objects, targetUuid) {
  const target = objects['PBXNativeTarget'][targetUuid];
  if (!target || !target.buildPhases) return null;

  for (const phase of target.buildPhases) {
    const phaseUuid = phase.value || phase;
    if (objects['PBXSourcesBuildPhase'] && objects['PBXSourcesBuildPhase'][phaseUuid]) {
      return phaseUuid;
    }
  }
  return null;
}

function fileReferenceExists(objects, fileName) {
  const refs = objects['PBXFileReference'];
  for (const key in refs) {
    if (typeof refs[key] === 'string') continue;
    if (refs[key].name === fileName || refs[key].name === `"${fileName}"`) {
      return true;
    }
  }
  return false;
}

// =============================================================================
// EXTENSION FILE CONTENT GENERATORS
// =============================================================================

function getExtensionInfoPlist(ext) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDisplayName</key>
    <string>${ext.name}</string>
    <key>CFBundleName</key>
    <string>$(PRODUCT_NAME)</string>
    <key>CFBundleIdentifier</key>
    <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
    <key>CFBundleVersion</key>
    <string>$(CURRENT_PROJECT_VERSION)</string>
    <key>CFBundleShortVersionString</key>
    <string>$(MARKETING_VERSION)</string>
    <key>CFBundlePackageType</key>
    <string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>MinimumOSVersion</key>
    <string>16.0</string>
    <key>NSExtension</key>
    <dict>
        <key>NSExtensionPointIdentifier</key>
        <string>${ext.extensionPointId}</string>
        <key>NSExtensionPrincipalClass</key>
        <string>$(PRODUCT_MODULE_NAME).${ext.principalClass}</string>
    </dict>
</dict>
</plist>`;
}

function getExtensionEntitlements() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>com.apple.developer.family-controls</key>
    <true/>
    <key>com.apple.security.application-groups</key>
    <array>
      <string>${APP_GROUP}</string>
    </array>
  </dict>
</plist>`;
}

function getExtensionSwiftSource(extensionName) {
  switch (extensionName) {
    case 'DeviceActivityMonitorExtension':
      return DEVICE_ACTIVITY_MONITOR_SOURCE;
    case 'ShieldConfigurationExtension':
      return SHIELD_CONFIGURATION_SOURCE;
    case 'ShieldActionExtension':
      return SHIELD_ACTION_SOURCE;
    default:
      return '';
  }
}

function getGeneratedSwiftContent(fileName) {
  if (fileName === 'PrayerScreenTimeManager.swift') {
    return PRAYER_SCREEN_TIME_MANAGER_SWIFT;
  }
  if (fileName === 'PrayerScreenTimeManager.m') {
    return PRAYER_SCREEN_TIME_MANAGER_M;
  }
  return '';
}

// =============================================================================
// SWIFT SOURCE CODE
// =============================================================================

const DEVICE_ACTIVITY_MONITOR_SOURCE = `import DeviceActivity
import ManagedSettings
import FamilyControls

class DeviceActivityMonitorExtension: DeviceActivityMonitor {

    let store = ManagedSettingsStore()
    let sharedDefaults = UserDefaults(suiteName: "${APP_GROUP}")

    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)

        NSLog("🕌 Prayer time started: \\(activity.rawValue)")

        store.shield.applications = .all()

        sharedDefaults?.set(true, forKey: "prayerActive")
        sharedDefaults?.set(activity.rawValue, forKey: "currentActivity")
        sharedDefaults?.set(Date().timeIntervalSince1970, forKey: "prayerStartTime")
        sharedDefaults?.synchronize()

        NSLog("✅ Shield activated for all apps")
    }

    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)

        NSLog("🕌 Prayer time ended: \\(activity.rawValue)")

        store.shield.applications = nil
        store.shield.applicationCategories = nil
        store.shield.webDomains = nil
        store.shield.webDomainCategories = nil

        sharedDefaults?.set(false, forKey: "prayerActive")
        sharedDefaults?.removeObject(forKey: "currentActivity")
        sharedDefaults?.removeObject(forKey: "prayerStartTime")
        sharedDefaults?.synchronize()

        NSLog("✅ Shield deactivated")
    }

    override func intervalWillStartWarning(for activity: DeviceActivityName) {
        super.intervalWillStartWarning(for: activity)
        NSLog("⏰ Prayer time approaching: \\(activity.rawValue)")
    }

    override func intervalWillEndWarning(for activity: DeviceActivityName) {
        super.intervalWillEndWarning(for: activity)
        NSLog("⏰ Prayer time ending soon: \\(activity.rawValue)")
    }
}
`;

const SHIELD_CONFIGURATION_SOURCE = `import ManagedSettings
import ManagedSettingsUI
import UIKit

class ShieldConfigurationExtension: ShieldConfigurationDataSource {

    let sharedDefaults = UserDefaults(suiteName: "${APP_GROUP}")

    override func configuration(shielding application: Application) -> ShieldConfiguration {
        return buildShieldConfig()
    }

    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        return buildShieldConfig()
    }

    override func configuration(shielding application: Application, in category: ActivityCategory) -> ShieldConfiguration {
        return buildShieldConfig()
    }

    override func configuration(shielding webDomain: WebDomain, in category: ActivityCategory) -> ShieldConfiguration {
        return buildShieldConfig()
    }

    private func buildShieldConfig() -> ShieldConfiguration {
        let activityName = sharedDefaults?.string(forKey: "currentActivity") ?? "Prayer Time"
        let displayName = activityName
            .replacingOccurrences(of: "prayer_", with: "")
            .capitalized

        return ShieldConfiguration(
            backgroundBlurStyle: .systemThickMaterial,
            backgroundColor: UIColor(red: 0.04, green: 0.30, blue: 0.27, alpha: 0.95),
            icon: UIImage(systemName: "moon.stars.fill"),
            title: ShieldConfiguration.Label(
                text: displayName,
                color: .white
            ),
            subtitle: ShieldConfiguration.Label(
                text: "It's time to pause and pray",
                color: UIColor.white.withAlphaComponent(0.8)
            ),
            primaryButtonLabel: ShieldConfiguration.Label(
                text: "Begin Prayer",
                color: .white
            ),
            primaryButtonBackgroundColor: UIColor(red: 0.10, green: 0.61, blue: 0.56, alpha: 1.0),
            secondaryButtonLabel: ShieldConfiguration.Label(
                text: "Not Now",
                color: UIColor.white.withAlphaComponent(0.7)
            )
        )
    }
}
`;

const SHIELD_ACTION_SOURCE = `import ManagedSettings
import ManagedSettingsUI

class ShieldActionExtension: ShieldActionDelegate {

    let sharedDefaults = UserDefaults(suiteName: "${APP_GROUP}")

    override func handle(action: ShieldAction, for application: ApplicationToken, completionHandler: @escaping (ShieldActionResponse) -> Void) {
        handleAction(action, completionHandler: completionHandler)
    }

    override func handle(action: ShieldAction, for webDomain: WebDomainToken, completionHandler: @escaping (ShieldActionResponse) -> Void) {
        handleAction(action, completionHandler: completionHandler)
    }

    override func handle(action: ShieldAction, for category: ActivityCategoryToken, completionHandler: @escaping (ShieldActionResponse) -> Void) {
        handleAction(action, completionHandler: completionHandler)
    }

    private func handleAction(_ action: ShieldAction, completionHandler: @escaping (ShieldActionResponse) -> Void) {
        switch action {
        case .primaryButtonPressed:
            NSLog("🙏 User tapped Begin Prayer")
            sharedDefaults?.set(true, forKey: "userWantsToPray")
            sharedDefaults?.synchronize()
            completionHandler(.defer)

        case .secondaryButtonPressed:
            NSLog("❌ User dismissed prayer shield")
            sharedDefaults?.set(false, forKey: "userWantsToPray")
            sharedDefaults?.synchronize()
            completionHandler(.close)

        @unknown default:
            completionHandler(.close)
        }
    }
}
`;

const PRAYER_SCREEN_TIME_MANAGER_SWIFT = `import Foundation
import FamilyControls
import ManagedSettings
import DeviceActivity
import React

@objc(PrayerScreenTimeManager)
class PrayerScreenTimeManager: NSObject {

    private let store = ManagedSettingsStore()
    private let center = AuthorizationCenter.shared
    private let sharedDefaults = UserDefaults(suiteName: "${APP_GROUP}")

    @objc
    func requestScreenTimeAuthorization(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        Task {
            do {
                try await center.requestAuthorization(for: .individual)
                resolve(true)
            } catch {
                reject("AUTH_ERROR", "Failed to authorize Screen Time", error)
            }
        }
    }

    @objc
    func checkScreenTimeAuthorization(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        switch center.authorizationStatus {
        case .notDetermined: resolve("notDetermined")
        case .denied: resolve("denied")
        case .approved: resolve("approved")
        @unknown default: resolve("unknown")
        }
    }

    @objc
    func selectAppsToBlock(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        resolve(true)
    }

    @objc
    func applyShield(
        _ appTokens: [String],
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        store.shield.applications = .all()
        sharedDefaults?.set(true, forKey: "prayerActive")
        sharedDefaults?.synchronize()
        resolve(true)
    }

    @objc
    func removeShield(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        store.shield.applications = nil
        store.shield.applicationCategories = nil
        store.shield.webDomains = nil
        sharedDefaults?.set(false, forKey: "prayerActive")
        sharedDefaults?.synchronize()
        resolve(true)
    }

    @objc
    func schedulePrayerShields(
        _ prayerSchedule: [[String: Any]],
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let deviceActivityCenter = DeviceActivityCenter()
        deviceActivityCenter.stopMonitoring()

        for prayer in prayerSchedule {
            guard let prayerId = prayer["id"] as? String,
                  let timeString = prayer["time"] as? String,
                  let duration = prayer["duration"] as? Int,
                  let enabled = prayer["enabled"] as? Bool,
                  enabled else { continue }

            let components = timeString.split(separator: ":")
            guard components.count == 2,
                  let hour = Int(components[0]),
                  let minute = Int(components[1]) else { continue }

            let endMinute = minute + duration
            let endHour = hour + (endMinute / 60)
            let endMin = endMinute % 60

            let schedule = DeviceActivitySchedule(
                intervalStart: DateComponents(hour: hour, minute: minute),
                intervalEnd: DateComponents(hour: endHour % 24, minute: endMin),
                repeats: true
            )

            let activityName = DeviceActivityName("prayer_\\(prayerId)")

            do {
                try deviceActivityCenter.startMonitoring(activityName, during: schedule)
                NSLog("✅ Scheduled prayer shield: \\(prayerId) at \\(hour):\\(minute) for \\(duration)min")
            } catch {
                NSLog("❌ Failed to schedule prayer shield \\(prayerId): \\(error)")
            }
        }

        resolve(true)
    }

    @objc
    func stopAllPrayerMonitoring(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        DeviceActivityCenter().stopMonitoring()
        store.shield.applications = nil
        sharedDefaults?.set(false, forKey: "prayerActive")
        sharedDefaults?.synchronize()
        resolve(true)
    }

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
`;

const PRAYER_SCREEN_TIME_MANAGER_M = `#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(PrayerScreenTimeManager, NSObject)

RCT_EXTERN_METHOD(requestScreenTimeAuthorization:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(checkScreenTimeAuthorization:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(selectAppsToBlock:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(applyShield:(NSArray *)appTokens
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(removeShield:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(schedulePrayerShields:(NSArray *)prayerSchedule
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stopAllPrayerMonitoring:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
`;

// =============================================================================
// ANDROID NATIVE FILE COPYING
// =============================================================================

function withCopyAndroidNativeFiles(config) {
  const { withDangerousMod } = require('@expo/config-plugins');

  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const sourceDir = path.join(projectRoot, 'android-native/prayer');
      const targetDir = path.join(
        projectRoot,
        'android/app/src/main/java/com/sacred/app/prayer'
      );

      if (fs.existsSync(sourceDir)) {
        console.log('📦 Copying native Android prayer overlay files...');
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }

        const files = fs.readdirSync(sourceDir);
        files.forEach((file) => {
          if (file.endsWith('.java')) {
            fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
            console.log(`  ✅ Copied ${file}`);
          }
        });

        const mainAppPath = path.join(
          projectRoot,
          'android/app/src/main/java/com/sacred/app/MainApplication.kt'
        );
        if (fs.existsSync(mainAppPath)) {
          let content = fs.readFileSync(mainAppPath, 'utf8');
          if (!content.includes('import com.sacred.app.prayer.PrayerOverlayPackage')) {
            content = content.replace(
              /(package com\.sacred\.app)/,
              '$1\n\nimport com.sacred.app.prayer.PrayerOverlayPackage'
            );
          }
          if (!content.includes('PrayerOverlayPackage()')) {
            content = content.replace(
              /(packages\.add\(.*?\))/s,
              '$1\n        packages.add(PrayerOverlayPackage())'
            );
          }
          fs.writeFileSync(mainAppPath, content);
          console.log('  ✅ Updated MainApplication.kt');
        }
      }

      return config;
    },
  ]);

  return config;
}
