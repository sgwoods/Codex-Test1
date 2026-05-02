#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');
const { ROOT } = require('../build/paths');
const { resolveHarnessBrowser } = require('../harness/browser-launch');

function main(){
  const before = resolveHarnessBrowser();
  if(before.ok && before.kind !== 'system-google-chrome-explicit-fallback'){
    console.log(JSON.stringify({
      ok: true,
      action: 'already-installed',
      browser: before
    }, null, 2));
    return;
  }

  const cli = path.join(ROOT, 'node_modules', 'playwright-core', 'cli.js');
  const result = spawnSync(process.execPath, [cli, 'install', 'chromium'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: {
      ...process.env,
      AURORA_HARNESS_ALLOW_SYSTEM_CHROME: ''
    }
  });
  if(result.status !== 0){
    process.exit(result.status || 1);
  }
  const after = resolveHarnessBrowser();
  if(!after.ok || after.kind === 'system-google-chrome-explicit-fallback'){
    console.error(JSON.stringify({
      ok: false,
      action: 'install-failed',
      browser: after
    }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({
    ok: true,
    action: 'installed',
    browser: after
  }, null, 2));
}

main();
