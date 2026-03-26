const state = {
  runs: [],
  filteredRuns: [],
  currentRun: null,
  currentEvents: [],
  selectedTime: 0
};

const els = {
  runFilter: document.getElementById('runFilter'),
  runList: document.getElementById('runList'),
  runTitle: document.getElementById('runTitle'),
  runMeta: document.getElementById('runMeta'),
  artifactBadge: document.getElementById('artifactBadge'),
  runVideo: document.getElementById('runVideo'),
  playPause: document.getElementById('playPause'),
  back5: document.getElementById('back5'),
  forward5: document.getElementById('forward5'),
  playbackRate: document.getElementById('playbackRate'),
  timeline: document.getElementById('timeline'),
  timeLabel: document.getElementById('timeLabel'),
  eventList: document.getElementById('eventList'),
  eventMeta: document.getElementById('eventMeta'),
  codexQuestion: document.getElementById('codexQuestion'),
  issueTitle: document.getElementById('issueTitle'),
  codexContext: document.getElementById('codexContext'),
  copyPrompt: document.getElementById('copyPrompt'),
  draftIssue: document.getElementById('draftIssue'),
  createIssue: document.getElementById('createIssue'),
  issueStatus: document.getElementById('issueStatus')
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
  if(evt.cause) extras.push(evt.cause.replaceAll('_',' '));
  if(evt.enemyType) extras.push(evt.enemyType);
  if(evt.mode) extras.push(evt.mode);
  if(evt.hits != null && evt.total != null) extras.push(`${evt.hits}/${evt.total}`);
  return `${fmtTime(evt.t)}  ${evt.type.replaceAll('_',' ')}${extras.length ? ' · ' + extras.join(' · ') : ''}`;
}

function currentWindowEvents(){
  const around = state.selectedTime;
  return state.currentEvents.filter(evt => Math.abs((evt.t || 0) - around) <= 1.5).slice(0, 16);
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
    `Lives: ${summary.state?.lives ?? '(unknown)'}`,
    '',
    'Nearby events:'
  ];
  for(const evt of nearby) lines.push(`- ${humanEvent(evt)}`);
  if(!nearby.length) lines.push('- none near current timestamp');
  if(els.codexQuestion.value.trim()){
    lines.push('', 'Question / notes:', els.codexQuestion.value.trim());
  }
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

function renderEvents(){
  const focus = state.selectedTime;
  const events = state.currentEvents;
  const html = events.map(evt => {
    const active = Math.abs((evt.t || 0) - focus) < 0.15 ? 'active' : '';
    return `<div class="event-item ${active}" data-time="${evt.t || 0}"><span class="event-type">${fmtTime(evt.t)}</span> ${evt.type.replaceAll('_',' ')} ${humanEvent(evt).split('  ').slice(1).join('  ')}</div>`;
  }).join('');
  els.eventList.innerHTML = html || '<div class="meta">No events found.</div>';
  els.eventMeta.textContent = `${events.length} events`;
  for(const row of els.eventList.querySelectorAll('.event-item')) row.onclick = () => seekTo(+row.dataset.time || 0);
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
  els.codexContext.value = buildCodexContext();
}

function updateTimeline(){
  const v = els.runVideo;
  const duration = Number.isFinite(v.duration) ? v.duration : (state.currentRun?.summary?.analysis?.duration || 0);
  els.timeline.max = duration || 0;
  els.timeline.value = state.selectedTime;
  els.timeLabel.textContent = `${fmtTime(state.selectedTime)} / ${fmtTime(duration)}`;
  updateMeta();
  renderEvents();
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
  els.runVideo.src = run.videoUrl || '';
  els.issueTitle.value = `Bug: ${run.summary?.name || relDir}`;
  renderRuns();
  updateMeta();
  renderEvents();
}

els.runFilter.addEventListener('input', renderRuns);
els.playPause.onclick = () => { if(els.runVideo.paused) els.runVideo.play(); else els.runVideo.pause(); };
els.back5.onclick = () => seekTo(Math.max(0, els.runVideo.currentTime - 5));
els.forward5.onclick = () => seekTo((els.runVideo.currentTime || 0) + 5);
els.playbackRate.onchange = () => { els.runVideo.playbackRate = +els.playbackRate.value || 1; };
els.timeline.oninput = () => seekTo(+els.timeline.value || 0);
els.runVideo.addEventListener('timeupdate', () => { state.selectedTime = els.runVideo.currentTime || 0; updateTimeline(); });
els.runVideo.addEventListener('loadedmetadata', updateTimeline);
els.codexQuestion.addEventListener('input', updateMeta);

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
        events: nearby
      })
    });
    els.issueStatus.innerHTML = `Issue created: <a href="${result.url}" target="_blank" rel="noreferrer">${result.url}</a>`;
  } catch (err) {
    els.issueStatus.textContent = err.message;
  }
};

loadRuns().catch(err => { els.issueStatus.textContent = err.message; });
