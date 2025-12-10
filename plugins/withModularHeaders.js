const { withPodfile } = require('@expo/config-plugins');

/**
 * Configure Podfile for React Native Firebase compatibility
 * Uses static frameworks which are required for Firebase Swift pods
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

    // Use static frameworks for Firebase compatibility
    if (!podfile.contents.includes('use_frameworks!')) {
      podfile.contents = podfile.contents.replace(
        /use_expo_modules!/g,
        'use_expo_modules!\n  use_frameworks! :linkage => :static'
      );
    }

    return config;
  });
};

module.exports = withModularHeaders;