const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATE = path.join(ROOT, 'src', 'ingestion-dashboard.template.html');

function read(file){
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

function escJsonForScript(value){
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function esc(value=''){
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeRepoPath(value=''){
  return String(value || '')
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '')
    .trim();
}

function encodeRepoPath(value=''){
  return normalizeRepoPath(value)
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function resolveLink(link = {}, context = {}){
  const href = String(link.href || '').trim();
  const hrefType = String(link.hrefType || 'hosted').trim();
  const blobBase = context.artifactBase || '';
  const rawBase = context.rawArtifactBase || '';
  if(!href) return '';
  if(hrefType === 'external' || /^https?:/i.test(href)) return href;
  if(hrefType === 'repoDoc' || hrefType === 'artifact'){
    return `${blobBase}${encodeRepoPath(href)}`;
  }
  if(hrefType === 'rawArtifact'){
    return `${rawBase}${encodeRepoPath(href)}`;
  }
  return href;
}

function resolvePreviewHref(preview = {}, context = {}){
  if(preview.previewHref){
    return resolveLink({
      href: preview.previewHref,
      hrefType: preview.previewHrefType || 'rawArtifact'
    }, context);
  }
  return resolveLink({
    href: preview.href,
    hrefType: preview.hrefType || 'artifact'
  }, context);
}

function decorateLink(link, context){
  return {
    ...link,
    resolvedHref: resolveLink(link, context)
  };
}

function decorateGame(game, context){
  return {
    ...game,
    hostedLinks: (game.hostedLinks || []).map((link) => decorateLink(link, context)),
    artifactGroups: (game.artifactGroups || []).map((group) => ({
      ...group,
      items: (group.items || []).map((item) => decorateLink(item, context))
    })),
    previews: (game.previews || []).map((preview) => ({
      ...preview,
      resolvedHref: resolveLink(preview, context),
      resolvedPreviewHref: resolvePreviewHref(preview, context)
    }))
  };
}

function decorateData(data, options = {}){
  const context = {
    artifactBase: options.artifactBase || 'https://github.com/sgwoods/Codex-Test1/blob/main/',
    rawArtifactBase: options.rawArtifactBase || 'https://raw.githubusercontent.com/sgwoods/Codex-Test1/main/',
    lane: options.releaseLane || 'development',
    buildLabel: options.buildLabel || '',
    buildCommit: options.buildCommit || '',
    pageBuiltAt: options.pageBuiltAt || ''
  };
  return {
    ...data,
    buildMeta: {
      lane: context.lane,
      buildLabel: context.buildLabel,
      buildCommit: context.buildCommit,
      pageBuiltAt: context.pageBuiltAt
    },
    counts: {
      games: Array.isArray(data.games) ? data.games.length : 0,
      phases: Array.isArray(data.phaseDefinitions) ? data.phaseDefinitions.length : 0,
      artifactFamilies: Array.isArray(data.artifactFamilies) ? data.artifactFamilies.length : 0
    },
    globalDocs: (data.globalDocs || []).map((link) => decorateLink(link, context)),
    games: (data.games || []).map((game) => decorateGame(game, context))
  };
}

function dashboardStyles(){
  return `
    :root{
      color-scheme: dark;
      --bg:#061120;
      --bg2:#0b1b31;
      --panel:#0f213c;
      --panel-soft:rgba(17,35,64,0.88);
      --line:rgba(124,182,255,0.24);
      --line-strong:rgba(255,205,96,0.48);
      --text:#edf5ff;
      --muted:#9db5d4;
      --accent:#7ee3ff;
      --gold:#ffcf63;
      --red:#ff6c67;
      --green:#89f0a2;
      --shadow:0 24px 60px rgba(0,0,0,0.42);
      --radius:22px;
    }
    *{box-sizing:border-box}
    body{
      margin:0;
      min-height:100vh;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color:var(--text);
      background:
        radial-gradient(circle at top left, rgba(126,227,255,0.16), transparent 28%),
        radial-gradient(circle at top right, rgba(255,207,99,0.12), transparent 24%),
        linear-gradient(180deg, #07101b 0%, #081528 38%, #091b32 100%);
    }
    a{color:inherit}
    .shell{
      width:min(1440px, calc(100vw - 32px));
      margin:0 auto;
      padding:24px 0 40px;
    }
    .hero{
      position:relative;
      overflow:hidden;
      padding:28px;
      border:1px solid var(--line);
      border-radius:28px;
      background:
        linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0)),
        linear-gradient(180deg, rgba(10,28,52,0.96), rgba(6,17,32,0.96));
      box-shadow:var(--shadow);
    }
    .hero::after{
      content:"";
      position:absolute;
      inset:auto -10% -30% 50%;
      height:220px;
      background:radial-gradient(circle, rgba(126,227,255,0.18), transparent 62%);
      pointer-events:none;
    }
    .heroTop{
      display:flex;
      gap:12px;
      align-items:center;
      flex-wrap:wrap;
      margin-bottom:14px;
    }
    .eyebrow,
    .statusChip,
    .phaseChip{
      display:inline-flex;
      align-items:center;
      gap:8px;
      padding:7px 12px;
      border-radius:999px;
      border:1px solid var(--line);
      background:rgba(8,22,41,0.68);
      color:var(--muted);
      font-size:12px;
      letter-spacing:0.08em;
      text-transform:uppercase;
    }
    .eyebrow{color:var(--accent)}
    h1{
      margin:0;
      font-family: Georgia, "Times New Roman", serif;
      font-size:clamp(2rem, 3.8vw, 3.6rem);
      line-height:1.04;
      letter-spacing:0.01em;
    }
    .strapline{
      max-width:78ch;
      margin:14px 0 0;
      color:var(--muted);
      font-size:1.05rem;
      line-height:1.6;
    }
    .goal{
      margin-top:18px;
      padding:16px 18px;
      border:1px solid rgba(255,207,99,0.26);
      border-radius:18px;
      background:rgba(255,207,99,0.08);
      color:#fff0c7;
    }
    .heroActions,
    .sectionActions,
    .detailLinks{
      display:flex;
      flex-wrap:wrap;
      gap:12px;
      margin-top:18px;
    }
    .button{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      gap:8px;
      padding:11px 15px;
      border-radius:14px;
      border:1px solid var(--line);
      background:rgba(14,31,58,0.94);
      color:var(--text);
      text-decoration:none;
      font-weight:700;
      box-shadow:0 14px 28px rgba(0,0,0,0.22);
    }
    .button.primary{
      border-color:rgba(255,207,99,0.42);
      background:linear-gradient(180deg, rgba(92,65,12,0.96), rgba(59,41,6,0.96));
      color:#ffebbb;
    }
    .stats{
      display:grid;
      grid-template-columns:repeat(4, minmax(0,1fr));
      gap:14px;
      margin-top:22px;
    }
    .statCard{
      padding:16px 18px;
      border:1px solid var(--line);
      border-radius:18px;
      background:var(--panel-soft);
    }
    .statCard strong{
      display:block;
      font-size:1.35rem;
      margin-bottom:8px;
      color:var(--accent);
    }
    .statCard span{
      display:block;
      color:var(--muted);
      font-size:0.95rem;
      line-height:1.5;
    }
    .viewTabs,
    .detailTabs{
      display:flex;
      flex-wrap:wrap;
      gap:10px;
    }
    .viewTabs{
      margin:22px 0 18px;
    }
    .tabButton{
      cursor:pointer;
      border:1px solid var(--line);
      border-radius:14px;
      padding:11px 14px;
      background:rgba(10,23,43,0.76);
      color:var(--muted);
      font-weight:700;
    }
    .tabButton.active{
      color:#fff7d8;
      border-color:var(--line-strong);
      background:rgba(90,64,12,0.42);
    }
    .view{
      display:none;
    }
    .view.active{
      display:block;
    }
    .dashboardLayout{
      display:grid;
      grid-template-columns:minmax(280px, 340px) minmax(0, 1fr);
      gap:18px;
      align-items:start;
    }
    .panel{
      border:1px solid var(--line);
      border-radius:24px;
      background:var(--panel-soft);
      box-shadow:var(--shadow);
    }
    .panelHeader{
      padding:20px 22px 10px;
    }
    .panelHeader h2,
    .panelHeader h3{
      margin:0;
      font-size:1.1rem;
    }
    .panelHeader p{
      margin:10px 0 0;
      color:var(--muted);
      line-height:1.55;
    }
    .gameSelector{
      padding:0 14px 16px;
    }
    .gameSelectorButton{
      width:100%;
      text-align:left;
      margin-top:12px;
      padding:16px 16px 14px;
      border:1px solid var(--line);
      border-radius:18px;
      background:rgba(7,18,33,0.9);
      color:var(--text);
      cursor:pointer;
    }
    .gameSelectorButton.active{
      border-color:var(--line-strong);
      background:linear-gradient(180deg, rgba(76,57,13,0.42), rgba(20,23,33,0.92));
    }
    .gameSelectorButton strong{
      display:block;
      font-size:1rem;
      margin-bottom:6px;
    }
    .gameSelectorButton p{
      margin:0;
      color:var(--muted);
      font-size:0.92rem;
      line-height:1.45;
    }
    .gameSelectorMeta{
      display:flex;
      justify-content:space-between;
      gap:10px;
      align-items:center;
      margin-top:10px;
      font-size:12px;
      color:var(--muted);
      text-transform:uppercase;
      letter-spacing:0.06em;
    }
    .detailPanel{
      padding:22px;
    }
    .detailHeading{
      display:flex;
      justify-content:space-between;
      gap:16px;
      align-items:flex-start;
      flex-wrap:wrap;
    }
    .detailHeading h2{
      margin:0;
      font-family:Georgia, "Times New Roman", serif;
      font-size:2rem;
    }
    .detailHeading p{
      margin:8px 0 0;
      color:var(--muted);
      line-height:1.6;
      max-width:74ch;
    }
    .scoreGrid,
    .phaseGrid,
    .artifactGroupGrid,
    .planGrid,
    .huntGrid,
    .docGrid,
    .familyGrid,
    .previewGrid,
    .checklistGrid{
      display:grid;
      gap:14px;
    }
    .scoreGrid{
      grid-template-columns:repeat(3, minmax(0,1fr));
      margin-top:18px;
    }
    .scoreCard,
    .phaseCard,
    .artifactCard,
    .planCard,
    .docCard,
    .familyCard,
    .huntCard,
    .previewCard,
    .checklistCard{
      padding:16px 18px;
      border:1px solid var(--line);
      border-radius:18px;
      background:rgba(7,18,34,0.88);
    }
    .scoreCard strong,
    .phaseCard strong,
    .artifactCard strong,
    .planCard strong,
    .docCard strong,
    .familyCard strong,
    .huntCard strong,
    .previewCard strong,
    .checklistCard strong{
      display:block;
      margin-bottom:8px;
    }
    .scoreValue{
      display:block;
      font-size:1.26rem;
      color:var(--accent);
      margin-bottom:8px;
      font-weight:800;
    }
    .phaseGrid{
      grid-template-columns:repeat(3, minmax(0,1fr));
      margin-top:18px;
    }
    .artifactGroupGrid,
    .planGrid,
    .docGrid,
    .familyGrid,
    .previewGrid,
    .checklistGrid{
      grid-template-columns:repeat(2, minmax(0,1fr));
      margin-top:18px;
    }
    .artifactItems,
    .deliverableList,
    .simpleList{
      margin:12px 0 0;
      padding-left:18px;
      color:var(--muted);
      line-height:1.55;
    }
    .linkList{
      display:grid;
      gap:12px;
      margin-top:12px;
    }
    .linkRow{
      display:block;
      padding:12px 14px;
      border:1px solid rgba(124,182,255,0.18);
      border-radius:14px;
      text-decoration:none;
      background:rgba(13,30,56,0.74);
    }
    .linkRow span{
      display:block;
      color:var(--muted);
      margin-top:5px;
      line-height:1.45;
      font-size:0.92rem;
    }
    .previewCard img{
      width:100%;
      display:block;
      border-radius:12px;
      margin-top:12px;
      border:1px solid rgba(124,182,255,0.14);
      background:#07111f;
    }
    .detailLabel{
      display:inline-flex;
      align-items:center;
      margin-top:12px;
      margin-bottom:8px;
      color:var(--gold);
      font-size:12px;
      letter-spacing:0.08em;
      text-transform:uppercase;
    }
    .microCopy{
      margin-top:10px;
      color:var(--muted);
      font-size:0.94rem;
      line-height:1.55;
    }
    .metaBar{
      display:flex;
      flex-wrap:wrap;
      gap:10px;
      margin-top:12px;
      color:var(--muted);
      font-size:0.92rem;
    }
    .viewSection{
      padding:22px;
    }
    .viewSection + .viewSection{
      margin-top:18px;
    }
    .sectionIntro{
      margin-top:10px;
      color:var(--muted);
      line-height:1.6;
      max-width:82ch;
    }
    .footerNote{
      margin-top:20px;
      color:var(--muted);
      font-size:0.9rem;
      line-height:1.5;
    }
    @media (max-width: 1120px){
      .dashboardLayout,
      .stats,
      .scoreGrid,
      .phaseGrid,
      .artifactGroupGrid,
      .planGrid,
      .docGrid,
      .familyGrid,
      .previewGrid,
      .checklistGrid{
        grid-template-columns:1fr 1fr;
      }
      .dashboardLayout{
        grid-template-columns:1fr;
      }
    }
    @media (max-width: 760px){
      .shell{
        width:min(100vw - 16px, 100%);
        padding:12px 0 24px;
      }
      .hero,
      .detailPanel,
      .viewSection{
        padding:18px;
      }
      .stats,
      .scoreGrid,
      .phaseGrid,
      .artifactGroupGrid,
      .planGrid,
      .docGrid,
      .familyGrid,
      .previewGrid,
      .checklistGrid{
        grid-template-columns:1fr;
      }
      h1{
        font-size:2rem;
      }
    }
  `;
}

function dashboardScript(){
  return `
    (function(){
      const data = JSON.parse(document.getElementById('ingestionDashboardData').textContent);
      const gameSelector = document.getElementById('gameSelector');
      const gameTitle = document.getElementById('gameTitle');
      const gameLineage = document.getElementById('gameLineage');
      const gameThemeRead = document.getElementById('gameThemeRead');
      const gameStatus = document.getElementById('gameStatus');
      const gameDecision = document.getElementById('gameDecision');
      const scoreGrid = document.getElementById('scoreGrid');
      const phaseGrid = document.getElementById('phaseGrid');
      const detailLinks = document.getElementById('detailLinks');
      const artifactGroups = document.getElementById('artifactGroups');
      const planGrid = document.getElementById('planGrid');
      const gapGrid = document.getElementById('gapGrid');
      const previewGrid = document.getElementById('previewGrid');
      const detailTabs = Array.from(document.querySelectorAll('[data-detail-tab]'));
      const detailPanels = Array.from(document.querySelectorAll('[data-detail-panel]'));
      const viewTabs = Array.from(document.querySelectorAll('[data-view-tab]'));
      const viewPanels = Array.from(document.querySelectorAll('[data-view-panel]'));
      let activeGameKey = data.games[0] ? data.games[0].gameKey : '';
      let activeDetailTab = 'overview';

      function escapeHtml(value){
        return String(value == null ? '' : value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function gameByKey(key){
        return data.games.find((game) => game.gameKey === key) || data.games[0];
      }

      function chipClass(state){
        return 'phaseChip';
      }

      function renderSelector(){
        gameSelector.innerHTML = data.games.map((game) => {
          const summary = (game.phaseStatus || []).find((entry) => entry.phaseId === 'plan') || game.phaseStatus[0] || { state: '--', summary: '' };
          return \`
            <button class="gameSelectorButton\${game.gameKey === activeGameKey ? ' active' : ''}" data-game-key="\${escapeHtml(game.gameKey)}" type="button">
              <strong>\${escapeHtml(game.title)}</strong>
              <p>\${escapeHtml(game.status)}</p>
              <div class="gameSelectorMeta">
                <span>\${escapeHtml(summary.state || '--')}</span>
                <span>\${escapeHtml(summary.phaseId || '')}</span>
              </div>
            </button>
          \`;
        }).join('');
        Array.from(gameSelector.querySelectorAll('[data-game-key]')).forEach((button) => {
          button.addEventListener('click', () => {
            activeGameKey = button.getAttribute('data-game-key');
            renderSelector();
            renderDetail();
          });
        });
      }

      function renderScoreCards(game){
        scoreGrid.innerHTML = (game.headlineScores || []).map((entry) => \`
          <article class="scoreCard">
            <strong>\${escapeHtml(entry.label || '')}</strong>
            <span class="scoreValue">\${escapeHtml(entry.value || '')}</span>
            <span>\${escapeHtml(entry.detail || '')}</span>
          </article>
        \`).join('');
      }

      function renderPhaseCards(game){
        phaseGrid.innerHTML = (game.phaseStatus || []).map((entry) => \`
          <article class="phaseCard">
            <span class="\${chipClass(entry.state)}">\${escapeHtml(entry.state || '')}</span>
            <strong>\${escapeHtml(entry.phaseId || '')}</strong>
            <span>\${escapeHtml(entry.summary || '')}</span>
          </article>
        \`).join('');
      }

      function renderDetailLinks(game){
        detailLinks.innerHTML = (game.hostedLinks || []).map((entry) => \`
          <a class="button" href="\${escapeHtml(entry.resolvedHref || '#')}">\${escapeHtml(entry.label || '')}</a>
        \`).join('');
      }

      function renderArtifactGroups(game){
        artifactGroups.innerHTML = (game.artifactGroups || []).map((group) => \`
          <article class="artifactCard">
            <strong>\${escapeHtml(group.title || '')}</strong>
            <div class="linkList">
              \${(group.items || []).map((item) => \`
                <a class="linkRow" href="\${escapeHtml(item.resolvedHref || '#')}">
                  <strong>\${escapeHtml(item.label || '')}</strong>
                  <span>\${escapeHtml(item.detail || '')}</span>
                </a>
              \`).join('')}
            </div>
          </article>
        \`).join('');
      }

      function renderPlanTracks(game){
        planGrid.innerHTML = (game.planTracks || []).map((track) => \`
          <article class="planCard">
            <strong>\${escapeHtml(track.title || '')}</strong>
            <span>\${escapeHtml(track.goal || '')}</span>
            <ul class="deliverableList">
              \${(track.deliverables || []).map((item) => \`<li>\${escapeHtml(item)}</li>\`).join('')}
            </ul>
          </article>
        \`).join('');
      }

      function renderGaps(game){
        gapGrid.innerHTML = (game.nextArtifacts || []).map((item) => {
          if(typeof item === 'string'){
            return \`
              <article class="huntCard">
                <strong>Needed artifact</strong>
                <span>\${escapeHtml(item)}</span>
              </article>
            \`;
          }
          return \`
            <article class="huntCard">
              <strong>\${escapeHtml(item.title || 'Needed artifact')}</strong>
              \${item.priority ? \`<span class="detailLabel">Priority \${escapeHtml(item.priority)}</span>\` : ''}
              <span>\${escapeHtml(item.why || '')}</span>
              \${Array.isArray(item.find) && item.find.length ? \`
                <span class="detailLabel">Go find</span>
                <ul class="simpleList">
                  \${item.find.map((entry) => \`<li>\${escapeHtml(entry)}</li>\`).join('')}
                </ul>
              \` : ''}
              \${item.goodEnough ? \`<div class="microCopy"><strong>Good enough to proceed:</strong> \${escapeHtml(item.goodEnough)}</div>\` : ''}
            </article>
          \`;
        }).join('');
      }

      function renderPreviews(game){
        if(!(game.previews || []).length){
          previewGrid.innerHTML = '<article class="previewCard"><strong>No preview artifacts surfaced yet</strong><span>Use this slot for contact sheets, waveforms, semantic timelines, or other quick-look review assets as each game matures.</span></article>';
          return;
        }
        previewGrid.innerHTML = game.previews.map((item) => \`
          <article class="previewCard">
            <strong>\${escapeHtml(item.label || '')}</strong>
            <span>\${escapeHtml(item.detail || '')}</span>
            \${item.mediaKind === 'image' ? \`<img src="\${escapeHtml(item.resolvedPreviewHref || '')}" alt="\${escapeHtml(item.label || '')}">\` : ''}
            <div class="sectionActions">
              <a class="button" href="\${escapeHtml(item.resolvedHref || '#')}">Open artifact</a>
            </div>
          </article>
        \`).join('');
      }

      function setDetailTab(tabId){
        activeDetailTab = tabId;
        detailTabs.forEach((button) => {
          button.classList.toggle('active', button.getAttribute('data-detail-tab') === tabId);
        });
        detailPanels.forEach((panel) => {
          panel.classList.toggle('active', panel.getAttribute('data-detail-panel') === tabId);
        });
      }

      function renderDetail(){
        const game = gameByKey(activeGameKey);
        gameTitle.textContent = game.title || '';
        gameLineage.textContent = game.lineage || '';
        gameThemeRead.textContent = game.themeRead || '';
        gameStatus.textContent = game.status || '';
        gameDecision.textContent = game.decisionRead || '';
        renderScoreCards(game);
        renderPhaseCards(game);
        renderDetailLinks(game);
        renderArtifactGroups(game);
        renderPlanTracks(game);
        renderGaps(game);
        renderPreviews(game);
        setDetailTab(activeDetailTab);
      }

      function renderProcessDocs(){
        document.getElementById('processDocs').innerHTML = (data.globalDocs || []).map((item) => \`
          <article class="docCard">
            <strong>\${escapeHtml(item.label || '')}</strong>
            <span>\${escapeHtml(item.detail || '')}</span>
            <div class="sectionActions">
              <a class="button" href="\${escapeHtml(item.resolvedHref || '#')}">Open source</a>
            </div>
          </article>
        \`).join('');
        document.getElementById('processFamilies').innerHTML = (data.artifactFamilies || []).map((item) => \`
          <article class="familyCard">
            <strong>\${escapeHtml(item.label || '')}</strong>
            <span>\${escapeHtml(item.detail || '')}</span>
            \${item.why ? \`<div class="microCopy"><strong>Why it matters:</strong> \${escapeHtml(item.why)}</div>\` : ''}
            \${Array.isArray(item.examples) && item.examples.length ? \`
              <span class="detailLabel">Examples to find</span>
              <ul class="simpleList">
                \${item.examples.map((entry) => \`<li>\${escapeHtml(entry)}</li>\`).join('')}
              </ul>
            \` : ''}
            \${item.minimum ? \`<div class="microCopy"><strong>Good enough to start:</strong> \${escapeHtml(item.minimum)}</div>\` : ''}
          </article>
        \`).join('');
        document.getElementById('minimumChecklist').innerHTML = (data.minimumIntakeChecklist || []).map((item) => \`
          <article class="checklistCard">
            <strong>\${escapeHtml(item.title || '')}</strong>
            <span>\${escapeHtml(item.why || '')}</span>
            \${item.goodEnough ? \`<div class="microCopy"><strong>Good enough to proceed:</strong> \${escapeHtml(item.goodEnough)}</div>\` : ''}
          </article>
        \`).join('');
        document.getElementById('platformExtensions').innerHTML = (data.platformExtensions || []).map((item) => \`
          <article class="familyCard">
            <strong>\${escapeHtml(item.title || '')}</strong>
            <span>\${escapeHtml(item.detail || '')}</span>
          </article>
        \`).join('');
        document.getElementById('globalHunts').innerHTML = (data.globalHunts || []).map((item) => \`
          <article class="huntCard">
            <strong>Standing hunt</strong>
            <span>\${escapeHtml(item)}</span>
          </article>
        \`).join('');
      }

      viewTabs.forEach((button) => {
        button.addEventListener('click', () => {
          const target = button.getAttribute('data-view-tab');
          viewTabs.forEach((entry) => entry.classList.toggle('active', entry === button));
          viewPanels.forEach((panel) => panel.classList.toggle('active', panel.getAttribute('data-view-panel') === target));
        });
      });

      detailTabs.forEach((button) => {
        button.addEventListener('click', () => setDetailTab(button.getAttribute('data-detail-tab')));
      });

      renderSelector();
      renderDetail();
      renderProcessDocs();
      setDetailTab('overview');
    })();
  `;
}

function buildIngestionDashboardHtml(data, options = {}){
  const template = read(TEMPLATE);
  const decorated = decorateData(data, options);
  const heroStats = [
    {
      label: 'Games in dashboard',
      value: decorated.counts.games,
      detail: 'Current games plus the next intake target.'
    },
    {
      label: 'Intake phases tracked',
      value: decorated.counts.phases,
      detail: 'Collection through release review.'
    },
    {
      label: 'Artifact families to seek',
      value: decorated.counts.artifactFamilies,
      detail: 'The current standing evidence vocabulary.'
    },
    {
      label: 'Current next-game target',
      value: 'Windigo Invaders',
      detail: 'Space Invaders lineage entering through source-first intake.'
    }
  ];

  const body = `
    <main class="shell">
      <section class="hero">
        <div class="heroTop">
          <span class="eyebrow">Artifact Collection And Analysis</span>
          <span class="statusChip">Lane ${esc(decorated.buildMeta.lane || '--')}</span>
          <span class="statusChip">Build ${esc(decorated.buildMeta.buildLabel || '--')}</span>
        </div>
        <h1>${esc(decorated.title || 'Ingestion Dashboard')}</h1>
        <p class="strapline">${esc(decorated.strapline || '')}</p>
        <div class="goal"><strong>Current goal:</strong> ${esc(decorated.currentGoal || '')}</div>
        <div class="heroActions">
          <a class="button primary" href="index.html">Open current lane build</a>
          <a class="button" href="release-dashboard.html">Open release dashboard</a>
          <a class="button" href="project-guide.html">Open project guide</a>
          <a class="button" href="conformance-dashboard.html">Open conformance dashboard</a>
          <a class="button" href="platinum-guide.html">Open Platinum guide</a>
          <a class="button" href="https://github.com/sgwoods/Codex-Test1">Open repository</a>
        </div>
        <div class="stats">
          ${heroStats.map((entry) => `
            <article class="statCard">
              <strong>${esc(String(entry.value))}</strong>
              <span><b>${esc(entry.label)}</b><br>${esc(entry.detail)}</span>
            </article>
          `).join('')}
        </div>
      </section>

      <div class="viewTabs">
        <button class="tabButton active" type="button" data-view-tab="games">Games</button>
        <button class="tabButton" type="button" data-view-tab="process">Process</button>
        <button class="tabButton" type="button" data-view-tab="artifact-hunt">Artifact Hunt</button>
      </div>

      <section class="view active" data-view-panel="games">
        <div class="dashboardLayout">
          <aside class="panel">
            <div class="panelHeader">
              <h2>Game Intake Status</h2>
              <p>Select a game to review its current artifact set, intake posture, instantiation plan, and remaining evidence gaps.</p>
            </div>
            <div id="gameSelector" class="gameSelector"></div>
          </aside>

          <section class="panel detailPanel">
            <div class="detailHeading">
              <div>
                <div class="heroTop">
                  <span id="gameStatus" class="statusChip">--</span>
                  <span id="gameLineage" class="statusChip">--</span>
                </div>
                <h2 id="gameTitle">--</h2>
                <p id="gameThemeRead">--</p>
              </div>
            </div>
            <div class="goal"><strong>Decision read:</strong> <span id="gameDecision"></span></div>
            <div id="detailLinks" class="detailLinks"></div>
            <div class="detailTabs" style="margin-top:18px;">
              <button class="tabButton active" type="button" data-detail-tab="overview">Overview</button>
              <button class="tabButton" type="button" data-detail-tab="artifacts">Artifacts</button>
              <button class="tabButton" type="button" data-detail-tab="plan">Platinum Instantiation Plan</button>
              <button class="tabButton" type="button" data-detail-tab="gaps">Gaps And Hunts</button>
            </div>

            <div class="view active" data-detail-panel="overview">
              <div id="scoreGrid" class="scoreGrid"></div>
              <div id="phaseGrid" class="phaseGrid"></div>
            </div>

            <div class="view" data-detail-panel="artifacts">
              <div id="artifactGroups" class="artifactGroupGrid"></div>
              <div id="previewGrid" class="previewGrid"></div>
            </div>

            <div class="view" data-detail-panel="plan">
              <div id="planGrid" class="planGrid"></div>
            </div>

            <div class="view" data-detail-panel="gaps">
              <div id="gapGrid" class="huntGrid"></div>
            </div>
          </section>
        </div>
      </section>

      <section class="view" data-view-panel="process">
        <section class="panel viewSection">
          <div class="panelHeader">
            <h2>Process Frame</h2>
            <p class="sectionIntro">${esc(decorated.dashboardRead || '')}</p>
          </div>
          <div class="phaseGrid">
            ${(decorated.phaseDefinitions || []).map((phase) => `
              <article class="phaseCard">
                <strong>${esc(phase.label || '')}</strong>
                <span>${esc(phase.purpose || '')}</span>
                <ul class="simpleList">
                  ${(phase.outputs || []).map((item) => `<li>${esc(item)}</li>`).join('')}
                </ul>
              </article>
            `).join('')}
          </div>
        </section>
        <section class="panel viewSection">
          <div class="panelHeader">
            <h2>Core Source Docs</h2>
            <p class="sectionIntro">These repo-owned docs define the reusable intake rules and should stay current as the dashboard becomes the main decision cockpit for future games.</p>
          </div>
          <div id="processDocs" class="docGrid"></div>
        </section>
        <section class="panel viewSection">
          <div class="panelHeader">
            <h2>Platform Extensions</h2>
            <p class="sectionIntro">These are the generic capabilities we should keep strengthening so a third game can enter with better timing, audio, and artifact fidelity on day one.</p>
          </div>
          <div id="platformExtensions" class="familyGrid"></div>
        </section>
      </section>

      <section class="view" data-view-panel="artifact-hunt">
        <section class="panel viewSection">
          <div class="panelHeader">
            <h2>Artifact Families To Seek</h2>
            <p class="sectionIntro">The dashboard should help us notice what is missing before we build. These cards tell us what to find, why it matters, and what counts as enough evidence to start responsibly.</p>
          </div>
          <div id="processFamilies" class="familyGrid"></div>
        </section>
        <section class="panel viewSection">
          <div class="panelHeader">
            <h2>Minimum Intake Checklist</h2>
            <p class="sectionIntro">If we are starting a new game line, this is the smallest artifact bundle we should try to assemble before serious runtime design begins.</p>
          </div>
          <div id="minimumChecklist" class="checklistGrid"></div>
        </section>
        <section class="panel viewSection">
          <div class="panelHeader">
            <h2>Standing Artifact Hunts</h2>
            <p class="sectionIntro">When a game feels weak or under-explained, start here before tuning blindly.</p>
          </div>
          <div id="globalHunts" class="huntGrid"></div>
        </section>
      </section>

      <p class="footerNote">
        This hosted dashboard is generated from <code>ingestion-dashboard.json</code> plus committed artifact manifests and reference outputs. The intended rule going forward is simple: new game materials should land here first, then expand outward into deeper conformance pages and runtime work only after the intake picture is credible.
      </p>
    </main>
    <script id="ingestionDashboardData" type="application/json">${escJsonForScript(decorated)}</script>
    <script>${dashboardScript()}</script>
  `;

  return template
    .replace('{{INGESTION_DASHBOARD_STYLES}}', dashboardStyles())
    .replace('{{INGESTION_DASHBOARD_BODY}}', body)
    .trimEnd() + '\n';
}

module.exports = {
  buildIngestionDashboardHtml,
  decorateIngestionDashboardData: decorateData
};
