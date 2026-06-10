#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');
const { ROOT, DIST_DEV } = require('../build/paths');
const { launchHarnessBrowser } = require('./browser-launch');
const { LOCAL_BIND_HOST } = require('../dev/local-host-config');
const { OFFLINE_SAMPLE_RATE, renderSpecToWav, specScheduledDurationSeconds } = require('./audio-spec-renderer');

const OUT_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-foreground-audio-balance');
const LATEST_JSON = path.join(OUT_DIR, 'latest.json');
const LATEST_MD = path.join(OUT_DIR, 'latest.md');
const CUES = Object.freeze([
  'attackCharge',
  'enemyShot',
  'enemyHit',
  'enemyBoom',
  'bossHit',
  'bossBoom',
  'playerShot'
]);
const CUE_ROLE_EXPECTATIONS = Object.freeze({
  attackCharge: Object.freeze({
    minimumDurationSeconds: 1.2,
    read: 'Alien dive/attack charge cue should preserve a sustained reference phrase, not only the loud onset.'
  })
});

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function run(cmd, args, options = {}){
  const res = spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', ...options });
  if(res.status !== 0){
    fail(`${cmd} failed`, { args, status: res.status, stdout: res.stdout, stderr: res.stderr });
  }
  return res;
}

function mime(file){
  if(file.endsWith('.html')) return 'text/html; charset=utf-8';
  if(file.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if(file.endsWith('.json')) return 'application/json; charset=utf-8';
  if(file.endsWith('.png')) return 'image/png';
  if(file.endsWith('.m4a')) return 'audio/mp4';
  if(file.endsWith('.wav')) return 'audio/wav';
  return 'application/octet-stream';
}

function serve(root){
  const server = http.createServer((req, res) => {
    const clean = decodeURIComponent((req.url || '/').split('?')[0]);
    const reqPath = clean === '/' ? '/index.html' : clean;
    const file = path.resolve(root, `.${reqPath}`);
    if(!file.startsWith(root)) return res.writeHead(403).end('forbidden');
    fs.readFile(file, (err, data) => {
      if(err) return res.writeHead(404).end('not found');
      res.writeHead(200, { 'content-type': mime(file), 'cache-control': 'no-store' });
      res.end(data);
    });
  });
  return new Promise(resolve => {
    server.listen(0, LOCAL_BIND_HOST, () => resolve({ server, port: server.address().port }));
  });
}

function clone(value){
  try{
    return JSON.parse(JSON.stringify(value));
  }catch{
    return null;
  }
}

function cueUsesReferenceMedia(cue){
  if(!cue || typeof cue !== 'object') return false;
  if(String(cue.referenceClip || '').trim()) return true;
  if(Array.isArray(cue.layers) && cue.layers.some(cueUsesReferenceMedia)) return true;
  if(Array.isArray(cue.variants) && cue.variants.some(cueUsesReferenceMedia)) return true;
  if(cue.byPhase && typeof cue.byPhase === 'object') return Object.values(cue.byPhase).some(cueUsesReferenceMedia);
  return false;
}

function cueReferenceClips(cue){
  const clips = [];
  const visit = node => {
    if(!node || typeof node !== 'object') return;
    const clip = String(node.referenceClip || '').trim();
    if(clip) clips.push(clip);
    if(Array.isArray(node.layers)) node.layers.forEach(visit);
    if(Array.isArray(node.variants)) node.variants.forEach(visit);
    if(node.byPhase && typeof node.byPhase === 'object') Object.values(node.byPhase).forEach(visit);
  };
  visit(cue);
  return Array.from(new Set(clips));
}

function specTempName(label, cue){
  return `${label}-${cue}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'cue';
}

function decodeWavToSamples(wavPath){
  const res = run('ffmpeg', ['-v', 'error', '-i', wavPath, '-ac', '1', '-ar', String(OFFLINE_SAMPLE_RATE), '-f', 'f32le', 'pipe:1'], { encoding: null, maxBuffer: 1024 * 1024 * 32 });
  const bytes = res.stdout || Buffer.alloc(0);
  const samples = new Float32Array(Math.floor(bytes.byteLength / 4));
  for(let i = 0; i < samples.length; i += 1) samples[i] = bytes.readFloatLE(i * 4);
  return samples;
}

function renderSpecSamples(spec, tempDir, label, cue){
  const out = path.join(tempDir, `${specTempName(label, cue)}.wav`);
  renderSpecToWav(spec || {}, out, 0);
  return {
    wav: out,
    samples: decodeWavToSamples(out),
    durationSeconds: round((decodeWavToSamples(out).length || 0) / OFFLINE_SAMPLE_RATE, 3)
  };
}

function stats(samples, startSeconds = 0, durationSeconds = null){
  const start = Math.max(0, Math.floor(startSeconds * OFFLINE_SAMPLE_RATE));
  const end = durationSeconds === null
    ? samples.length
    : Math.min(samples.length, start + Math.max(1, Math.floor(durationSeconds * OFFLINE_SAMPLE_RATE)));
  let sum = 0;
  let peak = 0;
  let active = 0;
  for(let i = start; i < end; i += 1){
    const value = Number(samples[i]) || 0;
    const abs = Math.abs(value);
    sum += value * value;
    peak = Math.max(peak, abs);
    if(abs >= 0.01) active += 1;
  }
  const count = Math.max(1, end - start);
  return {
    rms: Math.sqrt(sum / count),
    peak,
    activeShare: active / count
  };
}

function dbRatio(numerator, denominator){
  if(!(numerator > 0) || !(denominator > 0)) return null;
  return round(20 * Math.log10(numerator / denominator), 2);
}

function addInto(target, source, offsetSeconds = 0){
  const offset = Math.max(0, Math.floor(offsetSeconds * OFFLINE_SAMPLE_RATE));
  for(let i = 0; i < source.length && offset + i < target.length; i += 1){
    target[offset + i] += source[i] || 0;
  }
}

function balanceRows(scenario, tempDir){
  const pulse = renderSpecSamples(scenario.stagePulse.spec, tempDir, scenario.id, 'stagePulse');
  const pulseDuration = specScheduledDurationSeconds(scenario.stagePulse.spec) || pulse.durationSeconds || 0.82;
  const foregroundOffsetSeconds = 0.18;
  return CUES.map(cue => {
    const foreground = renderSpecSamples(scenario.cues[cue].spec, tempDir, scenario.id, cue);
    const foregroundDuration = specScheduledDurationSeconds(scenario.cues[cue].spec) || foreground.durationSeconds || 0.24;
    const roleExpectation = CUE_ROLE_EXPECTATIONS[cue] || null;
    const minimumDurationSeconds = roleExpectation?.minimumDurationSeconds || null;
    const phraseDurationPass = minimumDurationSeconds === null || foregroundDuration >= minimumDurationSeconds;
    const duration = Math.max(pulse.samples.length / OFFLINE_SAMPLE_RATE, foregroundOffsetSeconds + (foreground.samples.length / OFFLINE_SAMPLE_RATE) + 0.05);
    const sampleCount = Math.ceil(duration * OFFLINE_SAMPLE_RATE);
    const pulseOnly = new Float32Array(sampleCount);
    const foregroundOnly = new Float32Array(sampleCount);
    const composite = new Float32Array(sampleCount);
    addInto(pulseOnly, pulse.samples, 0);
    addInto(foregroundOnly, foreground.samples, foregroundOffsetSeconds);
    addInto(composite, pulse.samples, 0);
    addInto(composite, foreground.samples, foregroundOffsetSeconds);
    const windowDuration = Math.max(0.08, Math.min(0.42, foregroundDuration));
    const pulseWindow = stats(pulseOnly, foregroundOffsetSeconds, windowDuration);
    const foregroundWindow = stats(foregroundOnly, foregroundOffsetSeconds, windowDuration);
    const compositeWindow = stats(composite, foregroundOffsetSeconds, windowDuration);
    const foregroundRmsOverPulseDb = dbRatio(foregroundWindow.rms, pulseWindow.rms);
    const foregroundPeakOverPulseDb = dbRatio(foregroundWindow.peak, pulseWindow.peak);
    const compositeLiftOverPulseDb = dbRatio(compositeWindow.rms, pulseWindow.rms);
    const audibleSeparationPass = foregroundRmsOverPulseDb !== null && compositeLiftOverPulseDb !== null
      && foregroundRmsOverPulseDb >= 2.5
      && compositeLiftOverPulseDb >= 1.5;
    const cueRolePass = audibleSeparationPass && phraseDurationPass;
    const read = foregroundRmsOverPulseDb === null
      ? 'No measurable foreground/pulse RMS ratio.'
      : foregroundRmsOverPulseDb < 2.5
        ? 'Foreground cue risks being masked by the stagePulse bed in the cue-probe window.'
        : !phraseDurationPass
          ? roleExpectation.read
          : 'Foreground cue has measurable level separation over the stagePulse bed.';
    return {
      cue,
      foregroundOffsetSeconds,
      foregroundDurationSeconds: round(foregroundDuration, 3),
      roleExpectation: roleExpectation ? {
        minimumDurationSeconds,
        read: roleExpectation.read
      } : null,
      pulseDurationSeconds: round(pulseDuration, 3),
      foregroundRmsOverPulseDb,
      foregroundPeakOverPulseDb,
      compositeLiftOverPulseDb,
      foregroundRms: round(foregroundWindow.rms, 5),
      pulseRms: round(pulseWindow.rms, 5),
      compositeRms: round(compositeWindow.rms, 5),
      foregroundPeak: round(foregroundWindow.peak, 5),
      pulsePeak: round(pulseWindow.peak, 5),
      compositePeak: round(compositeWindow.peak, 5),
      activeShare: round(compositeWindow.activeShare, 3),
      audibleSeparationPass,
      phraseDurationPass,
      cueRolePass,
      read
    };
  });
}

async function scenarioRead(browser, port, scenario){
  const context = await browser.newContext({ viewport: { width: 960, height: 960 } });
  const page = await context.newPage();
  const url = `http://${scenario.host}:${port}/index.html`;
  await page.addInitScript(seed => {
    const cfg = { stage: 1, ships: 3, challenge: false, seed };
    localStorage.setItem('auroraGalacticaAutoVideo', '0');
    localStorage.setItem('auroraGalacticaTestCfg', JSON.stringify(cfg));
    localStorage.setItem('auroraGalacticaHarnessSeed', String(seed >>> 0));
    localStorage.setItem('platinumAutoVideo', '0');
    localStorage.setItem('platinumTestCfg', JSON.stringify(cfg));
    localStorage.setItem('platinumHarnessSeed', String(seed >>> 0));
  }, 314159);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.__galagaHarness__);
  const result = await page.evaluate(payload => {
    if(typeof installGamePack === 'function') installGamePack('aurora-galactica', { persist: false });
    const runtime = window.__galagaHarness__.audioRuntimeInfo();
    const resolve = (name, opts = {}) => {
      const cueOpts = { phase: 'stage', challenge: false, force: true, allowIdle: true, ...opts };
      return window.__galagaHarness__.audioCueSpec(name, cueOpts);
    };
    const stagePulse = resolve('stagePulse', { variant: 0 });
    const cues = {};
    for(const cue of payload.cues) cues[cue] = resolve(cue);
    return { runtime, stagePulse, cues };
  }, { cues: CUES });
  await context.close();
  return {
    id: scenario.id,
    label: scenario.label,
    host: scenario.host,
    url,
    runtime: result.runtime,
    stagePulse: {
      event: result.stagePulse.event,
      spec: clone(result.stagePulse.spec),
      usesReferenceMedia: cueUsesReferenceMedia(result.stagePulse.spec),
      referenceClips: cueReferenceClips(result.stagePulse.spec)
    },
    cues: Object.fromEntries(CUES.map(cue => [
      cue,
      {
        event: result.cues[cue].event,
        spec: clone(result.cues[cue].spec),
        usesReferenceMedia: cueUsesReferenceMedia(result.cues[cue].spec),
        referenceClips: cueReferenceClips(result.cues[cue].spec)
      }
    ]))
  };
}

