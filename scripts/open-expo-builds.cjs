#!/usr/bin/env node
/** Opens Expo dashboard → Builds for this project (download latest APK / AAB). */
const { execSync } = require('child_process');
const url =
  'https://expo.dev/accounts/naresh2208s-organization/projects/cab-roster/builds';
if (process.platform === 'win32') {
  execSync(`start "" "${url}"`, { shell: true, stdio: 'ignore' });
} else if (process.platform === 'darwin') {
  execSync(`open "${url}"`, { stdio: 'ignore' });
} else {
  execSync(`xdg-open "${url}"`, { stdio: 'ignore' });
}
