const state = {
  runs: [],
  filteredRuns: [],
  currentRun: null,
  currentEvents: [],
  selectedTime: 0,
  eventWindow: 6,
  lastRenderedEventKey: '',
  activeFilter: 'all',
  filterText: '',
  viewport: { scale: 1, tx: 0, ty: 0, dragging: false, pointerId: null, startX: 0, startY: 0, originTx: 0, originTy: 0 },
  selectMode: false,
  selection: null,
  selectionDraft: null,
  clip: null
};

const els = {
  runFilter: document.getElementById('runFilter'),
  runList: document.getElementById('runList'),
  runTitle: document.getElementById('runTitle'),
  runMeta: document.getElementById('runMeta'),
  artifactBadge: document.getElementById('artifactBadge'),
  viewerPanel: document.getElementById('viewerPanel'),
  runVideo: document.getElementById('runVideo'),
  videoViewport: document.getElementById('videoViewport'),
  selectionOverlay: document.getElementById('selectionOverlay'),
  selectionBox: document.getElementById('selectionBox'),
  selectRegionBtn: document.getElementById('selectRegionBtn'),
  clearRegionBtn: document.getElementById('clearRegionBtn'),
  playPause: document.getElementById('playPause'),
  back5: document.getElementById('back5'),
  forward5: document.getElementById('forward5'),
  playbackRate: document.getElementById('playbackRate'),
  timeline: document.getElementById('timeline'),
  timelineMarkers: document.getElementById('timelineMarkers'),
  timeLabel: document.getElementById('timeLabel'),
  eventList: document.getElementById('eventList'),
  eventMeta: document.getElementById('eventMeta'),
  zoomOut: document.getElementById('zoomOut'),
  zoomIn: document.getElementById('zoomIn'),
  zoomLabel: document.getElementById('zoomLabel'),
  currentEventTitle: document.getElementById('currentEventTitle'),
  currentEventTime: document.getElementById('currentEventTime'),
  currentEventDetails: document.getElementById('currentEventDetails'),
  eventFilterText: document.getElementById('eventFilterText'),
  filterChips: [...document.querySelectorAll('.filter-chip')],
  codexQuestion: document.getElementById('codexQuestion'),
  issueTitle: document.getElementById('issueTitle'),
  codexContext: document.getElementById('codexContext'),
  copyPrompt: document.getElementById('copyPrompt'),
  draftIssue: document.getElementById('draftIssue'),
  createIssue: document.getElementById('createIssue'),
  issueStatus: document.getElementById('issueStatus'),
  clipPreviewWrap: document.getElementById('clipPreviewWrap'),
  clipPreview: document.getElementById('clipPreview'),
  clipMeta: document.getElementById('clipMeta'),
  shortcutsBtn: document.getElementById('shortcutsBtn'),
  closeShortcuts: document.getElementById('closeShortcuts'),
  shortcutsModal: document.getElementById('shortcutsModal')
};

async function getJson(url, options){
  const res = await fetch(url, options);
  if(!res.ok) throw new Error((await res.json().catch(()=>({ error: res.statusText }))).error || res.statusText);
  return res.json();
}

function fmtTime(t=0){ return `${(+t || 0).toFixed(3)}s`; }

function humanEvent(evt){
  const extras = [];
  if(evt.stage) extras.push(`stage ${evt.stage}`);
  if(evt.score != null && evt.type === 'ship_lost') extras.push(`score ${evt.score}`);
  if(evt.cause) extras.push(String(evt.cause).replaceAll('_',' '));
  if(evt.enemyType) extras.push(evt.enemyType);
  if(evt.mode) extras.push(evt.mode);
  if(evt.hits != null && evt.total != null) extras.push(`${evt.hits}/${evt.total}`);
  return `${fmtTime(evt.t)}  ${evt.type.replaceAll('_',' ')}${extras.length ? ' · ' + extras.join(' · ') : ''}`;
}

