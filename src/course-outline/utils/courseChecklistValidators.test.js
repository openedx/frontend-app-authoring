import * as validators from './courseChecklistValidators';

describe('courseCheckValidators utility functions', () => {
  describe('hasWelcomeMessage', () => {
    it('returns true when course run has an update', () => {
      expect(validators.hasWelcomeMessage({ hasUpdate: true })).toEqual(true);
    });

    it('returns false when course run does not have an update', () => {
      expect(validators.hasWelcomeMessage({ hasUpdate: false })).toEqual(false);
    });
  });

  describe('hasGradingPolicy', () => {
    it('returns true when sum of weights is 1', () => {
      expect(validators.hasGradingPolicy(
        { hasGradingPolicy: true, sumOfWeights: 1 },
      )).toEqual(true);
    });

    it('returns true when sum of weights is not 1 due to floating point approximation (1.00004)', () => {
      expect(validators.hasGradingPolicy(
        { hasGradingPolicy: true, sumOfWeights: 1.00004 },
      )).toEqual(true);
    });

    it('returns false when sum of weights is not 1', () => {
      expect(validators.hasGradingPolicy(
        { hasGradingPolicy: true, sumOfWeights: 2 },
      )).toEqual(false);
    });

    it('returns true when hasGradingPolicy is true', () => {
      expect(validators.hasGradingPolicy(
        { hasGradingPolicy: true, sumOfWeights: 1 },
      )).toEqual(true);
    });

    it('returns false when hasGradingPolicy is false', () => {
      expect(validators.hasGradingPolicy(
        { hasGradingPolicy: false, sumOfWeights: 1 },
      )).toEqual(false);
    });
  });

  describe('hasCertificate', () => {
    it('returns true when certificates are activated and course run has a certificate', () => {
      expect(validators.hasCertificate({ isActivated: true, hasCertificate: true }))
        .toEqual(true);
    });

    it('returns false when certificates are not activated and course run has a certificate', () => {
      expect(validators.hasCertificate({ isActivated: false, hasCertificate: true }))
        .toEqual(false);
    });

    it('returns false when certificates are activated and course run does not have a certificate', () => {
      expect(validators.hasCertificate({ isActivated: true, hasCertificate: false }))
        .toEqual(false);
    });

    it('returns false when certificates are not activated and course run does not have a certificate', () => {
      expect(validators.hasCertificate({ isActivated: false, hasCertificate: false }))
        .toEqual(false);
    });
  });

  describe('hasDates', () => {
    it('returns true when course run has start date and end date', () => {
      expect(validators.hasDates({ hasStartDate: true, hasEndDate: true })).toEqual(true);
    });

    it('returns false when course run has no start date and end date', () => {
      expect(validators.hasDates({ hasStartDate: false, hasEndDate: true })).toEqual(false);
    });

    it('returns true when course run has start date and no end date', () => {
      expect(validators.hasDates({ hasStartDate: true, hasEndDate: false })).toEqual(false);
    });

    it('returns true when course run has no start date and no end date', () => {
      expect(validators.hasDates({ hasStartDate: false, hasEndDate: false })).toEqual(false);
    });
  });

  describe('hasAssignmentDeadlines', () => {
    it('returns true when a course run has start and end date and all assignments are within range', () => {
      expect(validators.hasAssignmentDeadlines(
        {
          assignmentsWithDatesBeforeStart: 0,
          assignmentsWithDatesAfterEnd: 0,
          assignmentsWithOraDatesAfterEnd: 0,
          assignmentsWithOraDatesBeforeStart: 0,
        },
        {
          hasStartDate: true,
          hasEndDate: true,
        },
      )).toEqual(true);
    });

    it('returns false when a course run has no start and no end date', () => {
      expect(validators.hasAssignmentDeadlines(
        {},
        {
          hasStartDate: false,
          hasEndDate: false,
        },
      )).toEqual(false);
    });

    it('returns false when a course has start and end date and no assignments', () => {
      expect(validators.hasAssignmentDeadlines(
        {
          totalNumber: 0,
        },
        {
          hasStartDate: true,
          hasEndDate: true,
        },
      )).toEqual(false);
    });

    it('returns false when a course run has start and end date and assignments before start', () => {
      expect(validators.hasAssignmentDeadlines(
        {
          assignmentsWithDatesBeforeStart: ['test'],
          assignmentsWithDatesAfterEnd: 0,
          assignmentsWithOraDatesAfterEnd: 0,
          assignmentsWithOraDatesBeforeStart: 0,
        },
        {
          hasStartDate: true,
          hasEndDate: true,
        },
      )).toEqual(false);
    });

    it('returns false when a course run has start and end date and assignments after end', () => {
      expect(validators.hasAssignmentDeadlines(
        {
          assignmentsWithDatesBeforeStart: 0,
          assignmentsWithDatesAfterEnd: ['test'],
          assignmentsWithOraDatesAfterEnd: 0,
          assignmentsWithOraDatesBeforeStart: 0,
        },
        {
          hasStartDate: true,
          hasEndDate: true,
        },
      )).toEqual(false);
    });
  });

  it(
    'returns false when a course run has start and end date and an ora with a date before start',
    () => {
      expect(validators.hasAssignmentDeadlines(
        {
          assignmentsWithDatesBeforeStart: 0,
          assignmentsWithDatesAfterEnd: 0,
          assignmentsWithOraDatesAfterEnd: 0,
          assignmentsWithOraDatesBeforeStart: ['test'],
        },
        {
          hasStartDate: true,
          hasEndDate: true,
        },
      )).toEqual(false);
    },
  );

  it(
    'returns false when a course run has start and end date and an ora with a date after end',
    () => {
      expect(validators.hasAssignmentDeadlines(
        {
          assignmentsWithDatesBeforeStart: 0,
          assignmentsWithDatesAfterEnd: 0,
          assignmentsWithOraDatesAfterEnd: ['test'],
          assignmentsWithOraDatesBeforeStart: 0,
        },
        {
          hasStartDate: true,
          hasEndDate: true,
        },
      )).toEqual(false);
    },
  );

  describe('hasShortVideoDuration', () => {
    it('returns true if course run has no videos', () => {
      expect(validators.hasShortVideoDuration({ totalNumber: 0 })).toEqual(true);
    });

    it('returns true if course run videos have a median duration <= to 600', () => {
      expect(validators.hasShortVideoDuration({ totalNumber: 1, durations: { median: 100 } }))
        .toEqual(true);
    });

    it('returns true if course run videos have a median duration > to 600', () => {
      expect(validators.hasShortVideoDuration({ totalNumber: 10, durations: { median: 700 } }))
        .toEqual(false);
    });
  });

  describe('hasMobileFriendlyVideos', () => {
    it('returns true if course run has no videos', () => {
      expect(validators.hasMobileFriendlyVideos({ totalNumber: 0 })).toEqual(true);
    });

    it('returns true if course run videos are >= 90% mobile friendly', () => {
      expect(validators.hasMobileFriendlyVideos({ totalNumber: 10, numMobileEncoded: 9 }))
        .toEqual(true);
    });

    it('returns true if course run videos are < 90% mobile friendly', () => {
      expect(validators.hasMobileFriendlyVideos({ totalNumber: 10, numMobileEncoded: 8 }))
        .toEqual(false);
    });
  });

  describe('hasDiverseSequences', () => {
    it('returns true if < 20% of visible subsections have more than one block type', () => {
      expect(validators.hasDiverseSequences({ totalVisible: 10, numWithOneBlockType: 1 }))
        .toEqual(true);
    });

    it('returns false if no visible subsections', () => {
      expect(validators.hasDiverseSequences({ totalVisible: 0 })).toEqual(false);
    });

    it('returns false if >= 20% of visible subsections have more than one block type', () => {
      expect(validators.hasDiverseSequences({ totalVisible: 10, numWithOneBlockType: 3 }))
        .toEqual(false);
    });

    it('return false if < 0 visible subsections', () => {
      expect(validators.hasDiverseSequences({ totalVisible: -1, numWithOneBlockType: 1 }))
        .toEqual(false);
    });
  });

  describe('hasWeeklyHighlights', () => {
    it('returns true when course run has highlights enabled', () => {
      const data = { highlightsActiveForCourse: true, highlightsEnabled: true };
      expect(validators.hasWeeklyHighlights(data)).toEqual(true);
    });

    it('returns false when course run has highlights enabled', () => {
      const data = { highlightsActiveForCourse: false, highlightsEnabled: false };
      expect(validators.hasWeeklyHighlights(data)).toEqual(false);

      data.highlightsEnabled = true;
      data.highlightsActiveForCourse = false;
      expect(validators.hasWeeklyHighlights(data)).toEqual(false);

      data.highlightsEnabled = false;
      data.highlightsActiveForCourse = true;
      expect(validators.hasWeeklyHighlights(data)).toEqual(false);
    });
  });

  describe('hasShortUnitDepth', () => {
    it('returns true when course run has median number of blocks <= 3', () => {
      const units = {
        numBlocks: {
          median: 3,
        },
      };

      expect(validators.hasShortUnitDepth(units)).toEqual(true);
    });

    it('returns false when course run has median number of blocks > 3', () => {
      const units = {
        numBlocks: {
          median: 4,
        },
      };

      expect(validators.hasShortUnitDepth(units)).toEqual(false);
    });
  });

  describe('hasProctoringEscalationEmail', () => {
    it('returns true when the course has a proctoring escalation email', () => {
      const proctoring = { hasProctoringEscalationEmail: true };
      expect(validators.hasProctoringEscalationEmail(proctoring)).toEqual(true);
    });

    it('returns false when the course does not have a proctoring escalation email', () => {
      const proctoring = { hasProctoringEscalationEmail: false };
      expect(validators.hasProctoringEscalationEmail(proctoring)).toEqual(false);
    });
  });
});
