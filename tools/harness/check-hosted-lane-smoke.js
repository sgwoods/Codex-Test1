#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ROOT } = require('../build/paths');
const { launchHarnessBrowser } = require('./browser-launch');

const TEST_EMAIL = 'pilot@example.com';
const TEST_PASSWORD = 'betaProbe123';
const DEFAULT_OUT_ROOT = path.join(ROOT, 'harness-artifacts', 'hosted-lane-smoke');

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

function laneUrl(lane){
  if(lane === 'dev') return 'https://sgwoods.github.io/Aurora-Galactica/dev/';
  if(lane === 'beta') return 'https://sgwoods.github.io/Aurora-Galactica/beta/';
  if(lane === 'production') return 'https://sgwoods.github.io/Aurora-Galactica/';
  throw new Error('Use --lane dev, --lane beta, or --lane production.');
}

function expectedChannelPattern(lane){
  if(lane === 'dev') return /development/i;
  if(lane === 'beta') return /beta/i;
  if(lane === 'production') return /^production$/i;
  return /./;
}

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function ensureOut(outRoot){
  fs.mkdirSync(outRoot, { recursive: true });
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function isSameOriginAsset(pageUrl, requestUrl){
  try{
    const page = new URL(pageUrl);
    const request = new URL(requestUrl);
    return page.origin === request.origin && request.pathname.startsWith(page.pathname.replace(/[^/]*$/, ''));
  }catch{
    return false;
  }
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

async function readCanvasStats(page){
  return page.evaluate(() => {
    const canvas = document.getElementById('c');
    if(!canvas) return { present: false, width: 0, height: 0, nonTransparentSamples: 0, hash: '' };
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if(!ctx) return { present: true, width: canvas.width, height: canvas.height, nonTransparentSamples: 0, hash: '' };
    const width = Math.max(1, canvas.width|0);
    const height = Math.max(1, canvas.height|0);
    const data = ctx.getImageData(0, 0, width, height).data;
    const step = Math.max(4, Math.floor(data.length / 4096 / 4) * 4);
    let nonTransparentSamples = 0;
    let hash = 2166136261;
    for(let i = 0; i < data.length; i += step){
      const r = data[i] || 0;
      const g = data[i + 1] || 0;
      const b = data[i + 2] || 0;
      const a = data[i + 3] || 0;
      if(a || r || g || b) nonTransparentSamples++;
      hash ^= r + (g << 8) + (b << 16) + (a << 24);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return {
      present: true,
      width,
      height,
      nonTransparentSamples,
      hash: hash.toString(16).padStart(8, '0')
    };
  });
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
    return {
      panelVisible: visible(field('accountPanel')),
      emailVisible: visible(field('accountEmail')),
      passwordVisible: visible(field('accountPassword')),
      emailDisabled: !!field('accountEmail')?.disabled,
      passwordDisabled: !!field('accountPassword')?.disabled,
      signupDisabled: !!field('accountSignupBtn')?.disabled,
      loginDisabled: !!field('accountLoginBtn')?.disabled,
      resetDisabled: !!field('accountResetBtn')?.disabled,
      emailValue: field('accountEmail')?.value || '',
      passwordValueLength: String(field('accountPassword')?.value || '').length,
      activeElementId: document.activeElement?.id || '',
      pilotStatus: field('accountPilotStatus')?.textContent?.trim() || '',
      accountSummary: field('accountSummary')?.textContent?.trim() || ''
    };
  });
}

async function readSettingsState(page){
  return page.evaluate(() => {
    const field = id => document.getElementById(id);
    const visible = element => {
      if(!element) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return !element.hidden
        && style.visibility !== 'hidden'
        && style.display !== 'none'
        && rect.width > 0
        && rect.height > 0;
    };
    const optionRows = select => Array.from(select?.options || []).map(option => ({
      value: option.value,
      label: option.textContent.trim(),
      disabled: !!option.disabled,
      selected: !!option.selected
    }));
    const selectedLabel = select => {
      const row = Array.from(select?.options || []).find(option => option.selected);
      return row?.textContent?.trim() || '';
    };
    return {
      panelVisible: visible(field('settingsPanel')),
      title: field('settingsPanelTitle')?.textContent?.trim() || '',
      subtitle: field('settingsPanelSub')?.textContent?.trim() || '',
      themeSetValue: field('themeSetSelect')?.value || '',
      themeSetLabel: selectedLabel(field('themeSetSelect')),
      themeSetSummary: field('themeSetSummary')?.textContent?.trim() || '',
      themeSetOptions: optionRows(field('themeSetSelect')),
      audioThemeValue: field('audioTheme')?.value || '',
      audioThemeLabel: selectedLabel(field('audioTheme')),
      audioThemeOptions: optionRows(field('audioTheme')),
      musicVolumeValue: Number(field('musicVolume')?.value || NaN),
      musicVolumeLabel: field('musicVolumeValue')?.textContent?.trim() || '',
      gameSoundVolumeValue: Number(field('gameSoundVolume')?.value || NaN),
      gameSoundVolumeLabel: field('gameSoundVolumeValue')?.textContent?.trim() || '',
      playlistValue: field('arcadeMusicPlaylistSelect')?.value || '',
      playlistLabel: selectedLabel(field('arcadeMusicPlaylistSelect')),
      playlistOptions: optionRows(field('arcadeMusicPlaylistSelect')),
      playAudioTestHidden: !visible(field('playAudioTestBtn'))
    };
  });
}

async function readGameplayState(page){
  return page.evaluate(() => {
    const status = typeof window.getSystemStatusReport === 'function'
      ? window.getSystemStatusReport(20)
      : null;
    const debug = window.__platinumAudioDebug || window.__auroraAudioDebug || {};
    const history = Array.isArray(debug.history) ? debug.history.slice(-40) : [];
    const reference = debug.reference || {};
    return {
      status,
      audioDebugAvailable: !!debug,
      interactionUnlocked: !!debug.interactionUnlocked,
      audioContextState: String(debug.audioContextState || ''),
      cueNames: history.map(entry => entry?.cue || '').filter(Boolean),
      audioHistory: history.map(entry => ({
        cue: entry?.cue || '',
        audioTheme: entry?.audioTheme || '',
        phase: entry?.phase || '',
        referenceClip: entry?.referenceClip || '',
        referenceClipStart: Number.isFinite(+entry?.referenceClipStart) ? +entry.referenceClipStart : 0,
        referenceClipDuration: Number.isFinite(+entry?.referenceClipDuration) ? +entry.referenceClipDuration : 0
      })),
      referenceStartedHistory: Array.isArray(reference.startedHistory)
        ? reference.startedHistory.slice(-20).map(entry => ({
          cue: entry?.cue || '',
          clip: entry?.clip || '',
          clipStart: Number.isFinite(+entry?.clipStart) ? +entry.clipStart : 0,
          clipDuration: Number.isFinite(+entry?.clipDuration) ? +entry.clipDuration : 0
        }))
        : [],
      referenceBlockedHistory: Array.isArray(reference.blockedHistory)
        ? reference.blockedHistory.slice(-20).map(entry => ({
          cue: entry?.cue || '',
          clip: entry?.clip || '',
          reason: entry?.reason || ''
        }))
        : []
    };
  });
}

function hasPrivateReferenceClip(rows, key='referenceClip'){
  return rows.some(row => /(^|\/)reference-audio\//i.test(String(row?.[key] || '')));
}

function validateReport(report, opts={}){
  const issues = [];
  const { lane, buildInfo, account, settings, gameplay, firstLoad, browser } = report;
  const channel = String(buildInfo?.releaseChannel || '');
  if(!buildInfo) issues.push('build-info.json was not readable from the hosted lane');
  else if(!expectedChannelPattern(lane).test(channel)) issues.push(`unexpected hosted release channel: ${channel || '(missing)'}`);
  if(buildInfo?.dirty && !opts.allowDirty) issues.push('hosted build-info reports dirty=true');
  if(buildInfo?.publicArtifactBoundaryEnabled !== true) issues.push('public artifact boundary must be enabled on hosted lanes');
  if(lane === 'production'){
    if(buildInfo?.platform?.releaseTrack !== 'production-family') issues.push('production platform releaseTrack should be production-family');
    const aurora = Array.isArray(buildInfo?.applications)
      ? buildInfo.applications.find(app => app?.gameKey === 'aurora-galactica')
      : null;
    if(aurora?.releaseTrack !== 'production-family') issues.push('production Aurora releaseTrack should be production-family');
    const emails = buildInfo?.platform?.auth?.nonProductionTestPilotEmails || [];
    if(Array.isArray(emails) && emails.length) issues.push('production build-info should not expose non-production test pilot emails');
  }
  if(firstLoad?.canvas?.present !== true) issues.push('game canvas is missing on first load');
  if(!(firstLoad?.canvas?.nonTransparentSamples > 0)) issues.push('game canvas appears blank on first load');
  if(browser.pageErrors.length) issues.push(`page errors observed: ${browser.pageErrors.join(' | ')}`);
  const importantRequestFailures = browser.failedRequests.filter(entry => isSameOriginAsset(report.url, entry.url) && !/favicon\.ico/i.test(entry.url));
  if(importantRequestFailures.length) issues.push(`same-origin hosted assets failed to load: ${importantRequestFailures.map(entry => entry.url).join(', ')}`);

  if(!account.panelVisible || !account.emailVisible || !account.passwordVisible) issues.push('pilot sign-in fields should be visible after opening the pilot panel');
  if(account.emailDisabled || account.passwordDisabled || account.signupDisabled || account.loginDisabled || account.resetDisabled){
    issues.push('pilot sign-in controls should be enabled and fillable');
  }
  if(account.emailValue !== TEST_EMAIL || account.passwordValueLength !== TEST_PASSWORD.length) issues.push('pilot sign-in fields did not retain typed smoke values');
  if(!/Sign in|Pilot/i.test(`${account.pilotStatus} ${account.accountSummary}`)) issues.push('pilot panel text should clearly describe sign-in');

  if(!settings.panelVisible) issues.push('settings panel should open from the hosted lane');
  if(!/^Settings$/i.test(settings.title)) issues.push(`settings panel title should be "Settings", got "${settings.title}"`);
  if(/Developer Tools/i.test(`${settings.title} ${settings.subtitle}`)) issues.push('production-facing settings copy should not present ordinary settings as Developer Tools');
  if(settings.themeSetValue !== 'aurora-public') issues.push(`default Aurora theme set should be aurora-public, got ${settings.themeSetValue || '(missing)'}`);
  if(!/Aurora Public Mix/i.test(settings.themeSetLabel)) issues.push('default Aurora theme label should be Aurora Public Mix');
  if(!settings.themeSetOptions.some(option => /Galaga-Style Synth|Aurora Classic Synth/i.test(option.label) && !option.disabled)){
    issues.push('public Galaga-style synth theme should remain available');
  }
  const localTheme = settings.themeSetOptions.find(option => /Local Galaga Reference|Local Reference/i.test(option.label) || option.value === 'aurora-local-reference');
  if(localTheme && !localTheme.disabled) issues.push('local Galaga reference theme must be disabled on hosted public lanes');
  if(settings.audioThemeValue === 'galaga-reference-assets') issues.push('hosted public lanes must not select private Galaga reference audio');
  const referenceAudioOption = settings.audioThemeOptions.find(option => option.value === 'galaga-reference-assets');
  if(referenceAudioOption && !referenceAudioOption.disabled) issues.push('private Galaga reference audio option must be disabled on hosted public lanes');
  if(settings.musicVolumeValue !== 60) issues.push(`default music volume should be 60, got ${settings.musicVolumeValue}`);
  if(settings.gameSoundVolumeValue !== 40) issues.push(`default game sound volume should be 40, got ${settings.gameSoundVolumeValue}`);
  if(!settings.playlistOptions.some(option => /Aurora Original Playlist/i.test(option.label))) issues.push('Aurora arcade music playlist should be present');
  if(!settings.playlistOptions.some(option => /Galaxy Guardians Original Playlist/i.test(option.label))) issues.push('Guardians arcade music playlist should be present');
  if(lane === 'production' && !settings.playAudioTestHidden) issues.push('production should not expose the internal audio test button');

  const game = gameplay?.status?.game || {};
  if(game.started !== true) issues.push('short hosted smoke did not reach started gameplay');
  if(gameplay?.audioDebugAvailable !== true) issues.push('public audio diagnostic state was not available');
  if(!gameplay?.cueNames?.some(cue => ['gameStart', 'playerShot', 'stagePulse', 'formationArrival'].includes(cue))){
    issues.push('short hosted smoke did not observe expected public cue activity');
  }
  if(report.gameplayCanvas?.changed !== true) issues.push('canvas fingerprint did not change during the short gameplay interaction');
  if(hasPrivateReferenceClip(gameplay.audioHistory, 'referenceClip')) issues.push('hosted audio cue history references private reference-audio assets');
  if(hasPrivateReferenceClip(gameplay.referenceStartedHistory, 'clip')) issues.push('hosted audio started private reference-audio assets');
  return issues;
}

async function main(){
  const args = parseArgs(process.argv.slice(2));
  const lane = String(args.lane || 'production').toLowerCase();
  const url = String(args.url || laneUrl(lane));
  const allowDirty = !!(args.allowDirty || args['allow-dirty']);
  const outRoot = path.resolve(ROOT, String(args.out || DEFAULT_OUT_ROOT));
  const outStem = `latest-${lane}`;
  ensureOut(outRoot);

  const browser = await launchHarnessBrowser();
  const pageErrors = [];
  const consoleErrors = [];
  const failedRequests = [];
  try{
    const context = await browser.newContext({ viewport: { width: 1440, height: 1600 } });
    const page = await context.newPage();
    page.on('pageerror', err => pageErrors.push(String(err?.message || err)));
    page.on('console', msg => {
      if(msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        resourceType: request.resourceType(),
        failure: request.failure()?.errorText || ''
      });
    });

    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(800);
    const buildInfo = await readBuildInfo(page);
    const firstCanvas = await readCanvasStats(page);

    await page.locator('#accountDockBtn').waitFor({ state: 'visible', timeout: 15000 });
    await page.locator('#accountDockBtn').click();
    await page.locator('#accountEmail').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('#accountPassword').waitFor({ state: 'visible', timeout: 10000 });
    await page.locator('#accountEmail').fill(TEST_EMAIL);
    await page.locator('#accountPassword').fill(TEST_PASSWORD);
    const account = await readAccountState(page);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    await page.locator('#settingsBtn').click();
    await page.locator('#themeSetSelect').waitFor({ state: 'visible', timeout: 10000 });
    const settings = await readSettingsState(page);
    await page.locator('#settingsPanelClose').click();
    await page.waitForTimeout(200);

    await page.evaluate(() => {
      const debug = window.__platinumAudioDebug || window.__auroraAudioDebug || {};
      if(Array.isArray(debug.history)) debug.history.length = 0;
      if(Array.isArray(debug.reference?.startedHistory)) debug.reference.startedHistory.length = 0;
      if(Array.isArray(debug.reference?.blockedHistory)) debug.reference.blockedHistory.length = 0;
    });
    const beforeGameplayCanvas = await readCanvasStats(page);
    await page.locator('#c').focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(700);
    for(let i = 0; i < 5; i++){
      await page.keyboard.press('Space');
      await page.waitForTimeout(120);
    }
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(180);
    await page.keyboard.up('ArrowLeft');
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(180);
    await page.keyboard.up('ArrowRight');
    await page.waitForTimeout(1500);
    const afterGameplayCanvas = await readCanvasStats(page);
    const gameplay = await readGameplayState(page);

    const screenshotPath = path.join(outRoot, `${outStem}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });

    const report = {
      artifactType: 'hosted-lane-smoke',
      generatedAt: new Date().toISOString(),
      generatedBy: 'tools/harness/check-hosted-lane-smoke.js',
      lane,
      url,
      options: {
        allowDirty
      },
      buildInfo,
      firstLoad: {
        canvas: firstCanvas
      },
      account,
      settings,
      gameplay,
      gameplayCanvas: {
        before: beforeGameplayCanvas,
        after: afterGameplayCanvas,
        changed: beforeGameplayCanvas.hash !== afterGameplayCanvas.hash
      },
      browser: {
        pageErrors,
        consoleErrors: consoleErrors.filter(message => !/favicon/i.test(message)).slice(0, 20),
        failedRequests: failedRequests.slice(0, 40)
      },
      artifacts: {
        screenshot: rel(screenshotPath)
      }
    };
    report.issues = validateReport(report, { allowDirty });
    report.ok = report.issues.length === 0;

    const reportPath = path.join(outRoot, `${outStem}.json`);
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
    if(lane === 'production'){
      fs.writeFileSync(path.join(outRoot, 'latest.json'), `${JSON.stringify(report, null, 2)}\n`);
    }

    await context.close();
    if(!report.ok){
      fail('Hosted lane smoke failed.', {
        report: rel(reportPath),
        issues: report.issues,
        screenshot: report.artifacts.screenshot
      });
    }
    console.log(JSON.stringify({
      ok: true,
      lane,
      url,
      label: buildInfo?.label || '',
      report: rel(reportPath),
      screenshot: report.artifacts.screenshot,
      cueNames: gameplay.cueNames,
      settings: {
        themeSet: settings.themeSetLabel,
        audioTheme: settings.audioThemeLabel,
        musicVolume: settings.musicVolumeLabel,
        gameSoundVolume: settings.gameSoundVolumeLabel
      }
    }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch(err => fail(err && err.stack || String(err)));