function isTypingTarget(target){
  if(!target) return false;
  const tag = target.tagName || '';
  return ['INPUT','TEXTAREA','SELECT'].includes(tag) || target.isContentEditable;
}

function eventKind(evt){
  if(['ship_lost','life_lost'].includes(evt.type)) return 'loss';
  if(['capture_started','fighter_captured','fighter_rescued','capture_escape','rescue_pod_spawned'].includes(evt.type)) return 'capture';
  if(['stage_spawn','challenge_clear','stage_cleared','stage_profile'].includes(evt.type)) return 'stage';
  if(['special_bonus_awarded','challenge_bonus_awarded'].includes(evt.type)) return 'bonus';
  return '';
}

function filterMatch(evt){
  const type = evt.type || '';
  if(state.activeFilter === 'loss' && !['ship_lost','life_lost'].includes(type)) return false;
  if(state.activeFilter === 'capture' && !['capture_started','fighter_captured','fighter_rescued','capture_escape','rescue_pod_spawned'].includes(type)) return false;
  if(state.activeFilter === 'stage' && !['stage_spawn','stage_cleared','challenge_clear','stage_profile'].includes(type)) return false;
  if(state.activeFilter === 'combat' && !['enemy_attack_start','enemy_bullet_fired','enemy_killed','enemy_damaged','player_shot'].includes(type)) return false;
  if(state.activeFilter === 'input' && !['key_down','key_up'].includes(type)) return false;
  const q = state.filterText.trim().toLowerCase();
  if(q && !JSON.stringify(evt).toLowerCase().includes(q)) return false;
  return true;
}

function filteredEvents(){
  return state.currentEvents.filter(filterMatch);
}

function currentEvent(){
  const focus = state.selectedTime;
  let best = null;
  let bestDt = Infinity;
  for(const evt of filteredEvents()){
    const dt = Math.abs((evt.t || 0) - focus);
    if(dt < bestDt){ best = evt; bestDt = dt; }
  }
  return best;
}

function eventDetails(evt){
  if(!evt) return 'Pause the run or scrub to inspect a moment.';
  const keys = ['stage','score','cause','enemyType','enemyFamily','mode','hits','total','livesBefore','playerLane','sourceLane','sourceColumn'];
  const pairs = keys.filter(k => evt[k] != null).map(k => `${k}: ${evt[k]}`);
  return pairs.length ? pairs.join('\n') : 'No extra fields on this event.';
}

function currentWindowEvents(){
  const around = state.selectedTime;
  return filteredEvents().filter(evt => Math.abs((evt.t || 0) - around) <= 1.5).slice(0, 16);
}

function visibleEvents(){
  const around = state.selectedTime;
  const filtered = filteredEvents().filter(evt => Math.abs((evt.t || 0) - around) <= state.eventWindow);
  if(filtered.length) return filtered.slice(0, 120);
  return filteredEvents().slice(0, 120);
}

