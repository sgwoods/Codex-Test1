const fs = require('fs');
const path = require('path');
const { launchHarnessBrowser } = require('../harness/browser-launch');

async function main(){
  const { source, id } = JSON.parse(fs.readFileSync(0, 'utf8'));
  const browser = await launchHarnessBrowser();
  try {
    const page = await browser.newPage();
    await page.route('**/*', route => route.abort());
    await page.setContent('<!doctype html><html><body></body></html>');
    const packageRoot = path.dirname(require.resolve('mermaid/package.json'));
    await page.addScriptTag({ path: path.join(packageRoot, 'dist/mermaid.min.js') });
    const svg = await page.evaluate(async ({ source, id }) => {
      mermaid.initialize({
        startOnLoad: false, securityLevel: 'strict', theme: 'base',
        deterministicIds: true, htmlLabels: false, look: 'classic',
        themeVariables: {
          primaryColor: '#eef3f7', primaryTextColor: '#161616',
          primaryBorderColor: '#334155', lineColor: '#334155',
          background: '#ffffff', fontFamily: 'Arial, sans-serif'
        },
        flowchart: { htmlLabels: false }
      });
      return (await mermaid.render(id, source)).svg;
    }, { source, id });
    process.stdout.write(svg);
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
