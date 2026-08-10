# Vibe Coding Guide — HAL Jarvis v2

## Why this exists
Every new chat with a coding agent starts with zero memory of yesterday.
Without a fixed doc set, the only way to get an agent up to speed is to
paste the whole codebase (slow, expensive, and it still misses the *why*
behind decisions) or re-explain everything from scratch (error-prone,
inconsistent every time). This doc set is the fix: a small, fixed
collection of files that carry forward everything a new agent actually
needs — architecture, contracts, decisions and their reasoning, test
invariants, and open work — so a fresh session reads six files, not the
repo, and starts productive immediately.

## The doc set

The seven questions a fresh agent needs answered, and which file answers
each one — this mapping is the whole point of splitting into separate
files instead of one big README. If information goes in the wrong file,
the next agent won't find it when they need it.

| Question | File |
|---|---|
| "What is this and how do I get oriented?" | `AGENTS.md` |
| "How is it built, right now?" | `ARCHITECTURE.md` |
| "What can I call, and what does it return?" | `API_CONTRACTS.md` |
| "Why is it built that way, and what did we already try that didn't work?" | `DECISIONS.md` |
| "How do I know if I broke something?" | `TESTING.md` |
| "What's still open?" | `TODO_BACKLOG.md` |
| "How does this repo actually talk to the other one?" | `FRONTEND_INTEGRATION.md` / `BACKEND_INTEGRATION.md` |
| "Where does each phase actually stand?" | `PHASE_REPORT.md` (shared, architect-maintained) |
| "Have we hit something like this before?" | `PREVIOUS_ISSUES.md` (shared) |

### `AGENTS.md` — orientation and ground rules
**Purpose**: the first file read, gets an agent from zero to productive.
**Contains**: one-paragraph project summary; stack; directory map (where
things actually live on disk); concrete commands (run tests, restart the
service, check logs); who's who (architect/reviewer, backend agent,
frontend agent, QA agent, and how they hand off to each other); the
non-negotiable rules as a short bullet list *with a pointer to
`DECISIONS.md` for the reasoning behind each one*, not the reasoning
itself.
**Does NOT contain**: deep rationale (→ `DECISIONS.md`), the full schema
(→ `ARCHITECTURE.md`), open work (→ `TODO_BACKLOG.md`).
**Boundary test**: if a sentence explains *why* something is a rule, it
belongs in `DECISIONS.md` with a one-line reference left here instead.

