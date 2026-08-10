# Standard Prompts

Copy the relevant block below into a fresh chat with the coding agent.
Swap the reading list for the frontend set when working in that repo.

---

## 1. Standard Bug Fix Prompt

Read:
- AGENTS.md
- ARCHITECTURE.md
- API_CONTRACTS.md
- TESTING.md
- DECISIONS.md
- TODO_BACKLOG.md
- FRONTEND_INTEGRATION.md *(backend repo only — omit if frontend repo,
  use BACKEND_INTEGRATION.md instead)*

**Bug Description:**
[describe the bug — what's broken, what you expected, concrete evidence
if you have it: error messages, response bodies, screenshots]

**Requirements:**
1. Identify the affected module.
2. Identify the likely root cause — state it before proposing a fix, and
   if two explanations are both plausible, say so and propose a cheap way
   to distinguish them rather than guessing.
3. Do NOT modify certified/working modules unless absolutely necessary.
4. Propose the minimal fix — not a rewrite, not an opportunistic
   refactor of adjacent code.
5. Update documentation (`DECISIONS.md` if this reveals something worth
   remembering, `TODO_BACKLOG.md` if it surfaces follow-on work).
6. Add or update an acceptance test covering this exact bug so it can't
   silently regress.
7. Explain why the bug occurred — not just what the fix does.

Do not read the entire repository unless necessary.

---

## 2. Standard Feature Prompt

Read:
- AGENTS.md
- API_CONTRACTS.md
- ARCHITECTURE.md
- DECISIONS.md
- TESTING.md
- TODO_BACKLOG.md
- FRONTEND_INTEGRATION.md *(backend repo only)*

**Feature Request:**
[describe what's needed]

**Requirements:**
1. Determine the owning module.
2. Do not modify certified modules unless required by this feature.
3. Implement in the smallest possible scope — resist bundling unrelated
   improvements into the same change.
4. Add acceptance tests.
5. Update `API_CONTRACTS.md` if any endpoint is new or changed.
6. Update `AGENTS.md` if setup, roles, or non-negotiable rules change.
7. Update `TODO_BACKLOG.md` if anything is deferred or discovered along
   the way.
8. Explain the architectural impact — what this touches beyond the
   immediate feature, if anything.

No undocumented changes.

---

## 3. Standard QA Blind Test Prompt

You are testing the **live, running API as a black box.** You do not have
the source code and should not ask for it. Where a prior report makes a
claim, verify it independently rather than transcribing it.

Read:
- API_CONTRACTS.md
- TESTING.md (for known fixture data and existing invariants — treat
  these as ground truth to check against, not as things to assume are
  still true)

**What changed since the last QA pass:**
[describe the feature/fix being tested]

**Requirements:**
1. Test the specific new/changed behavior first.
2. Re-run every existing invariant in `TESTING.md` that this change could
   plausibly have affected — don't assume something unrelated stayed
   correct.
3. For anything not observable from outside the API (code structure,
   which driver/library was used, whether two code paths are actually one)
   — don't guess or skip silently. List it explicitly as "not testable
   via black-box API access, route back as a direct question."
4. Report PASS / FAIL / UNTESTABLE per case, with raw request/response
   evidence for every FAIL. State findings plainly — no "mostly working."
5. If this pass adds new permanent invariants, note them for
   `TESTING.md` so they get folded into the regression suite rather than
   tested once and forgotten.