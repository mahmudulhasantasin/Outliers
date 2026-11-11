<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Frontend Agent Instructions

## Primary workflow
- Before source-code exploration, read `.context-engine/PROJECT_CONTEXT.md` and `.context-engine/project_map.md` if they exist.
- Use the `incremental-context` skill for repository initialization, feature work, debugging, refactoring, and code review.
- For a new repository or incomplete context, use INITIALIZATION_MODE.
- For an initialized repository, use INCREMENTAL_MODE.
- Do not repeat a full repository analysis unless context is missing, stale, inconsistent, or the task requires it.

## Source-of-truth hierarchy
1. Current frontend source code (`src/app/`, `src/components/`, `src/context/`, `src/lib/`, `src/data/`) and configs are authoritative for implementation behavior.
2. Git is authoritative for tracked change history.
3. `.context-engine/` is a knowledge cache and navigation aid, not source code truth.
4. Serena is a semantic navigation tool, not a replacement for reading relevant source.

## Change safety
- Never discard, reset, stash, or overwrite user changes.
- Inspect `git status` and relevant diffs before editing.
- Do not overwrite existing documentation without reviewing and merging it.
- Do not modify unrelated files.
- Do not run destructive commands, dependency installs, formatters, or broad auto-fixers unless explicitly authorized.

## Retrieval and correctness
- Prefer symbol-level retrieval and targeted file sections.
- Inspect callers, callees, interfaces, schemas, configuration, and state hooks when needed.
- Expand the investigation if evidence is incomplete or contradictory.
- Do not minimize reading at the expense of correctness, security, or compatibility.

## Context maintenance
- Update project context when architecture, module boundaries, APIs, contexts, dependencies, or important UI conventions change.
- Do not rewrite context for routine component tweaks or style changes that do not alter architecture.
- Record uncertainty and unknowns explicitly; never invent architecture details.
- Keep secrets, credentials, private keys, tokens, `.env` values, and personal data out of context files.
