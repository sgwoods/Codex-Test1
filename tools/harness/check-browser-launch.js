#!/usr/bin/env node
const fs = require('fs');
const { chromium } = require('playwright-core');
const { CHROME } = require('./browser-check-util');

function fail(message, payload = null){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  if(!fs.existsSync(CHROME)){
    fail('Chrome executable does not exist for Aurora browser harnesses.', { chromePath: CHROME });
  }

  const startedAt = Date.now();
  let browser;
  try{
    browser = await chromium.launch({
      executablePath: CHROME,
      headless: true,
      args: ['--autoplay-policy=no-user-gesture-required']
    });
    const context = await browser.newContext({ viewport: { width: 640, height: 480 } });
    const page = await context.newPage();
    await page.goto('about:blank');
    const userAgent = await page.evaluate(() => navigator.userAgent);
    await context.close();
    console.log(JSON.stringify({
      ok: true,
      chromePath: CHROME,
      launchMs: Date.now() - startedAt,
      userAgent
    }, null, 2));
  }catch(err){
    fail('Aurora browser harness launch probe failed.', {
      chromePath: CHROME,
      elapsedMs: Date.now() - startedAt,
      error: err && err.stack ? err.stack : String(err),
      next: [
        'Close stale automated Chrome crash dialogs if visible.',
        'Run the same command from a normal Terminal outside any sandbox.',
        'If only Codex sandbox runs fail, rerun browser harness commands with elevated/local execution.',
        'If normal Terminal also fails, update or reinstall Google Chrome and rerun npm run machine:doctor.'
      ]
    });
  }finally{
    if(browser){
      await browser.close().catch(() => {});
    }
  }
}

main().catch(err => fail(err && err.stack ? err.stack : String(err)));