function syncEventScroll(){
  const active = els.eventList.querySelector('.event-item.active');
  if(!active) return;
  const key = active.dataset.key || '';
  if(key === state.lastRenderedEventKey) return;
  state.lastRenderedEventKey = key;
  active.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function buildCodexContext(){
  if(!state.currentRun) return '';
  const nearby = currentWindowEvents();
  const run = state.currentRun;
  const summary = run.summary || {};
  const lines = [
    `Run: ${run.relDir}`,
    `Time: ${fmtTime(state.selectedTime)}`,
    `Video: ${run.videoUrl || '(none)'}`,
    `Session: ${run.sessionUrl || '(none)'}`,
    `Scenario: ${summary.name || '(unknown)'}`,
    `Persona: ${summary.persona || '(none)'}`,
    `Stage: ${summary.state?.stage ?? summary.config?.stage ?? '(unknown)'}`,
    `Score: ${summary.state?.score ?? 0}`,
    `Lives: ${summary.state?.lives ?? '(unknown)'}`
  ];
  if(state.clip?.file) lines.push(`Clip: ${state.clip.file}`);
  if(state.clip?.bounds) lines.push(`Clip Bounds: ${JSON.stringify(state.clip.bounds)}`);
  lines.push('', 'Nearby events:');
  for(const evt of nearby) lines.push(`- ${humanEvent(evt)}`);
  if(!nearby.length) lines.push('- none near current timestamp');
  if(els.codexQuestion.value.trim()) lines.push('', 'Question / notes:', els.codexQuestion.value.trim());
  return lines.join('\n');
}

function renderRuns(){
  const q = els.runFilter.value.trim().toLowerCase();
  state.filteredRuns = state.runs.filter(run => !q || JSON.stringify(run).toLowerCase().includes(q));
  els.runList.innerHTML = state.filteredRuns.map(run => `
    <div class="run-card ${state.currentRun && state.currentRun.relDir === run.relDir ? 'active' : ''}" data-run="${run.relDir}">
      <strong>${run.name}</strong>
      <div class="meta-row"><span>${run.persona || 'manual'}</span><span>${fmtTime(run.duration)}</span></div>
      <div class="meta-row"><span>Stage ${run.stage || '?'}</span><span>Score ${run.score || 0}</span></div>
      <div class="meta-row"><span>${run.updatedAt.replace('T',' ').slice(0,16)}</span><span>${run.artifactQuality?.ok === false ? 'artifact issue' : 'artifact ok'}</span></div>
    </div>`).join('');
  for(const card of els.runList.querySelectorAll('.run-card')) card.onclick = () => loadRun(card.dataset.run);
}

function renderTimelineMarkers(){
  const duration = Number.isFinite(els.runVideo.duration) ? els.runVideo.duration : (state.currentRun?.summary?.analysis?.duration || 0);
  if(!(duration > 0)) return void (els.timelineMarkers.innerHTML = '');
  const markers = filteredEvents().map(evt => ({ evt, kind: eventKind(evt) })).filter(x => x.kind).slice(0, 200);
  els.timelineMarkers.innerHTML = markers.map(({ evt, kind }) => {
    const left = Math.max(0, Math.min(100, ((evt.t || 0) / duration) * 100));
    return `<span class="timeline-marker ${kind}" style="left:${left}%" title="${humanEvent(evt)}"></span>`;
  }).join('');
}

function renderEvents(){
  const focus = state.selectedTime;
  const events = visibleEvents();
  els.eventList.innerHTML = events.map(evt => {
    const dt = Math.abs((evt.t || 0) - focus);
    const active = dt < 0.15 ? 'active' : '';
    const near = dt >= 0.15 && dt <= 0.75 ? 'near' : '';
    const key = `${evt.type}-${evt.t || 0}-${evt.stage || 0}`;
    return `<div class="event-item ${active} ${near}" data-key="${key}" data-time="${evt.t || 0}"><span class="event-type">${fmtTime(evt.t)}</span> ${evt.type.replaceAll('_',' ')} ${humanEvent(evt).split('  ').slice(1).join('  ')}</div>`;
  }).join('') || '<div class="meta">No events found.</div>';
  els.eventMeta.textContent = `${events.length} events in ±${state.eventWindow.toFixed(0)}s window`;
  for(const row of els.eventList.querySelectorAll('.event-item')) row.onclick = () => seekTo(+row.dataset.time || 0);
  syncEventScroll();
}

function renderCurrentEventCard(){
  const evt = currentEvent();
  if(!evt){
    els.currentEventTitle.textContent = 'No active event';
    els.currentEventTime.textContent = '';
    els.currentEventDetails.textContent = 'Pause the run or scrub to inspect a moment.';
    return;
  }
  els.currentEventTitle.textContent = evt.type.replaceAll('_',' ');
  els.currentEventTime.textContent = fmtTime(evt.t || 0);
  els.currentEventDetails.textContent = eventDetails(evt);
}

function applyVideoTransform(){
  const { scale, tx, ty } = state.viewport;
  els.runVideo.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  els.videoViewport.classList.toggle('paused', !!els.runVideo.paused && !state.selectMode);
  els.videoViewport.classList.toggle('selecting', !!els.runVideo.paused && state.selectMode);
}

function resetViewport(){
  state.viewport.scale = 1;
  state.viewport.tx = 0;
  state.viewport.ty = 0;
  applyVideoTransform();
}

function updateSelectionBox(){
  let box = null;
  if(state.selectionDraft){
    box = state.selectionDraft;
  }else if(state.selection){
    box = {
      x: state.selection.x * state.viewport.scale + state.viewport.tx,
      y: state.selection.y * state.viewport.scale + state.viewport.ty,
      w: state.selection.w * state.viewport.scale,
      h: state.selection.h * state.viewport.scale
    };
  }
  if(!box){
    els.selectionBox.classList.add('hidden');
    return;
  }
  els.selectionBox.classList.remove('hidden');
  els.selectionBox.style.left = `${box.x}px`;
  els.selectionBox.style.top = `${box.y}px`;
  els.selectionBox.style.width = `${box.w}px`;
  els.selectionBox.style.height = `${box.h}px`;
}

function clearClip(){
  state.selection = null;
  state.selectionDraft = null;
  state.clip = null;
  els.clipPreview.removeAttribute('src');
  els.clipPreviewWrap.classList.add('empty');
  els.clipMeta.textContent = 'No region selected';
  updateSelectionBox();
  updateMeta();
}

function viewportPoint(e){
  const rect = els.videoViewport.getBoundingClientRect();
  return {
    rect,
    x: Math.max(0, Math.min(rect.width, e.clientX - rect.left)),
    y: Math.max(0, Math.min(rect.height, e.clientY - rect.top))
  };
}

function viewToVideoPoint(x, y){
  const vx = (x - state.viewport.tx) / state.viewport.scale;
  const vy = (y - state.viewport.ty) / state.viewport.scale;
  return {
    x: Math.max(0, Math.min(els.runVideo.clientWidth, vx)),
    y: Math.max(0, Math.min(els.runVideo.clientHeight, vy))
  };
}

async function saveClipFromSelection(){
  if(!state.selection || !els.runVideo.videoWidth || !els.runVideo.videoHeight) return;
  const scaleX = els.runVideo.videoWidth / els.runVideo.clientWidth;
  const scaleY = els.runVideo.videoHeight / els.runVideo.clientHeight;
  const sx = Math.round(state.selection.x * scaleX);
  const sy = Math.round(state.selection.y * scaleY);
  const sw = Math.max(1, Math.round(state.selection.w * scaleX));
  const sh = Math.max(1, Math.round(state.selection.h * scaleY));
  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(els.runVideo, sx, sy, sw, sh, 0, 0, sw, sh);
  const dataUrl = canvas.toDataURL('image/png');
  const saved = await getJson('/api/clips', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ dataUrl, runId: state.currentRun?.relDir || 'run' })
  });
  state.clip = { url: saved.url, file: saved.file, bounds: { sx, sy, sw, sh, t: +state.selectedTime.toFixed(3) } };
  els.clipPreview.src = dataUrl;
  els.clipPreviewWrap.classList.remove('empty');
  els.clipMeta.textContent = `${sw}×${sh} at ${fmtTime(state.selectedTime)}`;
  updateMeta();
}

