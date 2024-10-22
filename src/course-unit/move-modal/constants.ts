import messages from './messages';

export const CATEGORIES_TEXT = {
  section: messages.moveModalBreadcrumbsSections,
  subsection: messages.moveModalBreadcrumbsSubsections,
  unit: messages.moveModalBreadcrumbsUnits,
  component: messages.moveModalBreadcrumbsComponents,
  group: messages.moveModalBreadcrumbsGroups,
};

export const CATEGORIES_KEYS = {
  course: 'course',
  chapter: 'chapter',
  section: 'section',
  sequential: 'sequential',
  subsection: 'subsection',
  vertical: 'vertical',
  unit: 'unit',
  component: 'component',
  split_test: 'split_test',
  group: 'group',
}

export const CATEGORY_RELATION_MAP = {
  course: 'section',
  section: 'subsection',
  subsection: 'unit',
  unit: 'component',
};

export const MOVE_DIRECTIONS = {
  forward: 'forward',
  backward: 'backward',
};

export const BASIC_BLOCK_TYPES = [
  CATEGORIES_KEYS.course,
  CATEGORIES_KEYS.chapter,
  CATEGORIES_KEYS.sequential,
  CATEGORIES_KEYS.vertical,
];
