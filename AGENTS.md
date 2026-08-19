# Halflight Agent Guide

This file contains repository workflow instructions for coding agents. It does
not define how Halflight plays. The authoritative gameplay rules live in
[`GAME_SPEC.md`](./GAME_SPEC.md).

## Required context

Before making changes:

1. Read this file and `GAME_SPEC.md` in full.
2. Inspect `git status` and preserve all pre-existing work, including untracked
   files. Never discard, overwrite, or reformat unrelated user changes.
3. Read the smallest relevant part of the code before editing it. The browser
   entry point is `src/main.tsx`, the main game is implemented in
   `app/game.tsx`, and its styling is in `app/globals.css`.
4. Keep the existing npm/Vite/React structure and lockfile unless the task
   specifically requires an architectural change. The production target is a
   static GitHub Pages site.

## Documentation boundary

- Put agent workflow, repository conventions, testing expectations, and
  delivery rules in `AGENTS.md`.
- Put player-facing rules, controls, balance values, content, progression, and
  win/loss behavior in `GAME_SPEC.md`.
- Do not copy gameplay tables or balance values into this file.
- When a code change alters gameplay, update `GAME_SPEC.md` in the same change.
  When a workflow changes, update this file instead.
- If the implementation and game spec disagree, do not silently choose one.
  Resolve the mismatch as part of the task and mention the resolution in the
  handoff.

## Implementation rules

- Keep changes focused on the requested outcome. Avoid unrelated cleanup and
  speculative features.
- Preserve keyboard, pointer, and touch support when changing an interaction.
- Preserve accessible names and semantic controls when changing the interface.
- Keep simulation rules in the game model/update functions and presentation in
  the rendering/UI layer where practical.
- Avoid adding dependencies when the platform or current code can handle the
  task. If a dependency is necessary, use npm and commit both `package.json`
  and `package-lock.json`.
- Do not commit secrets, `.env` files, generated build output, dependency
  directories, or local runtime state.
- Preserve the relative Vite base path and static-site compatibility required
  for deployment under the `/halflight/` GitHub Pages project path.

## Validation

Run checks appropriate to every change before delivery:

- `npm run build` is the minimum required check for application changes. It
  includes the TypeScript no-emit check and the production Vite build.
- Run `npm run lint` for TypeScript, React, CSS-adjacent component, or lint
  configuration changes.
- There is no automated gameplay test command yet. Add or update focused tests
  when practical for new logic, and document any new test command here.
- For documentation-only changes, inspect the rendered Markdown structure,
  links, and `git diff`; an application rebuild is unnecessary unless the docs
  change executable configuration.
- Never claim a check passed unless it was actually run. Report any skipped or
  failing check with the reason.

The workflow at `.github/workflows/deploy-pages.yml` builds and publishes the
site after changes reach `main`. Preserve that workflow unless a task explicitly
changes deployment.

## Git and GitHub delivery

Every completed task must be committed and pushed to GitHub unless the user
explicitly says not to commit or not to push.

1. Review `git status` and `git diff` before committing.
2. Stage only files changed for the current task. Never absorb unrelated work
   into the commit.
3. Use a concise, descriptive commit message.
4. Push the current branch to its configured GitHub upstream. If `origin`
   exists but the branch has no upstream, use `git push -u origin HEAD`.
5. Verify that the push succeeded and report the branch and commit in the final
   handoff.

Never force-push, rewrite shared history, delete a branch, or change a remote
without explicit user approval. If no GitHub remote exists, authentication is
missing, branch protection rejects the update, or the push otherwise fails,
keep the local commit intact and clearly tell the user what must be configured
or resolved. Do not pretend the task was pushed.

## Handoff

End each task with a concise summary of:

- what changed;
- which checks ran and their results;
- the commit and GitHub push result; and
- any real limitation or follow-up the user needs to know about.