function updateMeta(){
  if(!state.currentRun){
    els.runTitle.textContent = 'Select a run';
    els.runMeta.textContent = '';
    els.artifactBadge.textContent = 'No run loaded';
    els.artifactBadge.classList.remove('bad');
    els.codexContext.value = '';
    return;
  }
  const run = state.currentRun;
  els.runTitle.textContent = run.summary?.name || run.relDir;
  els.runMeta.textContent = `${run.summary?.persona || 'manual'} · stage ${run.summary?.state?.stage ?? run.summary?.config?.stage ?? '?'} · score ${run.summary?.state?.score ?? 0}`;
  const bad = run.summary?.artifactQuality && !run.summary.artifactQuality.ok;
  els.artifactBadge.textContent = bad ? 'Artifact quality issue' : 'Artifact quality ok';
  els.artifactBadge.classList.toggle('bad', !!bad);
  els.zoomLabel.textContent = `±${state.eventWindow.toFixed(0)}s`;
  els.filterChips.forEach(chip => chip.classList.toggle('active', chip.dataset.filter === state.activeFilter));
  els.codexContext.value = buildCodexContext();
}

function updateTimeline(){
  const duration = Number.isFinite(els.runVideo.duration) ? els.runVideo.duration : (state.currentRun?.summary?.analysis?.duration || 0);
  els.timeline.max = duration || 0;
  els.timeline.value = state.selectedTime;
  els.timeLabel.textContent = `${fmtTime(state.selectedTime)} / ${fmtTime(duration)}`;
  renderTimelineMarkers();
  updateMeta();
  renderCurrentEventCard();
  renderEvents();
  applyVideoTransform();
}

