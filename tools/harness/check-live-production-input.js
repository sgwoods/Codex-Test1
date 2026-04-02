#!/usr/bin/env node
const fs = require('fs');
const { chromium } = require('playwright-core');

const TARGET_URL = 'https://sgwoods.github.io/Aurora-Galactica/';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function open(page){
  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const hasHarness = await page.evaluate(() => !!window.__galagaHarness__);
  if(!hasHarness) fail('production page did not expose __galagaHarness__');
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
  const beforeEvents = await page.evaluate(() => window.__galagaHarness__.recentEvents({ count: 200 }).length);
  await page.keyboard.down(key);
  await page.waitForTimeout(160);
  const mid = await page.evaluate(() => window.__galagaHarness__.inputState());
  await page.keyboard.up(key);
  await page.waitForTimeout(100);
  const after = await page.evaluate(() => window.__galagaHarness__.inputState());
  const events = await page.evaluate((startIndex) => {
    const all = window.__galagaHarness__.recentEvents({ count: 200 }).slice(startIndex);
    return all.filter(evt => ['key_down', 'key_up', 'input_state_reset'].includes(evt.type)).slice(-12);
  }, beforeEvents);
  return {
    key,
    before,
    mid,
    after,
    events,
    delta: +(after.playerX - before.playerX).toFixed(2)
  };
}

async function main(){
  if(!fs.existsSync(CHROME)) throw new Error(`Chrome not found at ${CHROME}`);
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required']
  });
  try{
    const context = await browser.newContext({ viewport: { width: 1600, height: 1700 } });
    const page = await context.newPage();
    await open(page);
    const initial = await page.evaluate(() => window.__galagaHarness__.inputState());
    const keyMoves = [
      await moveWithKey(page, 'a'),
      await moveWithKey(page, 'z'),
      await moveWithKey(page, 'ArrowLeft'),
      await moveWithKey(page, 'd'),
      await moveWithKey(page, 'c'),
      await moveWithKey(page, 'ArrowRight'),
      await moveWithKey(page, ' ')
    ];
    console.log(JSON.stringify({
      ok: true,
      initial,
      keyMoves
    }, null, 2));
    await context.close();
  } finally {
    await browser.close();
  }
}

main().catch(err => fail(err && err.stack || String(err)));
