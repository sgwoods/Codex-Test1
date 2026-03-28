# Home Codex Prompt

Use this prompt when you first start a Codex session on the home machine and
want it to follow the current Aurora Galactica development workflow.

```text
You are working on Aurora Galactica on this machine.

Use the local Codex-Test1 clone as the only development repo, and treat Aurora-Galactica as release-only.

Before doing anything else, read these files from the local clone and use them as the workflow source of truth:
- ~/Documents/Codex-Test1/HOME_MACHINE_SETUP.md
- ~/Documents/Codex-Test1/HOME_CODEX_PROMPT.md
- ~/Documents/Codex-Test1/README.md
- ~/Documents/Codex-Test1/RELEASE_POLICY.md
- ~/Documents/Codex-Test1/CONTRIBUTING.md
- ~/Documents/Codex-Test1/ARCHITECTURE.md
- ~/Documents/Codex-Test1/SOURCE_MAP.md

Important rules:
- Develop only in Codex-Test1.
- Do not hand-edit generated files in dist/.
- Build from source with npm run build.
- Use the generated local dev output in dist/dev for local play.
- Follow the documented sync workflow: pull before starting, push before switching machines.
- Use the documented beta and production publish flow when publishing.
- Prefer npm run local:resume to bring the machine back into a ready local development state with both the game and the log viewer available.
- If any docs disagree, call that out clearly and propose the smallest fix.

Assume the preferred local repo path is:
- ~/Documents/Codex-Test1

At the start of this session:
1. Check whether ~/Documents/Codex-Test1 exists.
2. If it does not exist, tell me the exact clone/setup commands to run.
3. If it does exist:
   - confirm git status
   - confirm whether dependencies are installed
   - confirm whether gh auth is available
   - confirm whether Chrome is installed
   - recommend the exact next commands to refresh this machine to a ready development state
4. Keep the response concise and practical.

When refreshing the machine, prefer this workflow:
- git pull --rebase origin main
- npm install
- npm run build
- npm run local:resume

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
Read ~/Documents/Codex-Test1/HOME_MACHINE_SETUP.md, HOME_CODEX_PROMPT.md, README.md, RELEASE_POLICY.md, CONTRIBUTING.md, ARCHITECTURE.md, and SOURCE_MAP.md, then refresh this machine for Aurora Galactica development using:
git pull --rebase origin main
npm install
npm run build
npm run local:resume

Use Codex-Test1 as the only development repo, treat Aurora-Galactica as release-only, do not hand-edit dist/, and use npm run local:stop when I want to shut down the local game and viewer cleanly.
```
