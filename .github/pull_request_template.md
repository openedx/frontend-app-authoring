## Description

Describe what this pull request changes, and why. Include implications for people using this change.
Design decisions and their rationales should be documented in the repo (docstring / ADR), per
[OEP-19](https://open-edx-proposals.readthedocs.io/en/latest/oep-0019-bp-developer-documentation.html), and can be linked here.

Useful information to include:
- Which user roles will this change impact? Common user roles are "Learner", "Course Author",
"Developer", and "Operator".
- Include screenshots for changes to the UI (ideally, both "before" and "after" screenshots, if applicable).

## Supporting information

Link to other information about the change, such as GitHub issues, or Discourse discussions.
Be sure to check they are publicly readable, or if not, repeat the information here.

## Testing instructions

Please provide detailed step-by-step instructions for manually testing this change.

## Other information

Include anything else that will help reviewers and consumers understand the change.
- Does this change depend on other changes elsewhere?
- Any special concerns or limitations? For example: deprecations, migrations, security, or accessibility.

## Best Practices Checklist

We're trying to move away from some deprecated patterns in this codebase. Please
check if your PR meets these recommendations before asking for a review:

- [ ] Any _new_ files are using TypeScript (`.ts`, `.tsx`).
- [ ] Avoid `propTypes` and `defaultProps` in any new or modified code.
- [ ] Tests should use the helpers in `src/testUtils.tsx` (specifically `initializeMocks`)
- [ ] Do not add new fields to the Redux state/store. Use React Context to share state among multiple components.
- [ ] Use React Query to load data from REST APIs. See any `apiHooks.ts` in this repo for examples.
- [ ] All new i18n messages in `messages.ts` files have a `description` for translators to use.
- [ ] Avoid using `../` in import paths. To import from parent folders, use `@src`, e.g. `import { initializeMocks } from '@src/testUtils';` instead of `from '../../../../testUtils'`
