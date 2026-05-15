# Supabase Data API Access Contract

Updated: May 14, 2026

Supabase notified the project that public-schema tables will no longer be
implicitly exposed to the Data API.

The dates that matter are:

- **May 30, 2026**: new projects and new public tables in those projects need
  explicit grants before `supabase-js`, PostgREST, or GraphQL can access them.
- **October 30, 2026**: existing projects must also rely on explicit grants.

Aurora / Platinum is affected because the browser runtime and release tooling
use `supabase-js`, which talks to the Supabase Data API.

## Current Data API Surface

| Table | Runtime use | Required client access | Current owner |
| --- | --- | --- | --- |
| `public.scores` | shared leaderboard reads, validated leaderboard reads, production guest score submission, signed-in score submission, test-pilot score reset | `anon`: `select`, `insert`; `authenticated`: `select`, `insert`, `delete`; `service_role`: maintenance access | Platinum shared service |
| `public.profiles` | signed-in pilot initials and account profile record | `authenticated`: `select`, `insert`, `update`; `service_role`: maintenance access | Platinum shared service |

The maintained SQL access contract is:

- [supabase/data-api-access-contract.sql](supabase/data-api-access-contract.sql)

The contract is intentionally not a full database schema. It records the
browser-visible tables, required grants, and RLS policies that make the current
runtime behavior reproducible.

## Release Gate

The automated source gate is:

```bash
npm run harness:check:supabase-data-api-contract
```

The checker verifies:

- every `supabase.from('table')` runtime/tooling usage is represented in the
  SQL contract
- `scores` and `profiles` have explicit role grants
- RLS is enabled for both tables
- the expected policy names are present
- the maintained explainer document records the Supabase deadline dates and
  links to the SQL contract

Publish preflight also runs this gate, so a future branch that adds a table for
features such as YouTube high-score posts, replay video metadata, or richer
pilot records must update the Supabase access contract before it can move
through the release path.

## Current Risk Read

Existing hosted tables are not expected to break immediately from the May 30
change because Supabase says existing grants remain in place. The project risk
is reproducibility: without committed grants and RLS policy expectations, a new
project, a restored database, or a new feature table can fail even while local
code looks correct.

The October 30, 2026 deadline makes this a release-hardening concern rather than
a someday cleanup item.

There is a separate score-trust boundary to keep visible: the current browser
client writes `is_verified` as part of signed-in score submission. The access
contract preserves today's behavior, but a stronger future verified-score model
should set that field through a server-owned path, trigger, or RPC rather than
trusting client-supplied metadata.

## Future Table Rule

Any new Supabase table used by the browser Data API must land with:

- table purpose and ownership
- explicit grants for `anon`, `authenticated`, and/or `service_role`
- RLS enabled unless there is a documented exception
- policies that express the user-visible product rule
- a harness/preflight update proving the table is present in this contract

For planned top-10 YouTube posting and replay-video metadata, this means no
runtime feature work should merge until the data model and access policy are
captured here.
