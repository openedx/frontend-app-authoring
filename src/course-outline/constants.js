export const SECTION_BADGE_STATUTES = /** @type {const} */ ({
  live: 'live',
  publishedNotLive: 'published_not_live',
  staffOnly: 'staff_only',
  draft: 'draft',
});

export const STAFF_ONLY = 'staff_only';

export const HIGHLIGHTS_FIELD_MAX_LENGTH = 250;

export const CHECKLIST_FILTERS = /** @type {const} */ ({
  ALL: 'ALL',
  SELF_PACED: 'SELF_PACED',
  INSTRUCTOR_PACED: 'INSTRUCTOR_PACED',
});

export const DEFAULT_NEW_DISPLAY_NAMES = /** @type {const} */ ({
  chapter: 'Section',
  subsection: 'Subsection',
});

export const LAUNCH_CHECKLIST = /** @type {const} */ ({
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
});

export const BEST_PRACTICES_CHECKLIST = /** @type {const} */ ({
  data: [
    {
      id: 'videoDuration',
      pacingTypeFilter: CHECKLIST_FILTERS.ALL,
    },
    {
      id: 'mobileFriendlyVideo',
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
});