function seekTo(t){
  state.selectedTime = Math.max(0, +t || 0);
  if(Number.isFinite(els.runVideo.duration)) els.runVideo.currentTime = Math.min(state.selectedTime, els.runVideo.duration);
  updateTimeline();
}

async function loadRuns(){
  const data = await getJson('/api/runs');
  state.runs = data.runs || [];
  renderRuns();
  if(state.runs.length) loadRun(state.runs[0].relDir);
}

async function loadRun(relDir){
  const run = await getJson(`/api/run?dir=${encodeURIComponent(relDir)}`);
  state.currentRun = run;
  state.currentEvents = run.session?.session?.events || run.session?.events || [];
  state.selectedTime = 0;
  state.lastRenderedEventKey = '';
  state.activeFilter = 'all';
  state.filterText = '';
  state.selectMode = false;
  els.selectRegionBtn.classList.remove('active');
  els.eventFilterText.value = '';
  resetViewport();
  clearClip();
  els.runVideo.src = run.videoUrl || '';
  els.issueTitle.value = `Bug: ${run.summary?.name || relDir}`;
  renderRuns();
  updateMeta();
  renderEvents();
}

function jumpEvent(dir){
  const events = filteredEvents();
  if(!events.length) return;
  const current = state.selectedTime;
  const target = dir > 0
    ? events.find(evt => (evt.t || 0) > current + 0.01) || events[events.length - 1]
    : [...events].reverse().find(evt => (evt.t || 0) < current - 0.01) || events[0];
  seekTo(target.t || 0);
}

function toggleShortcuts(force){
  const open = typeof force === 'boolean' ? force : !els.shortcutsModal.classList.contains('open');
  els.shortcutsModal.classList.toggle('open', open);
  els.shortcutsModal.setAttribute('aria-hidden', open ? 'false' : 'true');
}

