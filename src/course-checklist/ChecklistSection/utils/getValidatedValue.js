import * as healthValidators from './courseChecklistValidators';

const getValidatedValue = (data, id) => {
  switch (id) {
    case 'welcomeMessage':
      return healthValidators.hasWelcomeMessage(data.updates);
    case 'gradingPolicy':
      return healthValidators.hasGradingPolicy(data.grades);
    case 'certificate':
      return healthValidators.hasCertificate(data.certificates);
    case 'courseDates':
      return healthValidators.hasDates(data.dates);
    case 'assignmentDeadlines':
      return healthValidators.hasAssignmentDeadlines(data.assignments, data.dates);
    case 'videoDuration':
      return healthValidators.hasShortVideoDuration(data.videos);
    case 'mobileFriendlyVideo':
      return healthValidators.hasMobileFriendlyVideos(data.videos);
    case 'diverseSequences':
      return healthValidators.hasDiverseSequences(data.subsections);
    case 'weeklyHighlights':
      return healthValidators.hasWeeklyHighlights(data.sections);
    case 'unitDepth':
      return healthValidators.hasShortUnitDepth(data.units);
    case 'proctoringEmail':
      return healthValidators.hasProctoringEscalationEmail(data.proctoring);
    default:
      throw new Error(`Unknown validator ${id}.`);
  }
};

export default getValidatedValue;
