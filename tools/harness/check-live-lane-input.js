#!/usr/bin/env node
const fs = require('fs');
const { chromium } = require('playwright-core');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

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
  if(lane === 'beta') return 'https://sgwoods.github.io/Aurora-Galactica/beta/';
  if(lane === 'production') return 'https://sgwoods.github.io/Aurora-Galactica/';
  throw new Error('Use --lane beta or --lane production.');
}

async function open(page, url){
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const hasHarness = await page.evaluate(() => !!window.__galagaHarness__);
  if(!hasHarness) fail('hosted lane did not expose __galagaHarness__', { url });
  await page.evaluate(() => window.__galagaHarness__.start({ stage: 1, ships: 3 }));
  await page.waitForFunction(() => {
    const state = window.__galagaHarness__.inputState();
    return state.started && state.spawn <= 0;
  }, null, { timeout: 8000 });
  await page.locator('#c').focus();
  await page.waitForTimeout(120);
}

async function moveWithKey(page, key){
  const before = await page.evaluate(() => window.__galagaHarness__.inputState());
  const startEvents = await page.evaluate(() => window.__galagaHarness__.recentEvents({ count: 200 }).length);
  await page.keyboard.down(key);
  await page.waitForTimeout(160);
  const mid = await page.evaluate(() => window.__galagaHarness__.inputState());
  await page.keyboard.up(key);
  await page.waitForTimeout(100);
  const after = await page.evaluate(() => window.__galagaHarness__.inputState());
  const recentResetEvents = await page.evaluate((startIndex) => {
    return window.__galagaHarness__
      .recentEvents({ count: 200 })
      .slice(startIndex)
      .filter(evt => evt.type === 'input_state_reset')
      .slice(-20);
  }, startEvents);
  return {
    key,
    beforeX: before.playerX,
    midX: mid.playerX,
    afterX: after.playerX,
    delta: +(after.playerX - before.playerX).toFixed(2),
    recentResetEvents
  };
}

async function main(){
  const args = parseArgs(process.argv.slice(2));
  const lane = String(args.lane || 'production').toLowerCase();
  const url = laneUrl(lane);
  if(!fs.existsSync(CHROME)) throw new Error(`Chrome not found at ${CHROME}`);
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required']
  });
  try{
    const context = await browser.newContext({ viewport: { width: 1600, height: 1700 } });
    const page = await context.newPage();
    await open(page, url);
    const mapping = await page.evaluate(() => window.__galagaHarness__.inputState());
    const expectedLeft = ['ArrowLeft', 'KeyA', 'KeyZ'];
    const expectedRight = ['ArrowRight', 'KeyD', 'KeyC'];
    if(JSON.stringify(mapping.leftCodes) !== JSON.stringify(expectedLeft)){
      fail('left movement mapping drifted on hosted lane', { lane, mapping });
    }
    if(JSON.stringify(mapping.rightCodes) !== JSON.stringify(expectedRight)){
      fail('right movement mapping drifted on hosted lane', { lane, mapping });
    }
    const keyMoves = [
      await moveWithKey(page, 'a'),
      await moveWithKey(page, 'z'),
      await moveWithKey(page, 'ArrowLeft'),
      await moveWithKey(page, 'd'),
      await moveWithKey(page, 'c'),
      await moveWithKey(page, 'ArrowRight')
    ];
    for(const result of keyMoves.slice(0, 3)){
      if(!(result.delta <= -8)) fail('hosted lane left movement is not strong enough to count as playable', { lane, result, keyMoves });
      if(result.recentResetEvents.length) fail('hosted lane movement is being interrupted by input resets', { lane, result, keyMoves });
    }
    for(const result of keyMoves.slice(3)){
      if(!(result.delta >= 8)) fail('hosted lane right movement is not strong enough to count as playable', { lane, result, keyMoves });
      if(result.recentResetEvents.length) fail('hosted lane movement is being interrupted by input resets', { lane, result, keyMoves });
    }
    console.log(JSON.stringify({ ok: true, lane, url, mapping, keyMoves }, null, 2));
    await context.close();
  } finally {
    await browser.close();
  }
}

main().catch(err => fail(err && err.stack || String(err)));
