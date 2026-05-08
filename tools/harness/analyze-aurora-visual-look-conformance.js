#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'aurora-visual-look-conformance');

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, value.endsWith('\n') ? value : `${value}\n`);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function gitBranch(){
  try{
    return execFileSync('git', ['-C', ROOT, 'branch', '--show-current'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function dirty(){
  try{
    return execFileSync('git', ['-C', ROOT, 'status', '--short'], { encoding: 'utf8' }).trim().length > 0;
  }catch{
    return false;
  }
}

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, value));
}

function scoreBand(value, target, tolerance){
  if(!Number.isFinite(+value)) return 0;
  return clamp(1 - Math.abs(value - target) / tolerance);
}

function scoreMin(value, min, full){
  if(!Number.isFinite(+value)) return 0;
  if(value >= full) return 1;
  if(value <= min) return 0;
  return (value - min) / (full - min);
}

function average(values){
  const finite = values.filter(Number.isFinite);
  return finite.length ? finite.reduce((sum, value) => sum + value, 0) / finite.length : 0;
}

function score10(value){
  return round(clamp(value) * 10, 2);
}

function rectToPlain(rect){
  if(!rect) return null;
  return {
    left: round(rect.left, 1),
    top: round(rect.top, 1),
    right: round(rect.right, 1),
    bottom: round(rect.bottom, 1),
    width: round(rect.width, 1),
    height: round(rect.height, 1)
  };
}

async function screenshot(page, file){
  ensureDir(path.dirname(file));
  await page.screenshot({ path: file, fullPage: false });
  return rel(file);
}

async function visibleTextAndLayout(page){
  return page.evaluate(() => {
    const visible = element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        rect.width > 0 &&
        rect.height > 0;
    };
    const elements = [...document.body.querySelectorAll('body *')].filter(visible);
    const textElements = elements
      .map(element => ({
        id: element.id || '',
        tag: element.tagName.toLowerCase(),
        text: (element.innerText || element.textContent || '').trim().replace(/\s+/g, ' '),
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight
      }))
      .filter(item => item.text);
    const overflow = textElements.filter(item => item.scrollWidth > item.clientWidth + 2);
    const buttons = elements.filter(element => /button|a/i.test(element.tagName));
    const frame = document.getElementById('playfieldFrame')?.getBoundingClientRect();
    const canvas = document.getElementById('c')?.getBoundingClientRect();
    const statusPanels = document.getElementById('statusPanels')?.getBoundingClientRect();
    return {
      visibleElementCount: elements.length,
      textElementCount: textElements.length,
      textCharacterCount: textElements.reduce((sum, item) => sum + item.text.length, 0),
      longestText: textElements.reduce((best, item) => item.text.length > best.length ? item.text : best, ''),
      overflowCount: overflow.length,
      overflow: overflow.slice(0, 8).map(item => ({
        id: item.id,
        tag: item.tag,
        text: item.text.slice(0, 96),
        widthDelta: item.scrollWidth - item.clientWidth,
        heightDelta: item.scrollHeight - item.clientHeight
      })),
      buttonCount: buttons.length,
      frame: frame ? {
        left: frame.left,
        top: frame.top,
        right: frame.right,
        bottom: frame.bottom,
        width: frame.width,
        height: frame.height
      } : null,
      canvas: canvas ? {
        left: canvas.left,
        top: canvas.top,
        right: canvas.right,
        bottom: canvas.bottom,
        width: canvas.width,
        height: canvas.height
      } : null,
      statusPanels: statusPanels ? {
        left: statusPanels.left,
        top: statusPanels.top,
        right: statusPanels.right,
        bottom: statusPanels.bottom,
        width: statusPanels.width,
        height: statusPanels.height
      } : null
    };
  });
}

