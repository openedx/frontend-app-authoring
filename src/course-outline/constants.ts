import { ContainerType } from '@src/generic/key-utils';
import messages from './messages';

export const ITEM_BADGE_STATUS = {
  live: 'live',
  gated: 'gated',
  publishedNotLive: 'published_not_live',
  unpublishedChanges: 'unpublished_changes',
  staffOnly: 'staff_only',
  draft: 'draft',
  unscheduled: 'unscheduled',
  needs_attention: 'needs_attention',
} as const;

export const HIGHLIGHTS_FIELD_MAX_LENGTH = 250;

export const CHECKLIST_FILTERS = {
  ALL: 'ALL',
  SELF_PACED: 'SELF_PACED',
  INSTRUCTOR_PACED: 'INSTRUCTOR_PACED',
} as const;

export const COURSE_BLOCK_NAMES = {
  chapter: { id: 'chapter', name: 'Section' },
  sequential: { id: 'sequential', name: 'Subsection' },
  vertical: { id: 'vertical', name: 'Unit' },
} as const;

export const LAUNCH_CHECKLIST = {
  data: [
    {
      id: 'welcomeMessage',
      pacingTypeFilter: CHECKLIST_FILTERS.ALL,
    },
    {
      id: 'gradingPolicy',
      pacingTypeFilter: CHECKLIST_FILTERS.ALL,
    },
    {
      id: 'certificate',
      pacingTypeFilter: CHECKLIST_FILTERS.ALL,
    },
    {
      id: 'courseDates',
      pacingTypeFilter: CHECKLIST_FILTERS.ALL,
    },
    {
      id: 'assignmentDeadlines',
      pacingTypeFilter: CHECKLIST_FILTERS.INSTRUCTOR_PACED,
    },
    {
      id: 'proctoringEmail',
      pacingTypeFilter: CHECKLIST_FILTERS.ALL,
    },
  ],
} as const;

export const BEST_PRACTICES_CHECKLIST = {
  data: [
    {
      id: 'videoDuration',
      pacingTypeFilter: CHECKLIST_FILTERS.ALL,
    },
    {
      id: 'diverseSequences',
      pacingTypeFilter: CHECKLIST_FILTERS.ALL,
    },
    {
      id: 'weeklyHighlights',
      pacingTypeFilter: CHECKLIST_FILTERS.SELF_PACED,
    },
    {
      id: 'unitDepth',
      pacingTypeFilter: CHECKLIST_FILTERS.ALL,
    },
  ],
} as const;

export const VIDEO_SHARING_OPTIONS = {
  perVideo: 'per-video',
  allOn: 'all-on',
  allOff: 'all-off',
} as const;

export const API_ERROR_TYPES = {
  networkError: 'networkError',
  serverError: 'serverError',
  unknown: 'unknown',
  forbidden: 'forbidden',
} as const;

/**
 * Single source of truth for outline category metadata.
 * Replaces scattered switch/case on category strings.
 *
 * Each entry carries the display name, ContainerType mapping,
 * delete-field mask, and UI message references needed by
 * components like OutlineAddChildButtons.
 */
export const OUTLINE_CATEGORY_CONFIG = {
  chapter: {
    id: 'chapter',
    name: 'Section',
    containerType: ContainerType.Section,
    deleteExtraFields: [] as const,
    newButtonMessage: messages.newSectionButton,
    importButtonMessage: messages.useSectionFromLibraryButton,
    placeholderMessage: messages.placeholderSectionText,
  },
  sequential: {
    id: 'sequential',
    name: 'Subsection',
    containerType: ContainerType.Subsection,
    deleteExtraFields: ['sectionId'] as const,
    newButtonMessage: messages.newSubsectionButton,
    importButtonMessage: messages.useSubsectionFromLibraryButton,
    placeholderMessage: messages.placeholderSubsectionText,
  },
  vertical: {
    id: 'vertical',
    name: 'Unit',
    containerType: ContainerType.Unit,
    deleteExtraFields: ['subsectionId', 'sectionId'] as const,
    newButtonMessage: messages.newUnitButton,
    importButtonMessage: messages.useUnitFromLibraryButton,
    placeholderMessage: messages.placeholderUnitText,
  },
} as const;

export type CategoryId = keyof typeof OUTLINE_CATEGORY_CONFIG;
export type OutlineCategoryConfigEntry = typeof OUTLINE_CATEGORY_CONFIG[CategoryId];

/**
 * Lookup from public ContainerType (Section / Subsection / Unit)
 * to the internal OUTLINE_CATEGORY_CONFIG entry.
 */
export const CONTAINER_CATEGORY_CONFIG: Partial<Record<ContainerType, OutlineCategoryConfigEntry>> = {
  [ContainerType.Section]: OUTLINE_CATEGORY_CONFIG.chapter,
  [ContainerType.Subsection]: OUTLINE_CATEGORY_CONFIG.sequential,
  [ContainerType.Unit]: OUTLINE_CATEGORY_CONFIG.vertical,
};