### `ARCHITECTURE.md` — current state, as built
**Purpose**: a snapshot of what exists right now — kept current, not an
append-only log.
**Contains**: phase status (what's done/in-progress/not-started); the
full data model (every table, every column, relationships); a one-line
description of what each service/module file does; the actual data flow
in words (e.g. discovery job → `meta_form_mappings` cache → poll job →
two-tier parser → resubmission check → DB); deployment topology (systemd
unit name, port, reverse proxy, live domain); scheduler configuration.
**Does NOT contain**: why a choice was made over an alternative (→
`DECISIONS.md`); what's broken or deferred (→ `TODO_BACKLOG.md`).
**Boundary test**: this file should always describe *what's true right
now* — if something changes, edit this file in place rather than adding a
new section; history belongs in `DECISIONS.md`, not here.

### `API_CONTRACTS.md` — the interface contract, shared verbatim
**Purpose**: single source of truth for every endpoint. This is the file
QA blind-tests against and the file the frontend codes against — if it's
wrong or incomplete, both sides build on a false premise.
**Contains**: every endpoint (method, path, auth requirement), full
request/response schemas with real example JSON (not abstract
descriptions), every enum, explicit callouts for anything non-obvious
(e.g. two endpoints that look similar but return deliberately different
shapes, fields that exist in the live API but aren't "official" yet).
**Does NOT contain**: how an endpoint is implemented internally — purely
the black-box contract, nothing about the code behind it.
**Boundary test**: if a fact would still be true even if the whole
backend were rewritten from scratch in a different language, it belongs
here. If it's about the current implementation, it doesn't.

### `DECISIONS.md` — why, in chronological order, never deleted
**Purpose**: institutional memory. Prevents a future agent from
re-proposing something that was already tried and reverted, and preserves
the reasoning behind rules that would otherwise look arbitrary.
**Contains**: one entry per real judgment call or incident — what was
decided, what alternative(s) were considered or tried first, and why the
final choice won. Especially: every incident that produced a new rule
(e.g. "first-sync detection originally keyed off `meta_sync_runs` having
any row; a failed zero-lead run defeated this and caused real historical
leads to be flagged `is_old_lead: false`; fixed by keying off whether any
lead has ever been created instead").
**Does NOT contain**: current-state architecture (→ `ARCHITECTURE.md`) —
don't re-describe the schema here, just the reasoning for choices about it.
**Boundary test**: entries are **append-only**. If a decision gets
superseded later, add a new entry marking the old one superseded and
explain why — never delete or rewrite history, since the point is
precisely to stop old mistakes from being quietly retried.

### `TESTING.md` — what must never regress
**Purpose**: the concrete, checkable invariants and the real (not
synthetic) fixture data that has actually caught bugs before.
**Contains**: test-database isolation rules and how they're enforced;
the hard invariant list (e.g. every first-sync lead shows `is_old_lead:
true`, exactly one `is_first_run: true` system-wide, `is_old_lead` is
never patchable); known real fixture record IDs with their expected
correct values (the specific lead IDs from real campaign data that have
exposed real parsing bugs); the exact command to run the suite and where
it lives.
**Does NOT contain**: the story of every historical bug (→
`DECISIONS.md`) — only the regression cases that are *still relevant
right now*.
**Boundary test**: everything here should be something a QA agent or
test suite can mechanically check today. If it's a narrative, it belongs
in `DECISIONS.md` instead.

### `TODO_BACKLOG.md` — the open queue
**Purpose**: nothing gets forgotten between sessions, and nothing gets
impulsively fixed mid-ticket instead of being logged and prioritized
deliberately.
**Contains**: each open item — what it is, why it matters, what it's
blocked on (if anything), when it was noticed; explicit open questions
that need a human decision, not an agent guess.
**Does NOT contain**: resolved items — once done, remove the entry (or
move it to a changelog if you want history); this is a queue, not an
archive.
**Boundary test**: if it's still true and unresolved, it stays; the
moment it's fixed, it comes out.

### `FRONTEND_INTEGRATION.md` (backend repo) / `BACKEND_INTEGRATION.md` (frontend repo)
**Purpose**: the operational glue between the two repos that isn't part
of the endpoint contract itself but has caused real incidents when wrong.
**Contains**: the actual current domains/URLs on both sides; CORS
configuration and allow-list; auth mechanism specifics; environment
variables each side expects (e.g. `VITE_API_BASE_URL`); known integration
footguns (e.g. campaign UUIDs regenerate on every DB resync, so bookmarked
detail-page URLs go stale; two endpoints that look alike but have
different response shapes).
**Does NOT contain**: the endpoint-by-endpoint contract itself (→
`API_CONTRACTS.md`) — this file is about *keeping the connection working*,
not what each call returns.
**Boundary test**: if the fact would matter even for an endpoint that
isn't part of the public contract yet (e.g. "which port is actually
listening"), it belongs here, not in `API_CONTRACTS.md`.

### `PHASE_REPORT.md` — progress against the plan, architect-maintained
**Purpose**: answers "where does each phase actually stand," at a glance,
without reconstructing it from scanning the whole project history.
**Contains**: one section per phase (per `PHASE_PLAN.md`'s original 6),
each with: status (not started / in progress / blocked / passed QA /
signed off), the original exit criteria, which of them are actually met
right now with evidence, known open gaps, date of last review.
**Does NOT contain**: system structure (→ `ARCHITECTURE.md`); the
reasoning behind decisions (→ `DECISIONS.md`).
**Who maintains it**: unlike the other files, this one is **updated by
the architect after each review round**, not by the coding agents as part
of their own definition-of-done — phase-gate sign-off is a review
judgment, not something either agent should self-certify.
**Boundary test**: if it answers "is this phase done," it's here. If it
answers "how does this feature work," it's `ARCHITECTURE.md`.

### `PREVIOUS_ISSUES.md` — fast, scannable incident lookup
**Purpose**: a new agent (or a human) facing something that *looks like*
a previously-solved problem should be able to grep this file and find out
in seconds, rather than reading `DECISIONS.md`'s narrative log end to end.
**Contains**: a table — symptom, root cause, fix, prevention rule, and
whether a regression test now covers it. One row per real incident —
**"real" means it actually happened in a running system and was
confirmed with evidence** (an agent's report, a live test, a curl
result), not a mistake caught and corrected during planning before
anything was built or sent to an agent. A wrong draft that never shipped
isn't an incident; it's just iteration.
**Does NOT contain**: judgment calls that were never bugs (e.g. "chose
PostgreSQL over SQLite") — those stay in `DECISIONS.md`. Also does not
contain corrections to the architect's own guidance mid-conversation —
only things that happened in the actual codebase/system.
**Boundary test**: if it's "X went wrong because Y, here's the fix and
the rule that prevents it again," it's here — but only if X actually
happened somewhere real. If it's "we chose X over Y and here's why," it's
`DECISIONS.md`. If it's "a plan was wrong and got corrected before
anyone acted on it," it's neither — it doesn't need a permanent record.

## Two repos, three shared files
Backend repo (`backendv2/`): `AGENTS.md`, `ARCHITECTURE.md`,
`DECISIONS.md`, `TESTING.md`, `TODO_BACKLOG.md`, `FRONTEND_INTEGRATION.md`.

Frontend repo: `AGENTS.md`, `ARCHITECTURE.md`, `DECISIONS.md`,
`TESTING.md`, `TODO_BACKLOG.md`, `BACKEND_INTEGRATION.md` — same purposes
as above, frontend side.

**Shared, not duplicated** — copy verbatim into both repos, maintain in
one place: `API_CONTRACTS.md`, `PHASE_REPORT.md`, `PREVIOUS_ISSUES.md`.
Incidents and phase status usually span both sides of the system —
splitting them per repo would defeat the point of "search this before you
repeat a mistake." If either repo needs something these don't document,
that's a signal to update the one shared file, not fork it.

## The three standard prompts (`STANDARD_PROMPTS.md`)
1. **Bug Fix** — for anything broken. Forces the agent to name the owning
   module and root cause before touching code, and to avoid re-reading the
   world.
2. **Feature** — for anything new. Forces smallest-scope implementation
   and mandatory doc updates as part of the same task, not a follow-up.
3. **QA Blind Test** — new, not in the original two-prompt version. This
   project's actual practice has been: backend builds, QA blind-tests
   against API docs only (no code access), architect reconciles both
   reports. That third leg needs its own standard prompt or it keeps
   getting improvised per-ticket.

## Definition of done — non-negotiable
A task isn't finished when the code works. It's finished when:
- `API_CONTRACTS.md` reflects any new/changed endpoint.
- `DECISIONS.md` has an entry if a real judgment call was made (not just
  "implemented X" — the *why*, especially if it deviates from an existing
  pattern).
- `TODO_BACKLOG.md` has anything deferred or discovered-but-out-of-scope
  added to it.
- `TESTING.md` / the regression suite covers the new behavior.

Skipping doc updates because "the code is what matters" is exactly how
this project ended up with undocumented gaps (missing summary endpoints,
missing campaign-leads endpoint) that only surfaced as frontend errors
days later instead of being visible in a contract diff.

## Rules that apply regardless of which file/module is being touched
These came from real incidents in this project, not hypotheticals — see
`backend/DECISIONS.md` for the full story on each:
- `is_old_lead` is structural, never patchable, and first-sync detection
  keys off "has any lead ever been created," not "does a sync-run row
  exist."
- One send-enforcement function (`send_guard`), every send path routes
  through it.
- Manually-created and system-created records (leads, campaigns) go
  through the **same** ingestion code path — never a parallel one.
- Retry only on 429/5xx. Never retry 401/403 — that's a permissions
  problem needing a human, not a transient failure.
- Test databases are isolated (`hal_test`). No test run ever touches
  `hal_v2`, and `hal_v2` is never truncated as a side effect of an
  unrelated ticket.
- Every sync/job run reports honestly — a failure never gets reported as
  a clean success.

## How to use this with a fresh agent
Open a new chat, paste the relevant Standard Prompt, and the agent's first
instruction is to read the fixed doc list — not the repo. If a task
genuinely requires reading actual source (e.g. "why is this specific
function slow"), that's fine — the docs get it oriented fast, then it digs
into the specific file that matters, not the whole tree.