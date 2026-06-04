#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  ROOT,
  DEV_WHITE_PAPER,
  DEV_WHITE_PAPER_PDF,
  DEV_WHITE_PAPER_PDF_META,
  DEV_PROJECT_OVERVIEW_SLIDES,
  DEV_PROJECT_OVERVIEW_SLIDES_DATA,
  DEV_PUBLIC_PROJECT_PAGE,
  BETA_WHITE_PAPER,
  BETA_WHITE_PAPER_PDF,
  BETA_WHITE_PAPER_PDF_META,
  BETA_PROJECT_OVERVIEW_SLIDES,
  BETA_PROJECT_OVERVIEW_SLIDES_DATA,
  BETA_PUBLIC_PROJECT_PAGE,
  PRODUCTION_WHITE_PAPER,
  PRODUCTION_WHITE_PAPER_PDF,
  PRODUCTION_WHITE_PAPER_PDF_META,
  PRODUCTION_PROJECT_OVERVIEW_SLIDES,
  PRODUCTION_PROJECT_OVERVIEW_SLIDES_DATA,
  PRODUCTION_PUBLIC_PROJECT_PAGE
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
    return {
      html: DEV_WHITE_PAPER,
      pdf: DEV_WHITE_PAPER_PDF,
      meta: DEV_WHITE_PAPER_PDF_META,
      slides: DEV_PROJECT_OVERVIEW_SLIDES,
      slidesMeta: DEV_PROJECT_OVERVIEW_SLIDES_DATA,
      publicProjectPage: DEV_PUBLIC_PROJECT_PAGE
    };
  }
  if(lane === 'beta'){
    return {
      html: BETA_WHITE_PAPER,
      pdf: BETA_WHITE_PAPER_PDF,
      meta: BETA_WHITE_PAPER_PDF_META,
      slides: BETA_PROJECT_OVERVIEW_SLIDES,
      slidesMeta: BETA_PROJECT_OVERVIEW_SLIDES_DATA,
      publicProjectPage: BETA_PUBLIC_PROJECT_PAGE
    };
  }
  if(lane === 'production'){
    return {
      html: PRODUCTION_WHITE_PAPER,
      pdf: PRODUCTION_WHITE_PAPER_PDF,
      meta: PRODUCTION_WHITE_PAPER_PDF_META,
      slides: PRODUCTION_PROJECT_OVERVIEW_SLIDES,
      slidesMeta: PRODUCTION_PROJECT_OVERVIEW_SLIDES_DATA,
      publicProjectPage: PRODUCTION_PUBLIC_PROJECT_PAGE
    };
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
  for(const file of [cfg.html, cfg.pdf, cfg.meta, cfg.slides, cfg.slidesMeta, cfg.publicProjectPage]){
    if(!fs.existsSync(file)){
      fail(`White-paper presentation check failed: missing ${file}.`, { lane });
    }
  }
  const html = fs.readFileSync(cfg.html, 'utf8');
  const publicProjectHtml = fs.readFileSync(cfg.publicProjectPage, 'utf8');
  const slidesHtml = fs.readFileSync(cfg.slides, 'utf8');
  const meta = JSON.parse(fs.readFileSync(cfg.meta, 'utf8'));
  const slidesMeta = JSON.parse(fs.readFileSync(cfg.slidesMeta, 'utf8'));
  const source = parseWhitePaperMetadata();
  if(!html.includes('Open current lane PDF')){
    fail('White-paper presentation check failed: hosted white-paper page is missing the PDF entry point.', { lane });
  }
  if(!html.includes('project-overview-slides.html')){
    fail('White-paper presentation check failed: hosted white-paper page is missing the 20-slide overview entry point.', { lane });
  }
  if(!publicProjectHtml.includes('project-overview-slides.html')){
    fail('White-paper presentation check failed: public project page is missing the 20-slide overview entry point.', { lane });
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
  if(slidesMeta.artifactType !== 'project-overview-slides'){
    fail('White-paper presentation check failed: slide metadata artifactType is wrong.', slidesMeta);
  }
  if(slidesMeta.whitePaperVersion !== source.version || slidesMeta.updatedDate !== source.updatedDate){
    fail('White-paper presentation check failed: slide metadata does not match WHITE_PAPER.md version/date.', {
      expected: source,
      actual: {
        whitePaperVersion: slidesMeta.whitePaperVersion,
        updatedDate: slidesMeta.updatedDate
      }
    });
  }
  if(slidesMeta.slideCount !== 20){
    fail('White-paper presentation check failed: expected 20 project overview slides.', slidesMeta);
  }
  if(!slidesHtml.includes('20-slide public overview') || !slidesHtml.includes('Slide Index')){
    fail('White-paper presentation check failed: project overview slide page is missing expected public deck structure.', { lane });
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
    slides: path.relative(ROOT, cfg.slides).replace(/\\/g, '/'),
    slidesMeta: path.relative(ROOT, cfg.slidesMeta).replace(/\\/g, '/'),
    whitePaperVersion: source.version,
    updatedDate: source.updatedDate,
    slideCount: slidesMeta.slideCount,
    pdfSize
  }, null, 2));
}

main();
