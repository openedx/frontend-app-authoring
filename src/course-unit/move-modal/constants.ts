import messages from './messages';

export const CATEGORIES = {
  TEXT: {
    section: messages.moveModalBreadcrumbsSections,
    subsection: messages.moveModalBreadcrumbsSubsections,
    unit: messages.moveModalBreadcrumbsUnits,
    component: messages.moveModalBreadcrumbsComponents,
    group: messages.moveModalBreadcrumbsGroups,
  },
  KEYS: {
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
  },
  RELATION_MAP: {
    course: 'section',
    section: 'subsection',
    subsection: 'unit',
    unit: 'component',
  },
} as const;

export const MOVE_DIRECTIONS = {
  forward: 'forward',
  backward: 'backward',
} as const;

export const BASIC_BLOCK_TYPES = [
  'course',
  'chapter',
  'sequential',
  'vertical',
] as const;
