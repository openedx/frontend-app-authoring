/** Tag list table modes - see explanation in `<TagListTable>` component (`src/taxonomy/tag-list/TagListTable.tsx`) */
const TABLE_MODES = {
  VIEW: 'view',
  DRAFT: 'draft',
  PREVIEW: 'preview',
};

const TRANSITION_TABLE = {
  [TABLE_MODES.VIEW]: [TABLE_MODES.VIEW, TABLE_MODES.DRAFT],
  [TABLE_MODES.DRAFT]: [TABLE_MODES.DRAFT, TABLE_MODES.PREVIEW],
  [TABLE_MODES.PREVIEW]: [TABLE_MODES.PREVIEW, TABLE_MODES.DRAFT, TABLE_MODES.VIEW],
};

const TABLE_MODE_ACTIONS = {
  TRANSITION: 'transition',
};

// forbidden characters: '\t', '>', ';'
const TAG_NAME_PATTERN = /^[^\t>;]*$/;

export {
  TABLE_MODES,
  TRANSITION_TABLE,
  TABLE_MODE_ACTIONS,
  TAG_NAME_PATTERN,
};
