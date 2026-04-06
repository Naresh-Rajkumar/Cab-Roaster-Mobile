#!/usr/bin/env node
/**
 * Local release APK with JS bundle embedded (no Metro). Uses debug keystore — fine for QA devices only.
 * Output: android/app/build/outputs/apk/release/app-release.apk
 */
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const androidDir = path.join(root, 'android');
const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';

if (!fs.existsSync(path.join(androidDir, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew'))) {
  console.error('[build-release-apk] android/ folder missing. Run: npx expo prebuild');
  process.exit(1);
}

console.log('[build-release-apk] Running assembleRelease (bundles JS via Expo export:embed)...\n');

const r = spawnSync(gradlew, ['assembleRelease', '--no-daemon'], {
  cwd: androidDir,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env },
});

const apkDir = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release');
if ((r.status ?? 1) === 0 && fs.existsSync(apkDir)) {
  const files = fs.readdirSync(apkDir).filter((f) => f.endsWith('.apk'));
  console.log('\n[build-release-apk] Done. Install on device:');
  files.forEach((f) => console.log('  ' + path.join(apkDir, f)));
  console.log('\n  adb install -r "' + path.join(apkDir, files[0] || 'app-release.apk') + '"');
}

process.exit(r.status ?? 1);
