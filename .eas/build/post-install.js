#!/usr/bin/env node

/**
 * EAS Build Hook - Post Install
 * This runs after "npm install" and after "expo prebuild" during EAS builds
 * It copies the native Android prayer overlay files to the correct location
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📦 EAS Build Hook: Copying native Android prayer overlay files...');

// Check if we're in an EAS build
const isEAS = process.env.EAS_BUILD === 'true';
const platform = process.env.EAS_BUILD_PLATFORM;

if (!isEAS) {
    console.log('Not in EAS build, skipping...');
    process.exit(0);
}

if (platform !== 'android') {
    console.log(`Platform is ${platform}, skipping Android file copy...`);
    process.exit(0);
}

// Run the copy script
try {
    execSync('node scripts/copy-native-prayer-files.js', {
        stdio: 'inherit',
        cwd: process.cwd()
    });
    console.log('✅ Native Android files copied successfully');
} catch (error) {
    console.error('❌ Failed to copy native Android files:', error);
    process.exit(1);
}
