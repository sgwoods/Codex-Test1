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
  DEV_PROJECT_OVERVIEW_SLIDES,
  DEV_PROJECT_OVERVIEW_SLIDES_DATA,
  DEV_PROJECT_OVERVIEW_SLIDES_PDF,
  DEV_PROJECT_OVERVIEW_SLIDES_PDF_META,
  DEV_PUBLIC_PROJECT_PAGE,
  BETA_WHITE_PAPER,
  BETA_WHITE_PAPER_PDF,
  BETA_WHITE_PAPER_PDF_META,
  BETA_PROJECT_OVERVIEW_SLIDES,
  BETA_PROJECT_OVERVIEW_SLIDES_DATA,
  BETA_PROJECT_OVERVIEW_SLIDES_PDF,
  BETA_PROJECT_OVERVIEW_SLIDES_PDF_META,
  BETA_PUBLIC_PROJECT_PAGE,
  PRODUCTION_WHITE_PAPER,
  PRODUCTION_WHITE_PAPER_PDF,
  PRODUCTION_WHITE_PAPER_PDF_META,
  PRODUCTION_PROJECT_OVERVIEW_SLIDES,
  PRODUCTION_PROJECT_OVERVIEW_SLIDES_DATA,
  PRODUCTION_PROJECT_OVERVIEW_SLIDES_PDF,
  PRODUCTION_PROJECT_OVERVIEW_SLIDES_PDF_META,
  PRODUCTION_PUBLIC_PROJECT_PAGE
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
      html: DEV_WHITE_PAPER,
      pdf: DEV_WHITE_PAPER_PDF,
      meta: DEV_WHITE_PAPER_PDF_META,
      slides: DEV_PROJECT_OVERVIEW_SLIDES,
      slidesMeta: DEV_PROJECT_OVERVIEW_SLIDES_DATA,
      slidesPdf: DEV_PROJECT_OVERVIEW_SLIDES_PDF,
      slidesPdfMeta: DEV_PROJECT_OVERVIEW_SLIDES_PDF_META,
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
      slidesPdf: BETA_PROJECT_OVERVIEW_SLIDES_PDF,
      slidesPdfMeta: BETA_PROJECT_OVERVIEW_SLIDES_PDF_META,
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
      slidesPdf: PRODUCTION_PROJECT_OVERVIEW_SLIDES_PDF,
      slidesPdfMeta: PRODUCTION_PROJECT_OVERVIEW_SLIDES_PDF_META,
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

