# AGENTS.md

Guidance for AI coding agents working in **frontend-app-authoring**, the React/Paragon
frontend for Open edX Studio (course and library authoring). Human contributors should
also read the `README.rst` and [How To Contribute](https://openedx.org/r/how-to-contribute).

## Setup & commands

- Use the Node version in `.nvmrc` (currently 24). Install with `npm ci`.
- `npm start` / `npm run dev` — run the dev server (needs a running Open edX backend, e.g. Tutor; see `README.rst`).
- `npm test` — run Jest with coverage. For a single file: `npm test -- path/to/file.test.tsx`.
- `npm run types` — TypeScript type-check (`tsc --noEmit`).
- `npm run lint` — dprint + oxlint + stylelint. `npm run lint:fix` auto-fixes most issues.
- `make validate` — the full CI gate: lint, types, tests, build, and i18n/lockfile checks. Run before declaring work done.

Always run `npm run lint` and `npm run types` (and relevant tests) after changing code, and fix what they report.

## Conventions

This codebase is actively migrating away from older patterns. Follow the new ones, and prefer
improving code you touch over matching nearby legacy style.

- **TypeScript first.** Write new files as `.ts`/`.tsx`. Avoid `propTypes` and `defaultProps` in new or modified code.
- **Imports.** Use the `@src` alias instead of deep relative paths, e.g. `import { initializeMocks } from '@src/testUtils';` (not `'../../../testUtils'`).
  - Code in the `plugins` directory should use `CourseAuthoring/` as the import alias instead of `@src/`. The `CourseAuthoring/` alias should not be used outside of the `plugins` directory.
- **Data fetching.** Use React Query for REST APIs. Put hooks in a feature's `data/apiHooks.ts` — see existing ones for the pattern.
- **React Router** Links and navigation are handled using React Router.
- **State.** Do **not** add new fields to the Redux store; Redux is deprecated here. Share state with React Context. Use local/React Query state for server data.
- **Feature-based structure.** Code is organized by feature/module, not by type. Keep a feature's view components and its `data/` directory together, expose a public interface, and don't import from a feature's internals or its parents. See [docs/decisions/0002-feature-based-application-organization.rst](docs/decisions/0002-feature-based-application-organization.rst).
- **i18n.** All user-facing strings go through `react-intl` in a `messages.ts` file, and every message needs a `description` for translators. See [docs/how_tos/i18n.rst](docs/how_tos/i18n.rst). Do not hand-edit `src/i18n/messages/`.
- **Formatting.** dprint enforces single quotes in TS (double in JSX), semicolons, 2-space indent, 120-col width. Let `npm run lint:fix` handle it rather than formatting by hand.
- **Linting** Despite some leftover references to eslint and eslint directives in the code, this repo is now using oxlint as its linter. Do not run eslint.

## Testing

- Use [`src/testUtils.tsx`](src/testUtils.tsx), especially `initializeMocks(...)` and the custom `render()`, to set up providers, the API mock, and routing. Don't reinvent test scaffolding.
- Prefer `user-event` over `fireEvent`
- Selectors and queries in tests should follow the React Testing Library [Guiding Principles](https://testing-library.com/docs/guiding-principles/) and [query priority guidelines](https://testing-library.com/docs/queries/about#priority). In particualr, prefer `getByRole` (e.g. `getByRole('button', {name: /submit/i})`), `getByLabelText`, `getByPlaceholderText`, `getByText`, and `getByDisplayValue` over non-user-visible selectors like `getByTestId`.
- Mock HTTP with the provided axios mock adapter; assert on user-visible behavior via Testing Library queries.
- New code is expected to be covered (see `codecov.yml`).

## Architecture decisions

- Document non-trivial design decisions in the repo (docstrings or an ADR under
  [docs/decisions/](docs/decisions/)), per
  [OEP-19](https://open-edx-proposals.readthedocs.io/en/latest/oep-0019-bp-developer-documentation.html).

## Commits & pull requests

- Commit messages must follow **Conventional Commits** (`feat:`, `fix:`, `chore:`, `refactor:`, …); this is enforced by commitlint in CI.
