# Home Codex Prompt

Use this prompt when you first start a Codex session on the home machine and
want it to follow the current Aurora Galactica development workflow.

```text
You are working on Aurora Galactica on this machine.

Use the local Codex-Test1 clone as the only development repo, and treat Aurora-Galactica as release-only.

Before doing anything else, find the local Codex-Test1 clone and read these files from it as the workflow source of truth:
- RESTART_FROM_HERE.md
- HOME_MACHINE_SETUP.md
- MULTI_MACHINE_WORKFLOW.md
- HOME_CODEX_PROMPT.md
- README.md
- RELEASE_POLICY.md
- CONTRIBUTING.md
- ARCHITECTURE.md
- SOURCE_MAP.md

Important rules:
- Develop only in Codex-Test1.
- Treat `main` as the only integration branch.
- Respect the committed release authority in `release-authority.json`.
- Do not hand-edit generated files in dist/.
- Build from source with npm run build.
- Use the generated local dev output in dist/dev for local play.
- Follow the documented machine workflow: prefer npm run machine:bootstrap or npm run machine:doctor before starting work.
- Use the documented beta and production publish flow when publishing.
- Prefer npm run local:resume to bring the machine back into a ready local development state with both the game and the log viewer available.
- If any docs disagree, call that out clearly and propose the smallest fix.

Assume the preferred local repo path is the folder I used with the Aurora setup installer.
Common examples:
- ~/Development/Codex-Test1
- a machine-specific iCloud-backed clone path that is not shared as the same working tree across machines

At the start of this session:
1. Check whether the local Codex-Test1 clone exists.
2. If it does not exist, tell me to run the one-command Aurora setup installer.
3. If it does exist:
   - confirm git status
   - run npm run machine:doctor if possible
   - report whether this machine is release authority
   - recommend the exact next commands to refresh this machine to a ready development state
4. Keep the response concise and practical.

When refreshing the machine, prefer this workflow:
- npm run machine:bootstrap

If I ask for a clean shutdown of the local development services, use:
- npm run local:stop

When you report back, use this structure:
- Repo:
- Status:
- Ran:
- Next:
```

## Short Version

If you only want a shorter starter prompt, use:

```text
Read the local Codex-Test1 clone's HOME_MACHINE_SETUP.md, HOME_CODEX_PROMPT.md, README.md, RELEASE_POLICY.md, CONTRIBUTING.md, ARCHITECTURE.md, and SOURCE_MAP.md, then refresh this machine for Aurora Galactica development using:
npm run machine:bootstrap

Use Codex-Test1 as the only development repo, treat Aurora-Galactica as release-only, do not hand-edit dist/, and use npm run local:stop when I want to shut down the local game and viewer cleanly.
```
