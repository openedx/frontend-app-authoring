import { CHECKLIST_FILTERS } from '../constants';
import * as healthValidators from './courseChecklistValidators';

/**
 * The utilities are taken from the https://github.com/openedx/studio-frontend repository.
 * Perform a minor refactoring of the functions while preserving their original functionality.
 */
const getChecklistValidatedValue = (data, id) => {
  const {
    updates,
    grades,
    certificates,
    dates,
    assignments,
    videos,
    subsections,
    sections,
    units,
    proctoring,
  } = data;

  switch (id) {
    case 'welcomeMessage':
      return healthValidators.hasWelcomeMessage(updates);
    case 'gradingPolicy':
      return healthValidators.hasGradingPolicy(grades);
    case 'certificate':
      return healthValidators.hasCertificate(certificates);
    case 'courseDates':
      return healthValidators.hasDates(dates);
    case 'assignmentDeadlines':
      return healthValidators.hasAssignmentDeadlines(assignments, dates);
    case 'videoDuration':
      return healthValidators.hasShortVideoDuration(videos);
    case 'mobileFriendlyVideo':
      return healthValidators.hasMobileFriendlyVideos(videos);
    case 'diverseSequences':
      return healthValidators.hasDiverseSequences(subsections);
    case 'weeklyHighlights':
      return healthValidators.hasWeeklyHighlights(sections);
    case 'unitDepth':
      return healthValidators.hasShortUnitDepth(units);
    case 'proctoringEmail':
      return healthValidators.hasProctoringEscalationEmail(proctoring);
    default:
      throw new Error(`Unknown validator ${id}.`);
  }
};

const getChecklistValues = ({
  checklist,
  isSelfPaced,
  hasCertificatesEnabled,
  hasHighlightsEnabled,
  needsProctoringEscalationEmail,
}) => {
  let filteredCheckList;

  if (isSelfPaced) {
    filteredCheckList = checklist.filter(({ pacingTypeFilter }) => pacingTypeFilter === CHECKLIST_FILTERS.ALL
      || pacingTypeFilter === CHECKLIST_FILTERS.SELF_PACED);
  } else {
    filteredCheckList = checklist.filter(({ pacingTypeFilter }) => pacingTypeFilter === CHECKLIST_FILTERS.ALL
      || pacingTypeFilter === CHECKLIST_FILTERS.INSTRUCTOR_PACED);
  }

  filteredCheckList = filteredCheckList.filter(({ id }) => id !== 'certificate'
    || hasCertificatesEnabled);

  filteredCheckList = filteredCheckList.filter(({ id }) => id !== 'weeklyHighlights'
    || hasHighlightsEnabled);

  filteredCheckList = filteredCheckList.filter(({ id }) => id !== 'proctoringEmail'
    || needsProctoringEscalationEmail);

  return filteredCheckList;
};

export { getChecklistValues, getChecklistValidatedValue };
