const { withPodfile } = require('@expo/config-plugins');

/**
 * Configure Podfile for React Native Firebase compatibility
 * Adds static frameworks and modular headers required for Firebase Swift pods
 */
const withModularHeaders = (config) => {
  return withPodfile(config, (config) => {
    const podfile = config.modResults;

    // Add Firebase static framework variable before target block
    if (!podfile.contents.includes('$RNFirebaseAsStaticFramework')) {
      podfile.contents = podfile.contents.replace(
        /platform :ios/,
        '$RNFirebaseAsStaticFramework = true\n\nplatform :ios'
      );
    }

    // Add use_modular_headers! and use_frameworks! after use_expo_modules!
    if (!podfile.contents.includes('use_modular_headers!')) {
      podfile.contents = podfile.contents.replace(
        /use_expo_modules!/g,
        'use_expo_modules!\n  use_modular_headers!\n  use_frameworks! :linkage => :static'
      );
    }

    return config;
  });
};

module.exports = withModularHeaders;
