const fs = require('fs');
const path = require('path');
const { ROOT } = require('../build/paths');

const SYSTEM_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const INSTALL_COMMAND = 'npm run machine:bootstrap';

function loadChromium(){
  return require('playwright-core').chromium;
}

function configuredBrowserPath(){
  const explicit = process.env.AURORA_HARNESS_BROWSER_PATH || '';
  return explicit && fs.existsSync(explicit) ? explicit : '';
}

function playwrightChromiumPath(){
  try{
    const candidate = loadChromium().executablePath();
    return candidate && fs.existsSync(candidate) ? candidate : '';
  }catch{
    return '';
  }
}

function systemChromePath(){
  return fs.existsSync(SYSTEM_CHROME) ? SYSTEM_CHROME : '';
}

function resolveHarnessBrowser(){
  const explicit = configuredBrowserPath();
  if(explicit){
    return { ok: true, kind: 'explicit', path: explicit };
  }
  const managed = playwrightChromiumPath();
  if(managed){
    return { ok: true, kind: 'playwright-managed-chromium', path: managed };
  }
  if(process.env.AURORA_HARNESS_ALLOW_SYSTEM_CHROME === '1'){
    const system = systemChromePath();
    if(system){
      return { ok: true, kind: 'system-google-chrome-explicit-fallback', path: system };
    }
  }
  return {
    ok: false,
    kind: 'missing-playwright-managed-chromium',
    path: '',
    message: `Playwright-managed Chromium is not installed. Run "${INSTALL_COMMAND}" before browser-backed harnesses.`
  };
}

function browserLaunchArgs(extraArgs=[]){
  return [
    '--autoplay-policy=no-user-gesture-required',
    '--disable-crash-reporter',
    '--disable-breakpad',
    ...extraArgs
  ];
}

async function launchHarnessBrowser(cfg={}){
  if(process.env.CODEX_SANDBOX && process.env.AURORA_ALLOW_CODEX_SANDBOX_BROWSER !== '1'){
    throw new Error(
      'Browser-backed Aurora harnesses must run outside the Codex filesystem sandbox on macOS. '
      + 'The sandbox denies Chromium Mach-port registration and can produce Google Chrome/Chromium SIGABRT crash dialogs. '
      + 'In Codex Desktop, rerun this npm harness command with escalated sandbox permissions; normal Terminal runs are unaffected.'
    );
  }
  const browser = resolveHarnessBrowser();
  if(!browser.ok){
    throw new Error(browser.message);
  }
  return loadChromium().launch({
    executablePath: browser.path,
    headless: cfg.headed ? false : true,
    args: browserLaunchArgs(cfg.args || [])
  });
}

module.exports = {
  ROOT,
  SYSTEM_CHROME,
  INSTALL_COMMAND,
  resolveHarnessBrowser,
  launchHarnessBrowser,
  browserLaunchArgs
};
