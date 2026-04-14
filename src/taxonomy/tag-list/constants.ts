/** Tag list table modes - see explanation in `<TagListTable>` component (`src/taxonomy/tag-list/TagListTable.tsx`) */
const TABLE_MODES = {
  VIEW: 'view',
  DRAFT: 'draft',
  PREVIEW: 'preview',
};

/** Allowed transitions for table mode.
 * An invalid transition is mainly an illegal switch from DRAFT mode to VIEW mode,
 * which would refresh data and suddenly reorder the table and disrupt the user's workflow.
 * Refreshing data is only allowed in VIEW mode.
 */
const TRANSITION_TABLE = {
  [TABLE_MODES.VIEW]: [TABLE_MODES.VIEW, TABLE_MODES.DRAFT],
  [TABLE_MODES.DRAFT]: [TABLE_MODES.DRAFT, TABLE_MODES.PREVIEW],
  [TABLE_MODES.PREVIEW]: [TABLE_MODES.PREVIEW, TABLE_MODES.DRAFT, TABLE_MODES.VIEW],
};

/** Table mode action types for the React's `useReducer` hook */
const TABLE_MODE_ACTIONS = {
  TRANSITION: 'transition',
};

// forbidden characters: '\t', '>', ';'
const TAG_NAME_PATTERN = /^[^\t>;]*$/;

export { TABLE_MODES, TRANSITION_TABLE, TABLE_MODE_ACTIONS, TAG_NAME_PATTERN };