async function canvasMetrics(page){
  return page.evaluate(() => {
    const canvas = document.getElementById('c');
    if(!canvas) return null;
    const context = canvas.getContext('2d');
    const { width, height } = canvas;
    const image = context.getImageData(0, 0, width, height).data;
    const colors = new Set();
    const luminance = [];
    const activeLuminance = [];
    let nonDark = 0;
    let bright = 0;
    let saturated = 0;
    let samples = 0;
    for(let y = 0; y < height; y += 2){
      for(let x = 0; x < width; x += 2){
        const index = (y * width + x) * 4;
        const r = image[index];
        const g = image[index + 1];
        const b = image[index + 2];
        const a = image[index + 3];
        if(a < 8) continue;
        const lum = (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        luminance.push(lum);
        samples++;
        if(lum > 24){
          nonDark++;
          activeLuminance.push(lum);
        }
        if(lum > 160) bright++;
        if(max - min > 45 && lum > 24) saturated++;
        colors.add(`${r >> 4}:${g >> 4}:${b >> 4}`);
      }
    }
    luminance.sort((a, b) => a - b);
    const percentile = (items, p) => items.length ? items[Math.min(items.length - 1, Math.max(0, Math.floor(items.length * p)))] : 0;
    activeLuminance.sort((a, b) => a - b);
    return {
      width,
      height,
      samples,
      quantizedColorCount: colors.size,
      nonDarkRatio: samples ? nonDark / samples : 0,
      brightRatio: samples ? bright / samples : 0,
      saturatedRatio: samples ? saturated / samples : 0,
      luminanceP10: percentile(luminance, .1),
      luminanceP90: percentile(luminance, .9),
      contrastSpread: percentile(luminance, .9) - percentile(luminance, .1),
      activeLuminanceP10: percentile(activeLuminance, .1),
      activeLuminanceP90: percentile(activeLuminance, .9),
      activeContrastSpread: percentile(activeLuminance, .9) - percentile(activeLuminance, .1)
    };
  });
}

function frameContainment(layout){
  const frame = layout.frame;
  const canvas = layout.canvas;
  if(!frame || !canvas) return 0;
  return frame.width >= 240 &&
    frame.height >= 300 &&
    canvas.width >= frame.width &&
    canvas.height >= frame.height
    ? 1
    : 0;
}

function surfaceScore(kind, layout, canvas){
  const noOverflow = layout.overflowCount === 0 ? 1 : Math.max(0, 1 - layout.overflowCount / 6);
  const textDensity = scoreBand(layout.textCharacterCount, kind === 'gameplay' ? 600 : 1800, kind === 'gameplay' ? 900 : 2200);
  const controls = scoreMin(layout.buttonCount, kind === 'gameplay' ? 2 : 4, kind === 'gameplay' ? 6 : 12);
  const frame = frameContainment(layout);
  const canvasQuality = canvas ? average([
    scoreMin(canvas.quantizedColorCount, 8, 32),
    scoreBand(canvas.nonDarkRatio, kind === 'gameplay' ? .035 : .04, .06),
    scoreMin(canvas.activeContrastSpread, 42, 128),
    scoreMin(canvas.saturatedRatio, .001, .02)
  ]) : .5;
  return score10(average([
    noOverflow * 1.25,
    textDensity,
    controls * .8,
    frame * 1.1,
    canvasQuality * 1.4
  ].map((value, index) => value / ([1.25, 1, .8, 1.1, 1.4][index]))));
}

async function captureSurface(page, spec, dir){
  if(spec.before) await spec.before(page);
  await page.waitForTimeout(spec.waitMs || 250);
  const image = await screenshot(page, path.join(dir, `${spec.id}.png`));
  const layout = await visibleTextAndLayout(page);
  const canvas = await canvasMetrics(page);
  return {
    id: spec.id,
    label: spec.label,
    image,
    score10: surfaceScore(spec.kind || spec.id, layout, canvas),
    layout: Object.assign({}, layout, {
      frame: rectToPlain(layout.frame),
      canvas: rectToPlain(layout.canvas),
      statusPanels: rectToPlain(layout.statusPanels)
    }),
    canvas: canvas ? Object.fromEntries(Object.entries(canvas).map(([key, value]) => [key, typeof value === 'number' ? round(value, 4) : value])) : null
  };
}

function summarize(surfaces){
  const byId = Object.fromEntries(surfaces.map(surface => [surface.id, surface]));
  const evidenceCoverage = surfaces.length / 4;
  const overflowCount = surfaces.reduce((sum, surface) => sum + surface.layout.overflowCount, 0);
  const frameContainmentAverage = average(surfaces.map(surface => frameContainment(surface.layout)));
  const gameplay = byId.gameplay?.score10 || 0;
  const frontDoor = byId.frontDoor?.score10 || 0;
  const settings = byId.settings?.score10 || 0;
  const guide = byId.guide?.score10 || 0;
  const score = (
    gameplay * .32 +
    frontDoor * .24 +
    settings * .16 +
    guide * .16 +
    score10(evidenceCoverage) * .07 +
    score10(frameContainmentAverage) * .05
  );
  const weakest = surfaces.slice().sort((a, b) => a.score10 - b.score10)[0] || null;
  return {
    score10: round(score, 2),
    confidence: 'medium-low',
    resolution: 'first-pass browser screenshot and DOM/canvas metric scorer',
    evidenceCoverage: round(evidenceCoverage, 3),
    surfaceCount: surfaces.length,
    overflowCount,
    frameContainmentAverage: round(frameContainmentAverage, 3),
    weakestSurface: weakest ? {
      id: weakest.id,
      label: weakest.label,
      score10: weakest.score10
    } : null
  };
}

async function main(){
  const commit = gitShortCommit();
  const generatedAt = new Date().toISOString();
  const reportDir = path.join(OUT_ROOT, `${generatedAt.slice(0, 10)}-${commit}${dirty() ? '-dirty' : ''}`);
  const screenshotDir = path.join(reportDir, 'screenshots');
  const surfaces = await withHarnessPage({
    skipStart: true,
    seed: 93117,
    viewport: { width: 1280, height: 940 }
  }, async ({ page }) => {
    await page.evaluate(() => {
      if(typeof installGamePack === 'function') installGamePack('aurora-galactica', { persist: false });
      if(typeof draw === 'function') draw();
    });
    const frontDoor = await captureSurface(page, {
      id: 'frontDoor',
      label: 'Front door / attract shell',
      kind: 'frontDoor'
    }, screenshotDir);
    await page.evaluate(() => {
      window.__galagaHarness__.start({
        stage: 1,
        ships: 3,
        seed: 93117,
        autoVideo: false,
        controlledClock: true
      });
      window.__galagaHarness__.advanceFor(4.5, { step: 1 / 60, stopOnGameOver: false });
    });
    const gameplay = await captureSurface(page, {
      id: 'gameplay',
      label: 'Stage 1 gameplay readability',
      kind: 'gameplay'
    }, screenshotDir);
    await page.click('#settingsBtn');
    const settings = await captureSurface(page, {
      id: 'settings',
      label: 'Developer/settings popup surface',
      kind: 'popup',
      waitMs: 300
    }, screenshotDir);
    await page.click('#settingsPanelClose');
    await page.waitForTimeout(160);
    await page.click('#guideDockBtn');
    const guide = await captureSurface(page, {
      id: 'guide',
      label: 'Guide/help popup surface',
      kind: 'popup',
      waitMs: 300
    }, screenshotDir);
    return [frontDoor, gameplay, settings, guide];
  });

  const summary = summarize(surfaces);
  const report = {
    schemaVersion: 1,
    artifactType: 'aurora-visual-look-conformance',
    generatedAt,
    commit,
    branch: gitBranch(),
    dirty: dirty(),
    problem: 'Aurora visual look and feel was previously a low-confidence planning estimate with no dedicated scorer.',
    strategy: 'Capture representative browser surfaces and score objective visual-readability, layout-containment, palette, contrast, text-overflow, and evidence-coverage metrics.',
    measurementLimits: [
      'This first pass scores measurable browser/UI evidence, not arcade-authentic sprite art quality.',
      'Reference Galaga/Galaga-family visual contact sheets are not yet fully linked as numeric targets.',
      'GPU usage is currently inferred as an expected resource for future visual analysis, not directly measured by this script.'
    ],
    groundingBestCase: 'Best case is a reference-backed visual scorer comparing Aurora and Galaga-family contact sheets for start/attract, gameplay, score, popup, and game-over surfaces.',
    summary,
    surfaces
  };

  writeJson(path.join(reportDir, 'report.json'), report);
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  writeText(path.join(reportDir, 'README.md'), [
    '# Aurora Visual Look Conformance',
    '',
    `Generated: \`${generatedAt}\``,
    '',
    `Score: **${summary.score10}/10**`,
    '',
    'This first-pass scorer captures representative browser surfaces and computes objective layout/readability metrics. It is a measured baseline, not a final arcade-art scorer.',
    '',
    '## Screenshots',
    '',
    ...surfaces.map(surface => `- ${surface.label}: \`${surface.image}\` (${surface.score10}/10)`),
    '',
    '## Limits',
    '',
    ...report.measurementLimits.map(limit => `- ${limit}`)
  ].join('\n'));

  console.log(JSON.stringify({
    ok: true,
    report: rel(path.join(reportDir, 'report.json')),
    latest: rel(path.join(OUT_ROOT, 'latest.json')),
    score10: summary.score10,
    weakestSurface: summary.weakestSurface
  }, null, 2));
}

main().catch(err => {
  console.error(err && err.stack || String(err));
  process.exit(1);
});
