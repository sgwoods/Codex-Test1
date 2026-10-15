#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { createHash } = require('crypto');
const { ROOT, withHarnessPage } = require('./browser-check-util');
const { DIST_DEV } = require('../build/paths');

async function main(){
  execFileSync(process.execPath, [path.join(ROOT, 'tools/build/build-index.js')], { cwd: ROOT, stdio: 'pipe' });
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
  const out = path.join(ROOT, 'reference-artifacts/analyses/challenge-contact-review',
    `${new Date().toISOString().replace(/[:.]/g, '-')}-${commit.slice(0, 8)}`);
  fs.mkdirSync(out, { recursive: true });
  const results = [];
  for(const stage of [31, 35, 39]){
    const result = await withHarnessPage({ skipStart: true, stage }, async ({ page }) => page.evaluate(stage => {
      const h = window.__galagaHarness__;
      h.start({ controlledClock: true, stageMode: 'display', startKind: 'challenge',
        challengeStage: (stage + 1) / 4, stage, ships: 3, persona: null,
        expertPlays: 'human', playerTwo: false, autoVideo: false, seed: 9100 + stage });
      const initial = h.snapshot(), seen = new Set(), contacts = [];
      let maximumEnemyBullets = 0, maximumAttackers = 0, completed = false;
      for(let frame = 0; frame < 3600; frame++){
        h.advanceFor(1 / 60, { step: 1 / 60, stopOnGameOver: false });
        const state = h.snapshot();
        maximumEnemyBullets = Math.max(maximumEnemyBullets, state.counts.enemyBullets);
        maximumAttackers = Math.max(maximumAttackers, state.counts.attackers);
        for(const event of h.recentEvents({ count: 200 })){
          if(event.type !== 'challenge_enemy_contact' || seen.has(event.id)) continue;
          seen.add(event.id);
          contacts.push({ event, frame, simT: state.simT,
            diagnostic: h.challengeContactDiagnostics(event.id),
            png: document.getElementById('c').toDataURL('image/png') });
        }
        if(!h.challengeFormationState().enemies.length){ completed = true; break; }
      }
      return { stage, seed: 9100 + stage, initial, final: h.snapshot(),
        maximumEnemyBullets, maximumAttackers, completed, contacts };
    }, stage));
    for(const contact of result.contacts){
      const file = `stage-${stage}-target-${contact.event.id}-frame-${contact.frame}.png`;
      const bytes = Buffer.from(contact.png.split(',')[1], 'base64');
      fs.writeFileSync(path.join(out, file), bytes);
      delete contact.png;
      contact.capture = { file, sha256: createHash('sha256').update(bytes).digest('hex') };
      contact.disposition = 'pending-visual-review';
    }
    results.push(result);
  }
  const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const report = { commit, generatedAt: new Date().toISOString(),
    buildInfo: JSON.parse(fs.readFileSync(path.join(DIST_DEV, 'build-info.json'), 'utf8')),
    method: 'Stationary human/no-fire, one seed per stage, 60Hz controlled clock; advanceFor draws before capturing the first logged contact for each target.',
    methodHash: hash(__filename), bundleHash: hash(path.join(DIST_DEV, 'index.html')),
    sourceHashes: Object.fromEntries(['05-player-combat.js', '06-enemy-behavior.js', '90-harness.js'].map(file => [file, hash(path.join(ROOT, 'src/js', file))])),
    limitations: ['First contact frame only; not complete moving-player or multi-seed coverage.',
      'Rendered canvas is visual evidence, not an automated pixel-overlap or readability verdict.',
      'No contact is accepted automatically; no release-readiness verdict.'], results };
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ out, stages: results.map(r => ({ stage: r.stage, contacts: r.contacts.length,
    completed: r.completed, maximumEnemyBullets: r.maximumEnemyBullets, maximumAttackers: r.maximumAttackers })) }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
