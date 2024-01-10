export const ITEM_BADGE_STATUS = /** @type {const} */ ({
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

export const COURSE_BLOCK_NAMES = /** @type {const} */ ({
  chapter: { id: 'chapter', name: 'Section' },
  sequential: { id: 'sequential', name: 'Subsection' },
  vertical: { id: 'vertical', name: 'Unit' },
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

export const VIDEO_SHARING_OPTIONS = /** @type {const} */ ({
  perVideo: 'per-video',
  allOn: 'all-on',
  allOff: 'all-off',
});
