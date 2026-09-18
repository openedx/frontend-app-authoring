/**
 * Games XBlock authoring editor, delivered as a plugin.
 *
 * `react`, `@openedx/paragon` and `@edx/frontend-platform` resolve to the host
 * app's copies via peerDependencies; host components come in through the
 * `CourseAuthoring` alias. This package bundles neither React nor Paragon.
 *
 * Wire it into the host's XBlockEditorSlot for the `games` block type -- see
 * src/plugin-slots/XBlockEditorSlot/README.md.
 */
export { default } from './GamesEditor';
export { default as messages } from './messages';
