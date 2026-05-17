#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright-core');
const {
  ROOT,
  DEV_WHITE_PAPER,
  DEV_WHITE_PAPER_PDF,
  DEV_WHITE_PAPER_PDF_META,
  DEV_BUILD_INFO,
  BETA_WHITE_PAPER,
  BETA_WHITE_PAPER_PDF,
  BETA_WHITE_PAPER_PDF_META,
  BETA_BUILD_INFO,
  PRODUCTION_WHITE_PAPER,
  PRODUCTION_WHITE_PAPER_PDF,
  PRODUCTION_WHITE_PAPER_PDF_META,
  PRODUCTION_BUILD_INFO
} = require('./paths');
const { resolveHarnessBrowser, browserLaunchArgs } = require('../harness/browser-launch');

function parseArgs(argv){
  const args = {};
  for(let i = 0; i < argv.length; i++){
    const token = argv[i];
    if(!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if(!next || next.startsWith('--')){
      args[key] = true;
    }else{
      args[key] = next;
      i++;
    }
  }
  return args;
}

function laneConfig(lane){
  if(lane === 'dev'){
    return {
      lane,
      html: DEV_WHITE_PAPER,
      pdf: DEV_WHITE_PAPER_PDF,
      meta: DEV_WHITE_PAPER_PDF_META,
      buildInfo: DEV_BUILD_INFO
    };
  }
  if(lane === 'beta'){
    return {
      lane,
      html: BETA_WHITE_PAPER,
      pdf: BETA_WHITE_PAPER_PDF,
      meta: BETA_WHITE_PAPER_PDF_META,
      buildInfo: BETA_BUILD_INFO
    };
  }
  if(lane === 'production'){
    return {
      lane,
      html: PRODUCTION_WHITE_PAPER,
      pdf: PRODUCTION_WHITE_PAPER_PDF,
      meta: PRODUCTION_WHITE_PAPER_PDF_META,
      buildInfo: PRODUCTION_BUILD_INFO
    };
  }
  throw new Error('Use --lane dev, --lane beta, or --lane production.');
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function rel(file){
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function parseWhitePaperMetadata(){
  const source = fs.readFileSync(path.join(ROOT, 'WHITE_PAPER.md'), 'utf8');
  const version = (source.match(/^Current draft:\s*`?([^`\n]+)`?/m) || [])[1] || 'unknown';
  const updatedDate = (source.match(/^Date:\s*`?([^`\n]+)`?/m) || [])[1] || 'unknown';
  const status = (source.match(/^Status:\s*(.+)$/m) || [])[1] || 'unknown';
  return { version, updatedDate, status };
}

async function waitForWhitePaperDiagrams(page){
  const mermaidCount = await page.locator('.mermaid').count();
  if(!mermaidCount) return;
  try{
    await page.waitForLoadState('networkidle', { timeout: 15000 });
  }catch{}
  const startedAt = Date.now();
  while(Date.now() - startedAt < 15000){
    const svgCount = await page.locator('.mermaid svg').count();
    if(svgCount >= mermaidCount) return;
    await page.waitForTimeout(250);
  }
}

async function main(){
  if(process.env.CODEX_SANDBOX && process.env.AURORA_ALLOW_CODEX_SANDBOX_BROWSER !== '1'){
    throw new Error(
      'White-paper PDF rendering uses Chromium and must run outside the Codex filesystem sandbox on macOS. '
      + 'In Codex Desktop, rerun the PDF or publish command with escalated sandbox permissions.'
    );
  }
  const args = parseArgs(process.argv.slice(2));
  const cfg = laneConfig(String(args.lane || 'dev').toLowerCase());
  if(!fs.existsSync(cfg.html)){
    throw new Error(`Missing ${cfg.html}. Run the lane build before rendering the white-paper PDF.`);
  }
  if(!fs.existsSync(cfg.buildInfo)){
    throw new Error(`Missing ${cfg.buildInfo}. Run the lane build before rendering the white-paper PDF.`);
  }
  const browserInfo = resolveHarnessBrowser();
  if(!browserInfo.ok){
    throw new Error(browserInfo.message);
  }
  const buildInfo = readJson(cfg.buildInfo);
  const whitePaper = parseWhitePaperMetadata();
  const browser = await chromium.launch({
    executablePath: browserInfo.path,
    headless: true,
    args: browserLaunchArgs()
  });
  try{
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1800 }
    });
    await page.goto(pathToFileURL(cfg.html).href, { waitUntil: 'load' });
    try{
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    }catch{}
    await waitForWhitePaperDiagrams(page);
    await page.pdf({
      path: cfg.pdf,
      printBackground: true,
      preferCSSPageSize: true,
      format: 'Letter',
      margin: {
        top: '0.55in',
        right: '0.55in',
        bottom: '0.55in',
        left: '0.55in'
      }
    });
    const stat = fs.statSync(cfg.pdf);
    const meta = {
      artifactType: 'white-paper-pdf',
      lane: cfg.lane,
      generatedAt: new Date().toISOString(),
      sourceHtml: rel(cfg.html),
      pdfFile: path.basename(cfg.pdf),
      buildLabel: buildInfo.label,
      buildCommit: buildInfo.shortCommit || buildInfo.commit || 'unknown',
      releaseChannel: buildInfo.releaseChannel,
      whitePaperVersion: whitePaper.version,
      updatedDate: whitePaper.updatedDate,
      whitePaperStatus: whitePaper.status,
      byteLength: stat.size
    };
    fs.writeFileSync(cfg.meta, `${JSON.stringify(meta, null, 2)}\n`);
    console.log(JSON.stringify({
      ok: true,
      lane: cfg.lane,
      pdf: rel(cfg.pdf),
      meta: rel(cfg.meta),
      whitePaperVersion: whitePaper.version,
      updatedDate: whitePaper.updatedDate,
      buildLabel: buildInfo.label
    }, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err.message || String(err));
  process.exit(1);
});