function publicSafePass(scenario){
  if(scenario.runtime.referenceAudioAvailable) return false;
  const rows = [scenario.stagePulse, ...Object.values(scenario.cues)];
  return rows.every(row => !row.usesReferenceMedia);
}

function markdown(report){
  const lines = [
    '# Aurora Foreground Audio Balance',
    '',
    'This report compares local/private reference-audio cue behavior against a public-safe host simulation, then measures whether foreground combat cues separate from the stagePulse bed in a short offline cue-probe window.',
    '',
    `Generated: ${report.generatedAt}`,
    `Commit: \`${report.commit}\``,
    '',
    '## Summary',
    '',
    `- Dev reference available: ${report.summary.devReferenceAudioAvailable}`,
    `- Public-safe private clip leak guard: ${report.summary.publicSafePrivateClipLeakPass}`,
    `- Weak foreground rows: ${report.summary.weakForegroundRows.length ? report.summary.weakForegroundRows.join(', ') : 'none'}`,
    `- Minimum foreground RMS over pulse: ${report.summary.minForegroundRmsOverPulseDb} dB`,
    '',
    '## Scenario Resolution',
    '',
    '| Scenario | Host | Default theme | Reference available | Stage pulse clip |',
    '| --- | --- | --- | --- | --- |'
  ];
  for(const scenario of report.scenarios){
    lines.push(`| ${scenario.label} | ${scenario.runtime.hostname} | ${scenario.runtime.defaultAudioTheme} | ${scenario.runtime.referenceAudioAvailable} | ${scenario.stagePulse.referenceClips.join(', ') || 'synthetic'} |`);
  }
  lines.push('', '## Foreground Over Pulse', '', '| Cue | Dev duration | Dev RMS dB over pulse | Dev composite lift | Public-safe RMS dB over pulse | Pass | Read |', '| --- | ---: | ---: | ---: | ---: | --- | --- |');
  for(const cue of CUES){
    const dev = report.balance.devReference.rows.find(row => row.cue === cue);
    const safe = report.balance.publicSafe.rows.find(row => row.cue === cue);
    lines.push(`| ${cue} | ${dev.foregroundDurationSeconds}s | ${dev.foregroundRmsOverPulseDb} | ${dev.compositeLiftOverPulseDb} | ${safe.foregroundRmsOverPulseDb} | ${dev.cueRolePass} | ${dev.read} |`);
  }
  lines.push('', '## Decision', '', report.recommendation);
  return `${lines.join('\n')}\n`;
}