function rel(file){
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function parseWhitePaperMetadata(){
  const source = fs.readFileSync(path.join(ROOT, 'WHITE_PAPER.md'), 'utf8');
  return {
    version: (source.match(/^Current draft:\s*`?([^`\n]+)`?/m) || [])[1] || 'unknown',
    updatedDate: (source.match(/^Date:\s*`?([^`\n]+)`?/m) || [])[1] || 'unknown'
  };
}

function countPdfPages(pdfFile){
  const text = fs.readFileSync(pdfFile, 'latin1');
  const matches = text.match(/\/Type\s*\/Page(?!s)\b/g);
  return matches ? matches.length : 0;
}

async function waitForRenderedPage(page){
  try{
    await page.waitForLoadState('networkidle', { timeout: 15000 });
  }catch{}
  try{
    await page.evaluate(() => document.fonts && document.fonts.ready);
  }catch{}
  const mermaidCount = await page.locator('.mermaid').count();
  if(mermaidCount){
    const startedAt = Date.now();
    while(Date.now() - startedAt < 15000){
      const svgCount = await page.locator('.mermaid svg').count();
      if(svgCount >= mermaidCount) break;
      await page.waitForTimeout(250);
    }
  }
}

async function auditWhitePaperLayout(page, mode){
  return page.evaluate((modeName) => {
    const issues = [];
    const round = (value) => Math.round(value * 10) / 10;
    const textOf = (element) => (
      element.getAttribute('alt')
      || element.getAttribute('aria-label')
      || element.textContent
      || element.tagName
    ).trim().replace(/\s+/g, ' ').slice(0, 110);
    const isVisible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && rect.width > 0
        && rect.height > 0;
    };
    const viewportWidth = document.documentElement.clientWidth;
    const documentWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    if(documentWidth > viewportWidth + 2){
      issues.push({
        surface: 'white-paper',
        mode: modeName,
        type: 'document-horizontal-overflow',
        documentWidth: round(documentWidth),
        viewportWidth: round(viewportWidth)
      });
    }
    const images = Array.from(document.querySelectorAll('.markdown img'));
    for(const img of images){
      const rect = img.getBoundingClientRect();
      const parent = img.closest('.markdown') || img.parentElement || document.body;
      const parentRect = parent.getBoundingClientRect();
      if(!img.complete || img.naturalWidth <= 0 || img.naturalHeight <= 0){
        issues.push({
          surface: 'white-paper',
          mode: modeName,
          type: 'image-not-loaded',
          selector: 'img',
          text: textOf(img),
          src: img.getAttribute('src') || ''
        });
      }
      if(rect.width > parentRect.width + 2 || rect.left < parentRect.left - 2 || rect.right > parentRect.right + 2){
        issues.push({
          surface: 'white-paper',
          mode: modeName,
          type: 'image-outside-content-column',
          text: textOf(img),
          width: round(rect.width),
          parentWidth: round(parentRect.width),
          leftDelta: round(rect.left - parentRect.left),
          rightDelta: round(rect.right - parentRect.right)
        });
      }
    }
    const blocks = Array.from(document.querySelectorAll([
      '.hero',
      '.section',
      '.metaCard',
      '.whitePaperMetaCard',
      '.markdown p',
      '.markdown li',
      '.markdown blockquote',
      '.markdown pre',
      '.markdown table',
      '.markdown img',
      '.markdown .mermaid',
      '.markdown .mermaid svg',
      '.tableWrap',
      '.dataTable'
    ].join(',')));
    for(const element of blocks){
      if(!isVisible(element)) continue;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      if(rect.left < -2 || rect.right > viewportWidth + 2){
        issues.push({
          surface: 'white-paper',
          mode: modeName,
          type: 'element-outside-viewport',
          selector: element.tagName.toLowerCase() + (element.className ? `.${String(element.className).trim().replace(/\s+/g, '.')}` : ''),
          text: textOf(element),
          left: round(rect.left),
          right: round(rect.right),
          viewportWidth: round(viewportWidth)
        });
      }
      const allowsHorizontalScroll = ['auto', 'scroll'].includes(style.overflowX);
      if(element.scrollWidth > element.clientWidth + 2 && !allowsHorizontalScroll){
        issues.push({
          surface: 'white-paper',
          mode: modeName,
          type: 'text-or-table-horizontal-overflow',
          selector: element.tagName.toLowerCase() + (element.className ? `.${String(element.className).trim().replace(/\s+/g, '.')}` : ''),
          text: textOf(element),
          scrollWidth: round(element.scrollWidth),
          clientWidth: round(element.clientWidth)
        });
      }
    }
    return {
      mode: modeName,
      imageCount: images.length,
      issues
    };
  }, mode);
}

