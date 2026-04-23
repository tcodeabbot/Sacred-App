#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to copy native Android prayer overlay files during prebuild
 * Run this after `expo prebuild` to copy the Java files
 */

const SOURCE_DIR = path.join(__dirname, '../android-native/prayer');
const TARGET_DIR = path.join(
  __dirname,
  '../android/app/src/main/java/com/sacred/app/prayer'
);

console.log('📦 Copying native Android prayer overlay files...');
console.log('Source:', SOURCE_DIR);
console.log('Target:', TARGET_DIR);

// Create target directory if it doesn't exist
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
  console.log('✅ Created target directory');
}

// Copy all Java files
const files = fs.readdirSync(SOURCE_DIR);

files.forEach((file) => {
  if (file.endsWith('.java')) {
    const sourcePath = path.join(SOURCE_DIR, file);
    const targetPath = path.join(TARGET_DIR, file);

    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Copied ${file}`);
  }
});

// Update MainApplication.java to include PrayerOverlayPackage
const mainApplicationPath = path.join(
  __dirname,
  '../android/app/src/main/java/com/sacred/app/MainApplication.kt'
);

if (fs.existsSync(mainApplicationPath)) {
  let content = fs.readFileSync(mainApplicationPath, 'utf8');

  // Check if already added
  if (!content.includes('PrayerOverlayPackage')) {
    // Add import
    const importLine = 'import com.sacred.app.prayer.PrayerOverlayPackage';
    if (!content.includes(importLine)) {
      // Find the last import and add after it
      const lastImportIndex = content.lastIndexOf('import ');
      const nextLineIndex = content.indexOf('\n', lastImportIndex);
      content =
        content.slice(0, nextLineIndex + 1) +
        importLine +
        '\n' +
        content.slice(nextLineIndex + 1);

      console.log('✅ Added PrayerOverlayPackage import');
    }

    // Add to packages list
    const packagesPattern = /packages\.add\(([^)]+)\)/g;
    let match;
    let lastMatch;

    while ((match = packagesPattern.exec(content)) !== null) {
      lastMatch = match;
    }

    if (lastMatch) {
      const insertPos = lastMatch.index + lastMatch[0].length;
      const packageLine = '\n      packages.add(PrayerOverlayPackage())';

      content = content.slice(0, insertPos) + packageLine + content.slice(insertPos);

      fs.writeFileSync(mainApplicationPath, content);
      console.log('✅ Added PrayerOverlayPackage to MainApplication');
    }
  } else {
    console.log('ℹ️  PrayerOverlayPackage already added to MainApplication');
  }
}

console.log('\n✨ Native files copied successfully!');
console.log('\n📝 Next steps:');
console.log('1. Run: npx expo run:android (or build with EAS)');
console.log('2. Grant overlay permission when prompted');
console.log('3. Test prayer interruption!');
