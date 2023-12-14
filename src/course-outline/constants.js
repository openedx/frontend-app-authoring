export const CHECKLIST_FILTERS = {
  ALL: 'ALL',
  SELF_PACED: 'SELF_PACED',
  INSTRUCTOR_PACED: 'INSTRUCTOR_PACED',
};

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
};

export const BEST_PRACTICES_CHECKLIST = {
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
};
