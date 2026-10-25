const assert = require('assert');
const { chromium } = require('playwright-core');
const { resolveHarnessBrowser, browserLaunchArgs } = require('./browser-launch');
const { checkDiagramContrast } = require('../build/render-white-paper-pdf');

(async () => {
  const browser = await chromium.launch({ executablePath: resolveHarnessBrowser().path, headless: true, args: browserLaunchArgs() });
  try {
    const page = await browser.newPage();
    await page.emulateMedia({ media: 'print' });
    for(const [background, passes] of [['#222222', false], ['#eef3f7', true]]){
      await page.setContent(`<div class="mermaid"><svg><g class="node"><rect width="100" height="60" fill="${background}"/><text class="nodeLabel" style="color:#161616">Label</text></g></svg></div>`);
      if(passes) assert.equal((await checkDiagramContrast(page)).nodeCount, 1);
      else await assert.rejects(checkDiagramContrast(page), /below 4.5/);
    }
    await page.setContent('<div class="mermaid">Unrendered diagram</div>');
    await assert.rejects(checkDiagramContrast(page), /No diagram nodes/);
    console.log('PASS: low contrast and missing diagrams rejected; readable diagram accepted.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
