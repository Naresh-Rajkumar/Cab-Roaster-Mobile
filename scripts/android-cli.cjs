#!/usr/bin/env node
/**
 * Windows: run Expo Android build from a SUBST drive so CMake/Ninja object paths stay under MAX_PATH.
 * Other platforms: plain `npx expo run:android`.
 */
const { spawnSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
const extraArgs = process.argv.slice(2);

// CI: short paths. ANDROID_SKIP_SUBST=1: you enabled Windows long paths or build from a short clone path.
const skipSubst =
  process.env.CI === 'true' || process.env.ANDROID_SKIP_SUBST === '1';

if (process.platform === 'win32' && !skipSubst) {
  const substBat = path.join(__dirname, 'run-android-subst.cmd');
  const result = spawnSync(substBat, extraArgs, {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  });
  if ((result.status ?? 1) !== 0) {
    console.error(
      '\n[android-cli] SUBST build failed. Fix one of:\n' +
        '  • Free a drive letter: open cmd, run `subst` then `subst Z: /d` for an unused mapping.\n' +
        '  • Run PowerShell as Admin: android\\enable-windows-long-paths.ps1 then reboot; then set ANDROID_SKIP_SUBST=1 and run again.\n' +
        '  • Clone the repo to a short path (e.g. C:\\dev\\cab).\n'
    );
  }
  process.exit(result.status ?? 1);
}

const result = spawnSync(
  'npx',
  ['expo', 'run:android', ...extraArgs],
  { cwd: root, stdio: 'inherit', shell: true }
);
process.exit(result.status ?? 1);
