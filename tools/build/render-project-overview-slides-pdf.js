#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright-core');
const {
  ROOT,
  DEV_PROJECT_OVERVIEW_SLIDES,
  DEV_PROJECT_OVERVIEW_SLIDES_DATA,
  DEV_PROJECT_OVERVIEW_SLIDES_PDF,
  DEV_PROJECT_OVERVIEW_SLIDES_PDF_META,
  DEV_BUILD_INFO,
  BETA_PROJECT_OVERVIEW_SLIDES,
  BETA_PROJECT_OVERVIEW_SLIDES_DATA,
  BETA_PROJECT_OVERVIEW_SLIDES_PDF,
  BETA_PROJECT_OVERVIEW_SLIDES_PDF_META,
  BETA_BUILD_INFO,
  PRODUCTION_PROJECT_OVERVIEW_SLIDES,
  PRODUCTION_PROJECT_OVERVIEW_SLIDES_DATA,
  PRODUCTION_PROJECT_OVERVIEW_SLIDES_PDF,
  PRODUCTION_PROJECT_OVERVIEW_SLIDES_PDF_META,
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
      html: DEV_PROJECT_OVERVIEW_SLIDES,
      slidesMeta: DEV_PROJECT_OVERVIEW_SLIDES_DATA,
      pdf: DEV_PROJECT_OVERVIEW_SLIDES_PDF,
      meta: DEV_PROJECT_OVERVIEW_SLIDES_PDF_META,
      buildInfo: DEV_BUILD_INFO
    };
  }
  if(lane === 'beta'){
    return {
      lane,
      html: BETA_PROJECT_OVERVIEW_SLIDES,
      slidesMeta: BETA_PROJECT_OVERVIEW_SLIDES_DATA,
      pdf: BETA_PROJECT_OVERVIEW_SLIDES_PDF,
      meta: BETA_PROJECT_OVERVIEW_SLIDES_PDF_META,
      buildInfo: BETA_BUILD_INFO
    };
  }
  if(lane === 'production'){
    return {
      lane,
      html: PRODUCTION_PROJECT_OVERVIEW_SLIDES,
      slidesMeta: PRODUCTION_PROJECT_OVERVIEW_SLIDES_DATA,
      pdf: PRODUCTION_PROJECT_OVERVIEW_SLIDES_PDF,
      meta: PRODUCTION_PROJECT_OVERVIEW_SLIDES_PDF_META,
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

function countPdfPages(pdfFile){
  const text = fs.readFileSync(pdfFile, 'latin1');
  const matches = text.match(/\/Type\s*\/Page(?!s)\b/g);
  return matches ? matches.length : 0;
}

async function main(){
  if(process.env.CODEX_SANDBOX && process.env.AURORA_ALLOW_CODEX_SANDBOX_BROWSER !== '1'){
    throw new Error(
      'Project-overview slide PDF rendering uses Chromium and must run outside the Codex filesystem sandbox on macOS. '
      + 'In Codex Desktop, rerun the PDF or publish command with escalated sandbox permissions.'
    );
  }
  const args = parseArgs(process.argv.slice(2));
  const cfg = laneConfig(String(args.lane || 'dev').toLowerCase());
  for(const file of [cfg.html, cfg.slidesMeta, cfg.buildInfo]){
    if(!fs.existsSync(file)){
      throw new Error(`Missing ${file}. Run the lane build before rendering the project overview slide PDF.`);
    }
  }
  const browserInfo = resolveHarnessBrowser();
  if(!browserInfo.ok){
    throw new Error(browserInfo.message);
  }
  const buildInfo = readJson(cfg.buildInfo);
  const slidesMeta = readJson(cfg.slidesMeta);
  const browser = await chromium.launch({
    executablePath: browserInfo.path,
    headless: true,
    args: browserLaunchArgs()
  });
  try{
    const page = await browser.newPage({
      viewport: { width: 1536, height: 864 }
    });
    await page.goto(pathToFileURL(cfg.html).href, { waitUntil: 'load' });
    try{
      await page.waitForLoadState('networkidle', { timeout: 15000 });
    }catch{}
    await page.emulateMedia({ media: 'print' });
    await page.pdf({
      path: cfg.pdf,
      printBackground: true,
      preferCSSPageSize: true,
      width: '16in',
      height: '9in',
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0'
      }
    });
    const stat = fs.statSync(cfg.pdf);
    const pageCount = countPdfPages(cfg.pdf);
    const meta = {
      artifactType: 'project-overview-slides-pdf',
      lane: cfg.lane,
      generatedAt: new Date().toISOString(),
      sourceHtml: rel(cfg.html),
      sourceMetadata: rel(cfg.slidesMeta),
      pdfFile: path.basename(cfg.pdf),
      buildLabel: buildInfo.label,
      buildCommit: buildInfo.shortCommit || buildInfo.commit || 'unknown',
      releaseChannel: buildInfo.releaseChannel,
      whitePaperVersion: slidesMeta.whitePaperVersion,
      updatedDate: slidesMeta.updatedDate,
      slideCount: slidesMeta.slideCount,
      pageCount,
      pageSize: '16:9 widescreen',
      byteLength: stat.size
    };
    fs.writeFileSync(cfg.meta, `${JSON.stringify(meta, null, 2)}\n`);
    console.log(JSON.stringify({
      ok: true,
      lane: cfg.lane,
      pdf: rel(cfg.pdf),
      meta: rel(cfg.meta),
      slideCount: slidesMeta.slideCount,
      pageCount,
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
