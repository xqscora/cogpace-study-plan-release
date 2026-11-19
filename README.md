# Study Plan Recovery

A standalone browser tool for rebuilding a study plan when available time shrinks. It keeps prerequisite relationships, compares the current and proposed plans, explains deferred work, and changes the current plan only after explicit adoption.

## Run

Open `index.html` in a browser. No build step, model, account, API, or network-backed storage is required.

Run the tests with:

```powershell
node --test test_planner.js
```

## Scope

This package contains only the competition planner, a small browser UI, and tests. It does not contain the older adaptive tutor, question bank, Aura/Cerome components, attention research code, or model adapters. Tasks are synthetic; the planner has not been evaluated with students. Entries remain in page memory and are not sent or saved.

The planner exhaustively searches at most 16 tasks. It maximizes the count of whole tasks that fit, subject to prerequisites, and uses input order as the tie-break. It does not estimate learning value or claim this policy is optimal for students.

## Provenance and disclosure

The initial planner and study-plan recovery workflow came from public commit `74ed5cc0ef89d849c9e5616f6e3d8f1c88776686` in `xqscora/cogpace`; this isolated browser implementation is a separate release candidate and does not change the existing Devpost page or repository. AI coding assistance was used to assemble and test this candidate. The project owner should review and understand all code and disclosures before any public update.
