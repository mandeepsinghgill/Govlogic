# Repository Guidelines

## Project Structure & Module Organization
- `src/pages` defines routed experiences (dashboards, grants, capture, etc.); pair shared UI in `src/components` so pages stay thin.
- `src/services` centralizes HTTP clients and axios helpers; colocate Zustand slices in `src/store` and share primitives via `src/lib`, `src/utils`, and strongly typed contracts in `src/types`.
- Hooks such as `src/hooks/useAutoLogout.ts` handle cross-cutting behavior; test specs live in `src/__tests__` with global setup in `src/setupTests.ts`.
- Static assets come from `public/`; Vite, Tailwind, and TypeScript configs sit at the repo root next to linting and Jest configs for quick adjustments.

## Build, Test, and Development Commands
- `npm run dev` (or `pnpm dev`) starts the Vite dev server on `localhost:5173` with hot module reload.
- `npm run build` emits the optimized bundle into `dist/`; pair it with `npm run preview` or `npm run start` to sanity-check production output.
- `npm run lint` enforces ESLint rules over `src/**/*.ts(x)`; run before opening a PR to catch unused imports or tailwind typos.
- `npm run type-check` runs `tsc --noEmit` to verify shared types before committing API contracts.

## Coding Style & Naming Conventions
- Stick to TypeScript, function components, and hooks; prefer composition over inheritance and extract logic into `useSomething` hooks when reused twice.
- Follow the existing two-space indentation and single quotes shown in `src/App.tsx`; order imports as React, third-party, then local aliases.
- Tailwind classes should stay utility-first and grouped by layout → spacing → color (e.g., `flex items-center gap-2 text-slate-600`), and component filenames use `PascalCase.tsx`.
- Run `npm run lint` before pushing; no automatic formatter is configured, so keep diffs minimal and terminate files with a newline.

## Testing Guidelines
- Jest with `@testing-library/react` drives component tests; place files under `src/__tests__` or use `ComponentName.test.tsx` alongside complex components.
- Use descriptive `describe/it` blocks that mirror user stories (e.g., `"Dashboard sidebar" should toggle filters)` and rely on `screen` queries over `container`.
- Guard critical flows (authentication, proposal generation, grants search) with integration-like tests and track coverage via `npm run test:coverage` (CI uses `npm run test:ci`).

## Commit & Pull Request Guidelines
- Keep commit subjects short, present tense, imperative (recent history shows `<verb> <area>` such as `added sections`); mention the feature or bug directly.
- Scope each PR to a coherent change set, link linear/issue IDs when available, and include screenshots or GIFs for UI updates plus reproduction steps for bug fixes.
- Confirm `npm run lint`, `npm run type-check`, and relevant `npm run test*` commands pass before requesting review; note any skipped checks explicitly.

## Security & Configuration Tips
- Never commit `.env*` files; Vite reads from `.env.local` for secrets like API hosts—document required keys in the PR instead.
- Sanitize any logged data before merging and clear local/session storage tokens on logout as done in `src/App.tsx` to avoid leaking credentials.
