import { getChecklistValues } from './getChecklistValues';
import { CHECKLIST_FILTERS } from '../constants';

const checklist = [
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
    id: 'weeklyHighlights',
    pacingTypeFilter: CHECKLIST_FILTERS.SELF_PACED,
  },
  {
    id: 'proctoringEmail',
    pacingTypeFilter: CHECKLIST_FILTERS.ALL,
  },
];

let courseData;
describe('getChecklistValues utility function', () => {
  beforeEach(() => {
    courseData = {
      isSelfPaced: true,
      hasCertificatesEnabled: true,
      hasHighlightsEnabled: true,
      needsProctoringEscalationEmail: true,
    };
  });
  it('returns only checklist items with filters ALL and SELF_PACED when isSelfPaced is true', () => {
    const filteredChecklist = getChecklistValues({ checklist, ...courseData });

    filteredChecklist.forEach(((
      item => expect(item.pacingTypeFilter === CHECKLIST_FILTERS.ALL
        || item.pacingTypeFilter === CHECKLIST_FILTERS.SELF_PACED)
    )));

    expect(filteredChecklist.filter(item => item.pacingTypeFilter === CHECKLIST_FILTERS.ALL).length)
      .toEqual(checklist.filter(item => item.pacingTypeFilter === CHECKLIST_FILTERS.ALL).length);
    expect(filteredChecklist.filter(item => item.pacingTypeFilter === CHECKLIST_FILTERS.SELF_PACED).length)
      .toEqual(checklist.filter(item => item.pacingTypeFilter === CHECKLIST_FILTERS.SELF_PACED).length);
  });

  it('returns only checklist items with filters ALL and INSTRUCTOR_PACED when isSelfPaced is false', () => {
    courseData.isSelfPaced = false;
    const filteredChecklist = getChecklistValues({ checklist, ...courseData });

    filteredChecklist.forEach(((
      item => expect(item.pacingTypeFilter === CHECKLIST_FILTERS.ALL
        || item.pacingTypeFilter === CHECKLIST_FILTERS.INSTRUCTOR_PACED)
    )));

    expect(filteredChecklist.filter(item => item.pacingTypeFilter === CHECKLIST_FILTERS.ALL).length)
      .toEqual(checklist.filter(item => item.pacingTypeFilter === CHECKLIST_FILTERS.ALL).length);
    expect(filteredChecklist
      .filter(item => item.pacingTypeFilter === CHECKLIST_FILTERS.INSTRUCTOR_PACED).length)
      .toEqual(checklist.filter(item => item.pacingTypeFilter === CHECKLIST_FILTERS.INSTRUCTOR_PACED).length);
  });

  it('excludes weekly highlights when they are disabled', () => {
    courseData.hasHighlightsEnabled = false;
    const filteredChecklist = getChecklistValues({ checklist, ...courseData });
    expect(filteredChecklist.filter(item => item.id === 'weeklyHighlights').length).toEqual(0);
  });

  it('excludes proctoring escalation email when not needed', () => {
    courseData.needsProctoringEscalationEmail = false;
    const filteredChecklist = getChecklistValues({ checklist, ...courseData });
    expect(filteredChecklist.filter(item => item.id === 'proctoringEmail').length).toEqual(0);
  });
});
