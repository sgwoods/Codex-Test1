const assert = require('assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');
const { regenerateProductionDocumentation, productionDocumentationFixtureInfo } = require('../build/build-index');
const { launchHarnessBrowser } = require('./browser-launch');
const { checkDiagramContrast } = require('../build/render-white-paper-pdf');
const { renderStaticDiagram } = require('../build/static-diagram');

(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'static-paper-'));
  let browser;
  try {
    regenerateProductionDocumentation(dir, productionDocumentationFixtureInfo());
    browser = await launchHarnessBrowser();
    const page = await browser.newPage({ javaScriptEnabled: false });
    const remote = [];
    await page.route(/^https?:/, route => { remote.push(route.request().url()); return route.abort(); });
    await page.goto(pathToFileURL(path.join(dir, 'white-paper.html')).href);
    const count = await page.locator('.mermaid').count();
    assert(count > 0);
    assert.equal(await page.locator('.mermaid svg').count(), count);
    assert.equal(await page.locator('.mermaid foreignObject').count(), 0);
    assert.equal(await page.locator('script[src]').count(), 0);
    assert(await page.locator('meta[http-equiv="Content-Security-Policy"]').count());
    for(const diagram of await page.locator('.mermaid svg').all()){
      const box = await diagram.boundingBox();
      assert(box.width > 100 && box.height > 100);
    }
    for(const node of await page.locator('.mermaid .node').all()){
      const shape = await node.locator('rect').first().boundingBox();
      const label = await node.locator('.label').boundingBox();
      assert(shape && label && label.x >= shape.x - 1 && label.y >= shape.y - 1
        && label.x + label.width <= shape.x + shape.width + 1
        && label.y + label.height <= shape.y + shape.height + 1, 'Node label exceeds its box');
    }
    await page.emulateMedia({ media: 'print' });
    const contrast = await checkDiagramContrast(page);
    assert(contrast.minimumContrast >= 4.5);
    assert(!remote.some(url => /mermaid|jsdelivr/i.test(url)));
    await page.pdf({ path: path.join(dir, 'white-paper.pdf'), printBackground: true });
    assert(fs.statSync(path.join(dir, 'white-paper.pdf')).size > 10000);
    assert.throws(() => renderStaticDiagram('not a valid diagram'), /Command failed/);
    console.log(JSON.stringify({ ok: true, diagrams: count, javaScriptDisabled: true, productionCsp: true, contrast, previewDirectory: dir }));
  } finally {
    if(browser) await browser.close();
    if(!process.argv.includes('--keep-output')) fs.rmSync(dir, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
