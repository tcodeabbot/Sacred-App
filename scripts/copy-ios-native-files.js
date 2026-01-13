#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to copy native iOS prayer Screen Time files during prebuild
 * Run this after `expo prebuild` to copy the Swift files
 */

const SOURCE_DIR = path.join(__dirname, '../ios-native/prayer');
const TARGET_DIR = path.join(
    __dirname,
    '../ios/SacredApp/Prayer'
);

console.log('📦 Copying native iOS Screen Time files...');
console.log('Source:', SOURCE_DIR);
console.log('Target:', TARGET_DIR);

// Create target directory if it doesn't exist
if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
    console.log('✅ Created target directory');
}

// Copy all Swift and Objective-C files
const files = fs.readdirSync(SOURCE_DIR);

files.forEach((file) => {
    if (file.endsWith('.swift') || file.endsWith('.m') || file.endsWith('.h')) {
        const sourcePath = path.join(SOURCE_DIR, file);
        const targetPath = path.join(TARGET_DIR, file);

        fs.copyFileSync(sourcePath, targetPath);
        console.log(`✅ Copied ${file}`);
    }
});

console.log('\n✨ iOS native files copied successfully!');
console.log('\n📝 Next steps:');
console.log('1. Add files to Xcode project');
console.log('2. Ensure bridging header is configured');
console.log('3. Add FamilyControls.framework to project');
console.log('4. Build: npx expo run:ios');