async function auditSlidesLayout(page, mode, expectedSlideCount){
  return page.evaluate(({ modeName, expected }) => {
    const issues = [];
    const round = (value) => Math.round(value * 10) / 10;
    const labelFor = (element) => (
      element.getAttribute('aria-label')
      || element.getAttribute('alt')
      || element.textContent
      || element.tagName
    ).trim().replace(/\s+/g, ' ').slice(0, 120);
    const selectorFor = (element) => element.tagName.toLowerCase()
      + (element.className ? `.${String(element.className).trim().replace(/\s+/g, '.')}` : '');
    const isVisible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && rect.width > 0
        && rect.height > 0;
    };
    const rectFor = (element) => {
      const rect = element.getBoundingClientRect();
      return {
        element,
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height
      };
    };
    const overlapAmount = (a, b) => ({
      x: Math.min(a.right, b.right) - Math.max(a.left, b.left),
      y: Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
    });
    const auditPeerGroup = (slideNumber, title, groupName, elements, minGap = 4) => {
      const peers = elements
        .filter((element) => element && isVisible(element))
        .map(rectFor);
      for(let i = 0; i < peers.length; i++){
        for(let j = i + 1; j < peers.length; j++){
          const a = peers[i];
          const b = peers[j];
          if(a.element.contains(b.element) || b.element.contains(a.element)) continue;
          const overlap = overlapAmount(a, b);
          if(overlap.x > 1 && overlap.y > 1){
            issues.push({
              surface: 'slides',
              mode: modeName,
              type: 'slide-peer-overlap',
              slide: slideNumber,
              title,
              group: groupName,
              first: {
                selector: selectorFor(a.element),
                text: labelFor(a.element),
                rect: {
                  left: round(a.left),
                  top: round(a.top),
                  right: round(a.right),
                  bottom: round(a.bottom)
                }
              },
              second: {
                selector: selectorFor(b.element),
                text: labelFor(b.element),
                rect: {
                  left: round(b.left),
                  top: round(b.top),
                  right: round(b.right),
                  bottom: round(b.bottom)
                }
              },
              overlap: {
                x: round(overlap.x),
                y: round(overlap.y)
              }
            });
          }
          const verticalGap = b.top >= a.bottom
            ? b.top - a.bottom
            : a.top >= b.bottom
              ? a.top - b.bottom
              : null;
          const horizontalOverlap = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          if(verticalGap !== null && verticalGap < minGap && horizontalOverlap > 8){
            issues.push({
              surface: 'slides',
              mode: modeName,
              type: 'slide-peer-too-tight',
              axis: 'vertical',
              slide: slideNumber,
              title,
              group: groupName,
              first: selectorFor(a.element),
              second: selectorFor(b.element),
              gap: round(verticalGap),
              expectedGap: minGap
            });
          }
          const horizontalGap = b.left >= a.right
            ? b.left - a.right
            : a.left >= b.right
              ? a.left - b.right
              : null;
          const verticalOverlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if(horizontalGap !== null && horizontalGap < minGap && verticalOverlap > 8){
            issues.push({
              surface: 'slides',
              mode: modeName,
              type: 'slide-peer-too-tight',
              axis: 'horizontal',
              slide: slideNumber,
              title,
              group: groupName,
              first: selectorFor(a.element),
              second: selectorFor(b.element),
              gap: round(horizontalGap),
              expectedGap: minGap
            });
          }
        }
      }
    };
    const slides = Array.from(document.querySelectorAll('.slide'));
    if(slides.length !== expected){
      issues.push({
        surface: 'slides',
        mode: modeName,
        type: 'wrong-slide-count',
        expected,
        actual: slides.length
      });
    }
    const visualCount = document.querySelectorAll([
      '.visualFlow',
      '.challengeGrid',
      '.timelineVisual',
      '.portfolioVisual',
      '.pipelineVisual',
      '.scoreVisual',
      '.economicsVisual',
      '.releaseLaneVisual',
      '.evidenceLoopVisual',
      '.chainVisual',
      '.stackVisual',
      '.packBoundaryVisual',
      '.sourceCorpusVisual',
      '.movementGrammarVisual',
      '.audioRoiVisual',
      '.spriteModelVisual',
      '.releaseTrackVisual',
      '.launchRiskVisual',
      '.roadmapVisual',
      '.factoryLoopVisual',
      '.slideImageVisual'
    ].join(',')).length;
    const slideImages = Array.from(document.querySelectorAll('.slide img'));
    const speakerNotes = Array.from(document.querySelectorAll('.speakerNotes'));
    const visibleSpeakerNotes = speakerNotes.filter(isVisible);
    if(modeName === 'screen' && speakerNotes.length !== expected){
      issues.push({
        surface: 'slides',
        mode: modeName,
        type: 'wrong-speaker-notes-count',
        expected,
        actual: speakerNotes.length
      });
    }
    if(modeName === 'screen'){
      for(const [noteIndex, note] of speakerNotes.entries()){
        const noteItems = Array.from(note.querySelectorAll('li')).filter((item) => item.textContent.trim().length > 20);
        if(noteItems.length < 2){
          issues.push({
            surface: 'slides',
            mode: modeName,
            type: 'speaker-notes-too-thin',
            slide: noteIndex + 1,
            text: labelFor(note),
            actual: noteItems.length,
            expectedAtLeast: 2
          });
        }
      }
    }
    if(modeName === 'print-pdf' && visibleSpeakerNotes.length){
      issues.push({
        surface: 'slides',
        mode: modeName,
        type: 'speaker-notes-visible-in-slide-pdf',
        expected: 0,
        actual: visibleSpeakerNotes.length
      });
    }
    if(modeName === 'screen'){
      const toc = document.querySelector('.toc');
      if(toc && isVisible(toc)){
        const tocRect = rectFor(toc);
        const deckPeers = [
          ...slides,
          ...speakerNotes,
          ...Array.from(document.querySelectorAll('.sourceList'))
        ].filter(isVisible);
        for(const peer of deckPeers){
          const peerRect = rectFor(peer);
          const overlap = overlapAmount(tocRect, peerRect);
          if(overlap.x > 1 && overlap.y > 1){
            issues.push({
              surface: 'slides',
              mode: modeName,
              type: 'deck-index-overlap',
              peer: selectorFor(peer),
              text: labelFor(peer),
              overlap: {
                x: round(overlap.x),
                y: round(overlap.y)
              },
              toc: {
                left: round(tocRect.left),
                top: round(tocRect.top),
                right: round(tocRect.right),
                bottom: round(tocRect.bottom)
              },
              peerRect: {
                left: round(peerRect.left),
                top: round(peerRect.top),
                right: round(peerRect.right),
                bottom: round(peerRect.bottom)
              }
            });
          }
        }
      }
    }
    if(slideImages.length < 8){
      issues.push({
        surface: 'slides',
        mode: modeName,
        type: 'insufficient-slide-images',
        expectedAtLeast: 8,
        actual: slideImages.length
      });
    }
    for(const img of slideImages){
      const slide = img.closest('.slide');
      const slideNumber = slides.indexOf(slide) + 1;
      if(!img.complete || img.naturalWidth <= 0 || img.naturalHeight <= 0){
        issues.push({
          surface: 'slides',
          mode: modeName,
          type: 'slide-image-not-loaded',
          slide: slideNumber || undefined,
          title: slide?.querySelector('h2')?.textContent?.trim() || '',
          text: labelFor(img),
          src: img.getAttribute('src') || ''
        });
      }
    }
    for(const [index, slide] of slides.entries()){
      const slideNumber = index + 1;
      const slideRect = slide.getBoundingClientRect();
      const title = slide.querySelector('h2')?.textContent?.trim() || `Slide ${slideNumber}`;
      const titleElement = slide.querySelector('h2');
      if(titleElement && isVisible(titleElement)){
        const titleRect = titleElement.getBoundingClientRect();
        const titleMaxHeight = modeName === 'print-pdf' ? 88 : 98;
        if(titleRect.height > titleMaxHeight){
          issues.push({
            surface: 'slides',
            mode: modeName,
            type: 'slide-title-too-tall',
            slide: slideNumber,
            title,
            height: round(titleRect.height),
            maxHeight: titleMaxHeight
          });
        }
      }
      const claimElement = slide.querySelector('.claim');
      if(claimElement && isVisible(claimElement)){
        const claimRect = claimElement.getBoundingClientRect();
        const claimMaxHeight = modeName === 'print-pdf' ? 68 : 82;
        if(claimRect.height > claimMaxHeight){
          issues.push({
            surface: 'slides',
            mode: modeName,
            type: 'slide-claim-too-tall',
            slide: slideNumber,
            title,
            height: round(claimRect.height),
            maxHeight: claimMaxHeight
          });
        }
      }
      if(slide.scrollWidth > slide.clientWidth + 2 || slide.scrollHeight > slide.clientHeight + 2){
        issues.push({
          surface: 'slides',
          mode: modeName,
          type: 'slide-frame-overflow',
          slide: slideNumber,
          title,
          scrollWidth: round(slide.scrollWidth),
          clientWidth: round(slide.clientWidth),
          scrollHeight: round(slide.scrollHeight),
          clientHeight: round(slide.clientHeight)
        });
      }
      const checks = Array.from(slide.querySelectorAll([
        '.slideInner',
        '.slideHeader',
        'h2',
        '.claim',
        '.proofGrid',
        '.proofCard',
        '.proofCard strong',
        '.visualFlow',
        '.flowNode',
        '.challengeGrid',
        '.bigMetric',
        '.timelineVisual',
        '.portfolioVisual',
        '.pipelineVisual',
        '.scoreVisual',
        '.economicsVisual',
        '.releaseLaneVisual',
        '.evidenceLoopVisual',
        '.visualTile',
        '.visualTile strong',
        '.visualTile span',
        '.nativeVisual',
        '.chainVisual',
        '.chainStep',
        '.chainStep strong',
        '.chainStep span',
        '.stackVisual',
        '.stackLayer',
        '.stackLayer strong',
        '.stackCallout',
        '.stackCallout strong',
        '.stackCallout span',
        '.packBoundaryVisual',
        '.boundaryCard',
        '.boundaryCard strong',
        '.boundaryCard span',
        '.portfolioCard',
        '.portfolioCard strong',
        '.portfolioCard span',
        '.sourceCorpusVisual',
        '.sourceClusterGrid',
        '.sourceCluster',
        '.sourceCluster strong',
        '.sourceCluster span',
        '.sourceOutcome',
        '.sourceOutcome strong',
        '.sourceOutcome span',
        '.movementGrammarVisual',
        '.grammarNode',
        '.grammarNode strong',
        '.grammarNode span',
        '.grammarGuard',
        '.audioRoiVisual',
        '.roiPanel',
        '.roiPanel strong',
        '.roiPanel span',
        '.roiNumber',
        '.roiDecision',
        '.spriteModelVisual',
        '.spriteConceptGrid',
        '.spriteConcept',
        '.spriteConcept strong',
        '.spriteConcept span',
        '.spriteOutcome',
        '.spriteOutcome strong',
        '.spriteOutcome span',
        '.releaseTrackVisual',
        '.releaseStage',
        '.releaseStage strong',
        '.releaseStage span',
        '.roadmapVisual',
        '.roadmapPhases',
        '.roadmapPhase',
        '.roadmapPhase strong',
        '.roadmapPhase span',
        '.decisionBand',
        '.factoryLoopVisual',
        '.factoryNode',
        '.factoryNode strong',
        '.factoryNode span',
        '.factoryOutcome',
        '.factoryOutcome strong',
        '.factoryOutcome span',
        '.slideImageVisual',
        '.slideImageGrid',
        '.slideImageFrame',
        '.slideImageFrame img',
        '.slideImageFrame figcaption',
        '.imageProofRail',
        '.imageProofItem',
        '.slideFooter'
      ].join(',')));
      for(const element of checks){
        if(!isVisible(element)) continue;
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        if(rect.left < slideRect.left - 2 || rect.right > slideRect.right + 2 || rect.top < slideRect.top - 2 || rect.bottom > slideRect.bottom + 2){
          issues.push({
            surface: 'slides',
            mode: modeName,
            type: 'element-outside-slide-frame',
            slide: slideNumber,
            title,
            selector: selectorFor(element),
            text: labelFor(element),
            rect: {
              left: round(rect.left - slideRect.left),
              top: round(rect.top - slideRect.top),
              right: round(rect.right - slideRect.left),
              bottom: round(rect.bottom - slideRect.top)
            },
            slideFrame: {
              width: round(slideRect.width),
              height: round(slideRect.height)
            }
          });
        }
        const allowsHorizontalScroll = ['auto', 'scroll'].includes(style.overflowX);
        if(element.scrollWidth > element.clientWidth + 2 && !allowsHorizontalScroll){
          issues.push({
            surface: 'slides',
            mode: modeName,
            type: 'slide-text-horizontal-overflow',
            slide: slideNumber,
            title,
            selector: selectorFor(element),
            text: labelFor(element),
            scrollWidth: round(element.scrollWidth),
            clientWidth: round(element.clientWidth)
          });
        }
        const allowsVerticalScroll = ['auto', 'scroll'].includes(style.overflowY);
        if(element.scrollHeight > element.clientHeight + 2 && !allowsVerticalScroll && style.overflowY !== 'visible'){
          issues.push({
            surface: 'slides',
            mode: modeName,
            type: 'slide-text-vertical-overflow',
            slide: slideNumber,
            title,
            selector: selectorFor(element),
            text: labelFor(element),
            scrollHeight: round(element.scrollHeight),
            clientHeight: round(element.clientHeight)
          });
        }
        if(element.matches([
          'h2',
          '.claim',
          '.proofCard strong',
          '.imageProofItem',
          '.visualTile strong',
          '.visualTile span',
          '.flowNode strong',
          '.flowNode span',
          '.bigMetric span',
          '.chainStep strong',
          '.chainStep span',
          '.stackLayer strong',
          '.stackCallout strong',
          '.stackCallout span',
          '.boundaryCard strong',
          '.boundaryCard span',
          '.portfolioCard strong',
          '.portfolioCard span',
          '.sourceCluster strong',
          '.sourceCluster span',
          '.sourceOutcome strong',
          '.sourceOutcome span',
          '.grammarNode strong',
          '.grammarNode span',
          '.grammarGuard',
          '.roiPanel strong',
          '.roiPanel span',
          '.roiDecision span',
          '.spriteConcept strong',
          '.spriteConcept span',
          '.spriteOutcome strong',
          '.spriteOutcome span',
          '.releaseStage strong',
          '.releaseStage span',
          '.roadmapPhase strong',
          '.roadmapPhase span',
          '.decisionBand span',
          '.factoryNode strong',
          '.factoryNode span',
          '.factoryOutcome strong',
          '.factoryOutcome span'
        ].join(','))){
          const text = element.textContent.trim().replace(/\s+/g, ' ');
          const fontSize = parseFloat(style.fontSize) || 0;
          const minFontSize = modeName === 'print-pdf' ? 9.2 : 10.2;
          if(text.length > 12 && fontSize < minFontSize){
            issues.push({
              surface: 'slides',
              mode: modeName,
              type: 'slide-text-too-small',
              slide: slideNumber,
              title,
              selector: selectorFor(element),
              text: text.slice(0, 110),
              fontSize: round(fontSize),
              minFontSize
            });
          }
          const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.2 || 1;
          const lineCount = rect.height / lineHeight;
          const maxLines = element.matches('h2')
            ? 2.45
            : element.matches('.claim')
              ? 2.65
              : element.matches([
                '.stackCallout span',
                '.sourceOutcome span',
                '.spriteOutcome span',
                '.factoryOutcome span',
                '.grammarGuard',
                '.decisionBand span'
              ].join(','))
                ? 4.35
                : element.matches('strong')
                  ? 2.55
                  : 3.6;
          if(text.length > 18 && lineCount > maxLines){
            issues.push({
              surface: 'slides',
              mode: modeName,
              type: 'slide-text-too-many-lines',
              slide: slideNumber,
              title,
              selector: selectorFor(element),
              text: text.slice(0, 110),
              lineCount: round(lineCount),
              maxLines
            });
          }
        }
        if(element.matches([
          '.proofGrid',
          '.visualFlow',
          '.challengeGrid',
          '.challengeRead',
          '.timelineVisual',
          '.portfolioVisual',
          '.pipelineVisual',
          '.scoreVisual',
          '.economicsVisual',
          '.releaseLaneVisual',
          '.evidenceLoopVisual',
          '.chainVisual',
          '.stackVisual',
          '.packBoundaryVisual',
          '.sourceCorpusVisual',
          '.sourceClusterGrid',
          '.movementGrammarVisual',
          '.audioRoiVisual',
          '.spriteModelVisual',
          '.spriteConceptGrid',
          '.releaseTrackVisual',
          '.roadmapVisual',
          '.roadmapPhases',
          '.factoryLoopVisual',
          '.slideImageVisual',
          '.slideImageGrid',
          '.slideImageFrame',
          '.imageProofRail'
        ].join(',')) && element.scrollHeight > element.clientHeight + 2){
          issues.push({
            surface: 'slides',
            mode: modeName,
            type: 'slide-content-crowding',
            slide: slideNumber,
            title,
            selector: selectorFor(element),
            text: labelFor(element),
            scrollHeight: round(element.scrollHeight),
            clientHeight: round(element.clientHeight)
          });
        }
      }
      const slideInner = slide.querySelector('.slideInner');
      if(slideInner){
        auditPeerGroup(slideNumber, title, 'slide-inner-sections', Array.from(slideInner.children), 6);
      }
      for(const parent of slide.querySelectorAll([
        '.proofGrid',
        '.visualFlow',
        '.challengeGrid',
        '.challengeRead',
        '.timelineVisual',
        '.portfolioVisual',
        '.pipelineVisual',
        '.scoreVisual',
        '.economicsVisual',
        '.releaseLaneVisual',
        '.evidenceLoopVisual',
        '.chainVisual',
        '.stackVisual',
        '.stackLanes',
        '.packBoundaryVisual',
        '.sourceCorpusVisual',
        '.sourceClusterGrid',
        '.movementGrammarVisual',
        '.audioRoiVisual',
        '.spriteModelVisual',
        '.spriteConceptGrid',
        '.releaseTrackVisual',
        '.roadmapVisual',
        '.roadmapPhases',
        '.factoryLoopVisual',
        '.slideImageVisual',
        '.slideImageGrid',
        '.imageProofRail'
      ].join(','))){
        auditPeerGroup(slideNumber, title, `peer-group:${selectorFor(parent)}`, Array.from(parent.children), 4);
      }
    }
    return {
      mode: modeName,
      slideCount: slides.length,
      visualCount,
      slideImageCount: slideImages.length,
      speakerNotesCount: speakerNotes.length,
      visibleSpeakerNotesCount: visibleSpeakerNotes.length,
      issues
    };
  }, { modeName: mode, expected: expectedSlideCount });
}