els.runFilter.addEventListener('input', renderRuns);
els.playPause.onclick = () => { if(els.runVideo.paused) els.runVideo.play(); else els.runVideo.pause(); };
els.back5.onclick = () => seekTo(Math.max(0, els.runVideo.currentTime - 5));
els.forward5.onclick = () => seekTo((els.runVideo.currentTime || 0) + 5);
els.zoomOut.onclick = () => { state.eventWindow = Math.min(30, state.eventWindow + 2); updateTimeline(); };
els.zoomIn.onclick = () => { state.eventWindow = Math.max(2, state.eventWindow - 2); updateTimeline(); };
els.selectRegionBtn.onclick = () => {
  state.selectMode = !state.selectMode;
  els.selectRegionBtn.classList.toggle('active', state.selectMode);
  applyVideoTransform();
};
els.clearRegionBtn.onclick = () => clearClip();
els.playbackRate.onchange = () => { els.runVideo.playbackRate = +els.playbackRate.value || 1; };
els.timeline.oninput = () => seekTo(+els.timeline.value || 0);
els.runVideo.addEventListener('timeupdate', () => { state.selectedTime = els.runVideo.currentTime || 0; updateTimeline(); });
els.runVideo.addEventListener('loadedmetadata', () => { resetViewport(); updateTimeline(); });
els.runVideo.addEventListener('play', () => { state.selectMode = false; els.selectRegionBtn.classList.remove('active'); applyVideoTransform(); });
els.runVideo.addEventListener('pause', applyVideoTransform);
els.codexQuestion.addEventListener('input', updateMeta);
els.eventFilterText.addEventListener('input', () => { state.filterText = els.eventFilterText.value; state.lastRenderedEventKey = ''; updateTimeline(); });
els.filterChips.forEach(chip => chip.addEventListener('click', () => { state.activeFilter = chip.dataset.filter; state.lastRenderedEventKey=''; updateTimeline(); }));
els.shortcutsBtn.onclick = () => toggleShortcuts(true);
els.closeShortcuts.onclick = () => toggleShortcuts(false);
els.shortcutsModal.addEventListener('click', e => { if(e.target === els.shortcutsModal) toggleShortcuts(false); });

els.videoViewport.addEventListener('wheel', e => {
  if(!els.runVideo.paused) return;
  e.preventDefault();
  const delta = e.deltaY < 0 ? 0.15 : -0.15;
  state.viewport.scale = Math.max(1, Math.min(8, +(state.viewport.scale + delta).toFixed(2)));
  applyVideoTransform();
}, { passive: false });

els.videoViewport.addEventListener('pointerdown', e => {
  if(!els.runVideo.paused || e.button !== 0) return;
  els.videoViewport.setPointerCapture(e.pointerId);
  state.viewport.pointerId = e.pointerId;
  const p = viewportPoint(e);
  if(state.selectMode){
    state.selectionDraft = { x: p.x, y: p.y, w: 0, h: 0, startX: p.x, startY: p.y };
    updateSelectionBox();
    return;
  }
  state.viewport.dragging = true;
  state.viewport.startX = e.clientX;
  state.viewport.startY = e.clientY;
  state.viewport.originTx = state.viewport.tx;
  state.viewport.originTy = state.viewport.ty;
  els.videoViewport.classList.add('dragging');
});

els.videoViewport.addEventListener('pointermove', e => {
  if(!els.runVideo.paused || state.viewport.pointerId !== e.pointerId) return;
  if(state.selectMode && state.selectionDraft){
    const p = viewportPoint(e);
    const sx = state.selectionDraft.startX;
    const sy = state.selectionDraft.startY;
    state.selectionDraft = { startX: sx, startY: sy, x: Math.min(sx, p.x), y: Math.min(sy, p.y), w: Math.abs(p.x - sx), h: Math.abs(p.y - sy) };
    updateSelectionBox();
    return;
  }
  if(!state.viewport.dragging) return;
  state.viewport.tx = state.viewport.originTx + (e.clientX - state.viewport.startX);
  state.viewport.ty = state.viewport.originTy + (e.clientY - state.viewport.startY);
  applyVideoTransform();
});

