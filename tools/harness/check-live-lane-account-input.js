#!/usr/bin/env node
const { launchHarnessBrowser } = require('./browser-launch');

const TEST_EMAIL = 'pilot@example.com';
const TEST_PASSWORD = 'betaProbe123';

function parseArgs(argv){
  const args = {};
  for(let i = 0; i < argv.length; i++){
    const token = argv[i];
    if(!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if(!next || next.startsWith('--')){
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function laneUrl(lane){
  if(lane === 'dev') return 'https://sgwoods.github.io/Aurora-Galactica/dev/';
  if(lane === 'beta') return 'https://sgwoods.github.io/Aurora-Galactica/beta/';
  if(lane === 'production') return 'https://sgwoods.github.io/Aurora-Galactica/';
  throw new Error('Use --lane dev, --lane beta, or --lane production.');
}

function expectedChannelPattern(lane){
  if(lane === 'dev') return /development/i;
  if(lane === 'beta') return /production beta|beta/i;
  if(lane === 'production') return /production/i;
  return /./;
}

async function readBuildInfo(page){
  try{
    return await page.evaluate(async () => {
      const response = await fetch('build-info.json', { cache: 'no-store' });
      if(!response.ok) return null;
      return response.json();
    });
  }catch{
    return null;
  }
}

async function readAccountState(page){
  return page.evaluate(() => {
    const field = id => document.getElementById(id);
    const visible = element => {
      if(!element) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== 'hidden'
        && style.display !== 'none'
        && rect.width > 0
        && rect.height > 0;
    };
    const active = document.activeElement;
    return {
      channel: field('buildStampChannel')?.textContent || '',
      buildVersion: field('buildStampVersion')?.textContent || '',
      buildRelease: field('buildStampRelease')?.textContent || '',
      dockLabel: field('accountDockLabel')?.textContent || '',
      dockStatus: field('accountDockStatus')?.textContent || '',
      pilotStatus: field('accountPilotStatus')?.textContent || '',
      accountSummary: field('accountSummary')?.textContent || '',
      panelVisible: visible(field('accountPanel')),
      signupDisabled: !!field('accountSignupBtn')?.disabled,
      loginDisabled: !!field('accountLoginBtn')?.disabled,
      resetDisabled: !!field('accountResetBtn')?.disabled,
      emailDisabled: !!field('accountEmail')?.disabled,
      passwordDisabled: !!field('accountPassword')?.disabled,
      emailVisible: visible(field('accountEmail')),
      passwordVisible: visible(field('accountPassword')),
      emailValue: field('accountEmail')?.value || '',
      passwordValueLength: String(field('accountPassword')?.value || '').length,
      activeElementId: active?.id || ''
    };
  });
}

async function main(){
  const args = parseArgs(process.argv.slice(2));
  const lane = String(args.lane || 'production').toLowerCase();
  const url = laneUrl(lane);
  const browser = await launchHarnessBrowser();

  try{
    const context = await browser.newContext({ viewport: { width: 1440, height: 1800 } });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    const buildInfo = await readBuildInfo(page);

    const accountDock = page.locator('#accountDockBtn');
    await accountDock.waitFor({ state: 'visible', timeout: 15000 });
    await accountDock.click();

    const email = page.locator('#accountEmail');
    const password = page.locator('#accountPassword');
    await email.waitFor({ state: 'visible', timeout: 10000 });
    await password.waitFor({ state: 'visible', timeout: 10000 });
    await email.fill(TEST_EMAIL);
    await password.fill(TEST_PASSWORD);

    const result = {
      ok: true,
      lane,
      url,
      buildInfo,
      ...(await readAccountState(page))
    };

    const channelText = `${result.channel} ${buildInfo?.releaseChannel || ''}`;
    if(!expectedChannelPattern(lane).test(channelText)){
      fail('hosted account smoke ran against an unexpected release channel', result);
    }
    if(!result.panelVisible || !result.emailVisible || !result.passwordVisible){
      fail('hosted account fields should be visible after opening the pilot panel', result);
    }
    if(result.signupDisabled || result.loginDisabled || result.resetDisabled || result.emailDisabled || result.passwordDisabled){
      fail('hosted account controls should remain enabled for normal pilot sign-in', result);
    }
    if(result.emailValue !== TEST_EMAIL || result.passwordValueLength !== TEST_PASSWORD.length){
      fail('hosted account fields should be fillable without submitting credentials', result);
    }
    if(!/Sign in for synced|Sign in when you want|Pilot Sign In/i.test(`${result.pilotStatus} ${result.accountSummary} ${result.dockLabel}`)){
      fail('hosted account panel should invite normal pilot sign-in', result);
    }

    console.log(JSON.stringify(result, null, 2));
    await context.close();
  } finally {
    await browser.close();
  }
}

main().catch(err => fail(err && err.stack || String(err)));