async function runRenderedLayoutChecks(cfg, slidesMeta){
  const browserInfo = resolveHarnessBrowser();
  if(!browserInfo.ok){
    fail('White-paper presentation check failed: Chromium is unavailable for layout QA.', browserInfo);
  }
  const browser = await chromium.launch({
    executablePath: browserInfo.path,
    headless: true,
    args: browserLaunchArgs()
  });
  try{
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    await page.emulateMedia({ media: 'screen' });
    await page.goto(pathToFileURL(cfg.html).href, { waitUntil: 'load' });
    await waitForRenderedPage(page);
    const whitePaperScreen = await auditWhitePaperLayout(page, 'screen');

    await page.setViewportSize({ width: 816, height: 1056 });
    await page.emulateMedia({ media: 'print' });
    await waitForRenderedPage(page);
    const whitePaperPrint = await auditWhitePaperLayout(page, 'print');

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ media: 'screen' });
    await page.goto(pathToFileURL(cfg.slides).href, { waitUntil: 'load' });
    await waitForRenderedPage(page);
    const slidesScreen = await auditSlidesLayout(page, 'screen', slidesMeta.slideCount);

    await page.setViewportSize({ width: 1536, height: 864 });
    await page.emulateMedia({ media: 'print' });
    await waitForRenderedPage(page);
    const slidesPrint = await auditSlidesLayout(page, 'print-pdf', slidesMeta.slideCount);

    const audits = [whitePaperScreen, whitePaperPrint, slidesScreen, slidesPrint];
    const issues = audits.flatMap((audit) => audit.issues || []);
    if(issues.length){
      fail('White-paper presentation check failed: rendered layout has fit issues.', {
        issueCount: issues.length,
        firstIssues: issues.slice(0, 24)
      });
    }
    return {
      whitePaperImages: whitePaperScreen.imageCount,
      slideVisuals: slidesScreen.visualCount,
      slideImages: slidesScreen.slideImageCount,
      speakerNotes: slidesScreen.speakerNotesCount,
      layoutModes: audits.map((audit) => audit.mode)
    };
  } finally {
    await browser.close();
  }
}

