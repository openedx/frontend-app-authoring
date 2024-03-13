export const hasWelcomeMessage = updates => (
  updates.hasUpdate
);

export const hasGradingPolicy = grades => (
  grades.hasGradingPolicy
  && parseFloat(grades.sumOfWeights.toPrecision(2), 10) === 1.0
);

export const hasCertificate = certificates => (
  certificates.isActivated && certificates.hasCertificate
);

export const hasDates = dates => (
  dates.hasStartDate && dates.hasEndDate
);

export const hasAssignmentDeadlines = (assignments, dates) => {
  if (!hasDates(dates)) {
    return false;
  } if (assignments.totalNumber === 0) {
    return false;
  } if (assignments.assignmentsWithDatesBeforeStart.length > 0) {
    return false;
  } if (assignments.assignmentsWithDatesAfterEnd.length > 0) {
    return false;
  } if (assignments.assignmentsWithOraDatesBeforeStart.length > 0) {
    return false;
  } if (assignments.assignmentsWithOraDatesAfterEnd.length > 0) {
    return false;
  }

  return true;
};

export const hasShortVideoDuration = (videos) => {
  if (videos.totalNumber === 0) {
    return true;
  } if (videos.totalNumber > 0 && videos.durations.median <= 600) {
    return true;
  }

  return false;
};

export const hasMobileFriendlyVideos = (videos) => {
  if (videos.totalNumber === 0) {
    return true;
  } if (videos.totalNumber > 0 && (videos.numMobileEncoded / videos.totalNumber) >= 0.9) {
    return true;
  }

  return false;
};

export const hasDiverseSequences = (subsections) => {
  if (subsections.totalVisible === 0) {
    return false;
  } if (subsections.totalVisible > 0) {
    return ((subsections.numWithOneBlockType / subsections.totalVisible) < 0.2);
  }

  return false;
};

export const hasWeeklyHighlights = sections => (
  sections.highlightsActiveForCourse && sections.highlightsEnabled
);

export const hasShortUnitDepth = units => (
  units.numBlocks.median <= 3
);

export const hasProctoringEscalationEmail = proctoring => (
  proctoring.hasProctoringEscalationEmail
);
