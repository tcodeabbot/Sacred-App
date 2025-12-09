const { withPodfile } = require('@expo/config-plugins');

/**
 * Configure Podfile for React Native Firebase compatibility
 * Uses dynamic frameworks which work better with Firebase Swift pods
 */
const withModularHeaders = (config) => {
  return withPodfile(config, (config) => {
    const podfile = config.modResults;

    // Add use_modular_headers! after use_expo_modules!
    if (!podfile.contents.includes('use_modular_headers!')) {
      podfile.contents = podfile.contents.replace(
        /use_expo_modules!/g,
        'use_expo_modules!\n  use_modular_headers!'
      );
    }

    // Use dynamic frameworks instead of static for Firebase compatibility
    if (!podfile.contents.includes('use_frameworks!')) {
      podfile.contents = podfile.contents.replace(
        /use_modular_headers!/g,
        'use_modular_headers!\n  use_frameworks! :linkage => :dynamic'
      );
    }

    return config;
  });
};

module.exports = withModularHeaders;