async function main(){
  if(process.env.CODEX_SANDBOX && process.env.AURORA_ALLOW_CODEX_SANDBOX_BROWSER !== '1'){
    throw new Error(
      'White-paper presentation checks use Chromium for rendered layout QA and must run outside the Codex filesystem sandbox on macOS. '
      + 'In Codex Desktop, rerun the check, review, or publish command with escalated sandbox permissions.'
    );
  }
  const args = parseArgs(process.argv.slice(2));
  const lane = String(args.lane || 'dev').toLowerCase();
  const cfg = laneConfig(lane);
  for(const file of [
    cfg.html,
    cfg.pdf,
    cfg.meta,
    cfg.slides,
    cfg.slidesMeta,
    cfg.slidesPdf,
    cfg.slidesPdfMeta,
    cfg.publicProjectPage
  ]){
    if(!fs.existsSync(file)){
      fail(`White-paper presentation check failed: missing ${file}.`, { lane });
    }
  }
  const html = fs.readFileSync(cfg.html, 'utf8');
  const publicProjectHtml = fs.readFileSync(cfg.publicProjectPage, 'utf8');
  const slidesHtml = fs.readFileSync(cfg.slides, 'utf8');
  const meta = readJson(cfg.meta);
  const slidesMeta = readJson(cfg.slidesMeta);
  const slidesPdfMeta = readJson(cfg.slidesPdfMeta);
  const source = parseWhitePaperMetadata();
  if(!html.includes('Open current lane PDF')){
    fail('White-paper presentation check failed: hosted white-paper page is missing the PDF entry point.', { lane });
  }
  if(!html.includes('project-overview-slides.html')){
    fail('White-paper presentation check failed: hosted white-paper page is missing the 21-slide overview entry point.', { lane });
  }
  if(!html.includes('project-overview-slides.pdf')){
    fail('White-paper presentation check failed: hosted white-paper page is missing the slide PDF entry point.', { lane });
  }
  if(!publicProjectHtml.includes('project-overview-slides.html')){
    fail('White-paper presentation check failed: public project page is missing the 21-slide overview entry point.', { lane });
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
  if(slidesMeta.slideCount !== 21){
    fail('White-paper presentation check failed: expected 21 project overview slides.', slidesMeta);
  }
  if(slidesMeta.speakerNotesCount !== slidesMeta.slideCount){
    fail('White-paper presentation check failed: every project overview slide needs speaker notes.', {
      expected: slidesMeta.slideCount,
      actual: slidesMeta.speakerNotesCount
    });
  }
  if(slidesMeta.speakerNotesMode !== 'inline-html-hidden-from-slide-pdf'){
    fail('White-paper presentation check failed: speaker notes metadata does not describe the expected rendering mode.', slidesMeta);
  }
  if(!slidesHtml.includes('21-slide public overview') || !slidesHtml.includes('Slide Index')){
    fail('White-paper presentation check failed: project overview slide page is missing expected public deck structure.', { lane });
  }
  if(!slidesHtml.includes('speakerNotes') || !slidesHtml.includes('Speaker notes')){
    fail('White-paper presentation check failed: project overview slide page is missing speaker notes.', { lane });
  }
  if(!slidesHtml.includes('project-overview-slides.pdf')){
    fail('White-paper presentation check failed: project overview slide page is missing the slide PDF entry point.', { lane });
  }
  if(slidesPdfMeta.artifactType !== 'project-overview-slides-pdf'){
    fail('White-paper presentation check failed: slide PDF metadata artifactType is wrong.', slidesPdfMeta);
  }
  if(slidesPdfMeta.whitePaperVersion !== source.version || slidesPdfMeta.updatedDate !== source.updatedDate){
    fail('White-paper presentation check failed: slide PDF metadata does not match WHITE_PAPER.md version/date.', {
      expected: source,
      actual: {
        whitePaperVersion: slidesPdfMeta.whitePaperVersion,
        updatedDate: slidesPdfMeta.updatedDate
      }
    });
  }
  if(slidesPdfMeta.slideCount !== slidesMeta.slideCount){
    fail('White-paper presentation check failed: slide PDF metadata has the wrong slide count.', {
      expected: slidesMeta.slideCount,
      actual: slidesPdfMeta.slideCount
    });
  }
  if(slidesPdfMeta.pdfFile !== path.basename(cfg.slidesPdf)){
    fail('White-paper presentation check failed: slide PDF metadata points at the wrong PDF filename.', slidesPdfMeta);
  }
  const pdfSize = fs.statSync(cfg.pdf).size;
  if(pdfSize < 10_000){
    fail('White-paper presentation check failed: generated white-paper PDF is unexpectedly small.', {
      lane,
      pdfSize
    });
  }
  const slidesPdfSize = fs.statSync(cfg.slidesPdf).size;
  if(slidesPdfSize < 10_000){
    fail('White-paper presentation check failed: generated slide PDF is unexpectedly small.', {
      lane,
      slidesPdfSize
    });
  }
  const slidesPdfPages = countPdfPages(cfg.slidesPdf);
  if(slidesPdfPages && slidesPdfPages !== slidesMeta.slideCount){
    fail('White-paper presentation check failed: generated slide PDF page count does not match slide count.', {
      expected: slidesMeta.slideCount,
      actual: slidesPdfPages
    });
  }
  const layout = await runRenderedLayoutChecks(cfg, slidesMeta);
  console.log(JSON.stringify({
    ok: true,
    lane,
    html: rel(cfg.html),
    pdf: rel(cfg.pdf),
    meta: rel(cfg.meta),
    slides: rel(cfg.slides),
    slidesMeta: rel(cfg.slidesMeta),
    slidesPdf: rel(cfg.slidesPdf),
    slidesPdfMeta: rel(cfg.slidesPdfMeta),
    whitePaperVersion: source.version,
    updatedDate: source.updatedDate,
    slideCount: slidesMeta.slideCount,
    pdfSize,
    slidesPdfSize,
    layout
  }, null, 2));
}

main().catch((err) => {
  fail(err.message || String(err));
});