async function main(){
  if(!fs.existsSync(path.join(DIST_DEV, 'index.html'))) fail('dist/dev is missing. Run npm run build first.');
  ensureDir(OUT_DIR);
  const tempDir = path.join(OUT_DIR, '.tmp');
  fs.rmSync(tempDir, { recursive: true, force: true });
  ensureDir(tempDir);
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
  const { server, port } = await serve(DIST_DEV);
  const browser = await launchHarnessBrowser();
  try{
    const scenarios = [];
    scenarios.push(await scenarioRead(browser, port, {
      id: 'devReference',
      label: 'localhost dev reference lane',
      host: 'localhost'
    }));
    scenarios.push(await scenarioRead(browser, port, {
      id: 'publicSafe',
      label: 'public-safe production-host simulation',
      host: 'aurora-public.localhost'
    }));
    const devRows = balanceRows(scenarios[0], tempDir);
    const publicRows = balanceRows(scenarios[1], tempDir);
    const weakForegroundRows = devRows
      .filter(row => !row.audibleSeparationPass)
      .map(row => row.cue);
    const weakCueRoleRows = devRows
      .filter(row => row.cueRolePass === false)
      .map(row => row.cue);
    const minForeground = Math.min(...devRows.map(row => Number.isFinite(+row.foregroundRmsOverPulseDb) ? +row.foregroundRmsOverPulseDb : -99));
    const report = {
      artifactType: 'aurora-foreground-audio-balance',
      version: '0.1-dev-review',
      generatedBy: 'tools/harness/analyze-aurora-foreground-audio-balance.js',
      generatedAt: new Date().toISOString(),
      commit,
      scope: {
        gameKey: 'aurora-galactica',
        cues: ['stagePulse', ...CUES],
        lane: 'localhost-dev-reference-audio-vs-public-safe-simulation'
      },
      summary: {
        devReferenceAudioAvailable: scenarios[0].runtime.referenceAudioAvailable === true,
        publicSafePrivateClipLeakPass: publicSafePass(scenarios[1]),
        weakForegroundRows,
        weakCueRoleRows,
        minForegroundRmsOverPulseDb: round(minForeground, 2),
        recommendationClass: weakCueRoleRows.length ? 'cue-role-window-candidate' : 'audio-lane-clean'
      },
      scenarios,
      balance: {
        devReference: {
          scenarioId: scenarios[0].id,
          rows: devRows
        },
        publicSafe: {
          scenarioId: scenarios[1].id,
          rows: publicRows
        }
      },
      recommendation: weakCueRoleRows.length
        ? `Target the weak foreground cue-role row(s) only: ${weakCueRoleRows.join(', ')}. Keep public-safe cue resolution synthetic/no-reference.`
        : 'Foreground/pulse balance and cue-role duration pass for the measured local reference lane; preserve the current cue windows while keeping public-safe cue resolution synthetic/no-reference.'
    };
    writeReport(report);
    console.log(JSON.stringify({
      ok: true,
      artifact: rel(LATEST_JSON),
      report: rel(LATEST_MD),
      weakForegroundRows,
      minForegroundRmsOverPulseDb: report.summary.minForegroundRmsOverPulseDb,
      publicSafePrivateClipLeakPass: report.summary.publicSafePrivateClipLeakPass
    }, null, 2));
  }finally{
    await browser.close();
    server.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function writeReport(report){
  ensureDir(OUT_DIR);
  fs.writeFileSync(LATEST_JSON, JSON.stringify(report, null, 2));
  fs.writeFileSync(LATEST_MD, markdown(report));
}

main().catch(err => {
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
});
