const { withPodfile } = require('@expo/config-plugins');

/**
 * Configure Podfile for React Native Firebase compatibility
 * Adds static frameworks variable required for Firebase pods
 */
const withModularHeaders = (config) => {
  return withPodfile(config, (config) => {
    const podfile = config.modResults;

    // Add Firebase static framework variable before platform declaration
    if (!podfile.contents.includes('$RNFirebaseAsStaticFramework')) {
      podfile.contents = podfile.contents.replace(
        /platform :ios/,
        '$RNFirebaseAsStaticFramework = true\n\nplatform :ios'
      );
    }

    // Ensure proper pod configuration for Firebase + Facebook SDK
    // Add post_install hook modifications if not present
    if (!podfile.contents.includes('build_settings[\'CLANG_CXX_LANGUAGE_STANDARD\']')) {
      podfile.contents = podfile.contents.replace(
        /post_install do \|installer\|/,
        `post_install do |installer|
    # Fix for Firebase + FBSDK compatibility
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
      end
    end`
      );
    }

    return config;
  });
};

module.exports = withModularHeaders;

