/**
 * The utilities are taken from the https://github.com/openedx/studio-frontend repository.
 * Perform a minor refactoring of the functions while preserving their original functionality.
 */

export const hasWelcomeMessage = (updates) => updates.hasUpdate;

export const hasGradingPolicy = (grades) => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const { hasGradingPolicy, sumOfWeights } = grades;

  return hasGradingPolicy && parseFloat(sumOfWeights.toPrecision(2), 10) === 1.0;
};

export const hasCertificate = (certificates) => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const { isActivated, hasCertificate } = certificates;

  return isActivated && hasCertificate;
};

export const hasDates = (dates) => {
  const { hasStartDate, hasEndDate } = dates;

  return hasStartDate && hasEndDate;
};

export const hasAssignmentDeadlines = (assignments, dates) => {
  const {
    totalNumber,
    assignmentsWithDatesBeforeStart,
    assignmentsWithDatesAfterEnd,
    assignmentsWithOraDatesBeforeStart,
    assignmentsWithOraDatesAfterEnd,
  } = assignments;

  if (!hasDates(dates)) {
    return false;
  }
  if (totalNumber === 0) {
    return false;
  }
  if (assignmentsWithDatesBeforeStart.length > 0) {
    return false;
  }
  if (assignmentsWithDatesAfterEnd.length > 0) {
    return false;
  }
  if (assignmentsWithOraDatesBeforeStart.length > 0) {
    return false;
  }
  if (assignmentsWithOraDatesAfterEnd.length > 0) {
    return false;
  }

  return true;
};

export const hasShortVideoDuration = (videos) => {
  const { totalNumber, durations } = videos;

  if (totalNumber === 0) {
    return true;
  }
  if (totalNumber > 0 && durations.median <= 600) {
    return true;
  }

  return false;
};

export const hasMobileFriendlyVideos = (videos) => {
  const { totalNumber, numMobileEncoded } = videos;

  if (totalNumber === 0) {
    return true;
  }
  if (totalNumber > 0 && (numMobileEncoded / totalNumber) >= 0.9) {
    return true;
  }

  return false;
};

export const hasDiverseSequences = (subsections) => {
  const { totalVisible, numWithOneBlockType } = subsections;

  if (totalVisible === 0) {
    return false;
  }
  if (totalVisible > 0) {
    return ((numWithOneBlockType / totalVisible) < 0.2);
  }

  return false;
};

export const hasWeeklyHighlights = (sections) => {
  const { highlightsActiveForCourse, highlightsEnabled } = sections;

  return highlightsActiveForCourse && highlightsEnabled;
};

export const hasShortUnitDepth = (units) => units.numBlocks.median <= 3;

export const hasProctoringEscalationEmail = (proctoring) => proctoring.hasProctoringEscalationEmail;