els.videoViewport.addEventListener('pointerup', async e => {
  if(state.viewport.pointerId !== e.pointerId) return;
  try { els.videoViewport.releasePointerCapture(e.pointerId); } catch {}
  state.viewport.pointerId = null;
  state.viewport.dragging = false;
  els.videoViewport.classList.remove('dragging');
  if(state.selectMode && state.selectionDraft){
    const draft = state.selectionDraft;
    state.selectionDraft = null;
    if(draft.w >= 8 && draft.h >= 8){
      const tl = viewToVideoPoint(draft.x, draft.y);
      const br = viewToVideoPoint(draft.x + draft.w, draft.y + draft.h);
      state.selection = { x: tl.x, y: tl.y, w: Math.max(1, br.x - tl.x), h: Math.max(1, br.y - tl.y) };
      updateSelectionBox();
      await saveClipFromSelection();
    } else {
      state.selection = null;
      updateSelectionBox();
    }
  }
  applyVideoTransform();
});

document.addEventListener('keydown', e => {
  if(isTypingTarget(e.target)) return;
  const inViewer = document.activeElement === els.viewerPanel || els.viewerPanel.contains(document.activeElement) || document.activeElement === document.body;
  if(!inViewer) return;
  if(e.key === '?'){ e.preventDefault(); toggleShortcuts(); return; }
  if(els.shortcutsModal.classList.contains('open') && e.key === 'Escape'){ e.preventDefault(); toggleShortcuts(false); return; }
  if(!state.currentRun) return;
  if(e.key === ' '){ e.preventDefault(); els.playPause.click(); return; }
  if(e.key === 'ArrowLeft'){ e.preventDefault(); els.back5.click(); return; }
  if(e.key === 'ArrowRight'){ e.preventDefault(); els.forward5.click(); return; }
  if(e.key === 'ArrowUp'){ e.preventDefault(); jumpEvent(-1); return; }
  if(e.key === 'ArrowDown'){ e.preventDefault(); jumpEvent(1); return; }
  if(e.key === ','){ e.preventDefault(); seekTo(state.selectedTime - (e.shiftKey ? 1 : 0.1)); return; }
  if(e.key === '.'){ e.preventDefault(); seekTo(state.selectedTime + (e.shiftKey ? 1 : 0.1)); return; }
  if(e.key === '0'){ e.preventDefault(); resetViewport(); return; }
  if(e.key.toLowerCase() === 'c'){ e.preventDefault(); els.copyPrompt.click(); return; }
  if(e.key.toLowerCase() === 'i'){ e.preventDefault(); els.draftIssue.click(); return; }
  if(['1','2','3','4','5'].includes(e.key)){
    e.preventDefault();
    const map = { '1':'all', '2':'loss', '3':'capture', '4':'stage', '5':'combat' };
    state.activeFilter = map[e.key];
    state.lastRenderedEventKey = '';
    updateTimeline();
  }
});

els.copyPrompt.onclick = async () => {
  const prompt = buildCodexContext();
  await navigator.clipboard.writeText(prompt);
  els.issueStatus.textContent = 'Codex prompt copied.';
};

els.draftIssue.onclick = async () => {
  const prompt = buildCodexContext();
  els.codexContext.value = prompt;
  await navigator.clipboard.writeText(prompt);
  els.issueStatus.textContent = 'Issue body drafted to the context pane and copied.';
};

els.createIssue.onclick = async () => {
  if(!state.currentRun) return;
  els.issueStatus.textContent = 'Creating issue...';
  const nearby = currentWindowEvents().map(humanEvent);
  try {
    const result = await getJson('/api/issues', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: els.issueTitle.value.trim() || `Bug: ${state.currentRun.summary?.name || state.currentRun.relDir}`,
        notes: els.codexQuestion.value.trim(),
        context: buildCodexContext(),
        runId: state.currentRun.relDir,
        time: state.selectedTime,
        videoUrl: state.currentRun.videoUrl,
        sessionUrl: state.currentRun.sessionUrl,
        clipPath: state.clip?.file || null,
        events: nearby
      })
    });
    els.issueStatus.innerHTML = `Issue created: <a href="${result.url}" target="_blank" rel="noreferrer">${result.url}</a>`;
  } catch (err) {
    els.issueStatus.textContent = err.message;
  }
};

loadRuns().catch(err => { els.issueStatus.textContent = err.message; });
