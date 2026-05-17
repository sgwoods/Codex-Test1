#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  ROOT,
  DEV_WHITE_PAPER,
  DEV_WHITE_PAPER_PDF,
  DEV_WHITE_PAPER_PDF_META,
  BETA_WHITE_PAPER,
  BETA_WHITE_PAPER_PDF,
  BETA_WHITE_PAPER_PDF_META,
  PRODUCTION_WHITE_PAPER,
  PRODUCTION_WHITE_PAPER_PDF,
  PRODUCTION_WHITE_PAPER_PDF_META
} = require('./paths');

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
    return { html: DEV_WHITE_PAPER, pdf: DEV_WHITE_PAPER_PDF, meta: DEV_WHITE_PAPER_PDF_META };
  }
  if(lane === 'beta'){
    return { html: BETA_WHITE_PAPER, pdf: BETA_WHITE_PAPER_PDF, meta: BETA_WHITE_PAPER_PDF_META };
  }
  if(lane === 'production'){
    return { html: PRODUCTION_WHITE_PAPER, pdf: PRODUCTION_WHITE_PAPER_PDF, meta: PRODUCTION_WHITE_PAPER_PDF_META };
  }
  throw new Error('Use --lane dev, --lane beta, or --lane production.');
}

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function parseWhitePaperMetadata(){
  const source = fs.readFileSync(path.join(ROOT, 'WHITE_PAPER.md'), 'utf8');
  return {
    version: (source.match(/^Current draft:\s*`?([^`\n]+)`?/m) || [])[1] || 'unknown',
    updatedDate: (source.match(/^Date:\s*`?([^`\n]+)`?/m) || [])[1] || 'unknown'
  };
}

function main(){
  const args = parseArgs(process.argv.slice(2));
  const lane = String(args.lane || 'dev').toLowerCase();
  const cfg = laneConfig(lane);
  for(const file of [cfg.html, cfg.pdf, cfg.meta]){
    if(!fs.existsSync(file)){
      fail(`White-paper presentation check failed: missing ${file}.`, { lane });
    }
  }
  const html = fs.readFileSync(cfg.html, 'utf8');
  const meta = JSON.parse(fs.readFileSync(cfg.meta, 'utf8'));
  const source = parseWhitePaperMetadata();
  if(!html.includes('Open current lane PDF')){
    fail('White-paper presentation check failed: hosted white-paper page is missing the PDF entry point.', { lane });
  }
  if(!html.includes('Related Work')){
    fail('White-paper presentation check failed: hosted white-paper page is missing the Related Work section.', { lane });
  }
  if(!html.includes('Reviewer Checklist')){
    fail('White-paper presentation check failed: hosted white-paper page is missing the Reviewer Checklist section.', { lane });
  }
  if(html.includes('&gt; TODO') || html.includes('> TODO illustration:')){
    fail('White-paper presentation check failed: raw TODO blockquote markers leaked into the rendered HTML.', { lane });
  }
  if(!html.includes('<blockquote>')){
    fail('White-paper presentation check failed: expected blockquote callouts are missing from the rendered HTML.', { lane });
  }
  if(meta.artifactType !== 'white-paper-pdf'){
    fail('White-paper presentation check failed: PDF metadata artifactType is wrong.', meta);
  }
  if(meta.whitePaperVersion !== source.version || meta.updatedDate !== source.updatedDate){
    fail('White-paper presentation check failed: PDF metadata does not match WHITE_PAPER.md version/date.', {
      expected: source,
      actual: {
        whitePaperVersion: meta.whitePaperVersion,
        updatedDate: meta.updatedDate
      }
    });
  }
  if(meta.pdfFile !== path.basename(cfg.pdf)){
    fail('White-paper presentation check failed: PDF metadata points at the wrong PDF filename.', meta);
  }
  const pdfSize = fs.statSync(cfg.pdf).size;
  if(pdfSize < 10_000){
    fail('White-paper presentation check failed: generated PDF is unexpectedly small.', {
      lane,
      pdfSize
    });
  }
  console.log(JSON.stringify({
    ok: true,
    lane,
    html: path.relative(ROOT, cfg.html).replace(/\\/g, '/'),
    pdf: path.relative(ROOT, cfg.pdf).replace(/\\/g, '/'),
    meta: path.relative(ROOT, cfg.meta).replace(/\\/g, '/'),
    whitePaperVersion: source.version,
    updatedDate: source.updatedDate,
    pdfSize
  }, null, 2));
}

main();
