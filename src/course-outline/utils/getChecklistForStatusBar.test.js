import {
  getCourseLaunchChecklist,
  getCourseBestPracticesChecklist,
} from './getChecklistForStatusBar';

describe('getChecklistForStatusBar util functions', () => {
  it('getCourseLaunchChecklist', () => {
    const data = {
      isSelfPaced: false,
      dates: {
        hasStartDate: true,
        hasEndDate: false,
      },
      assignments: {
        totalNumber: 11,
        totalVisible: 7,
        assignmentsWithDatesBeforeStart: [],
        assignmentsWithDatesAfterEnd: [],
        assignmentsWithOraDatesBeforeStart: [],
        assignmentsWithOraDatesAfterEnd: [],
      },
      grades: {
        hasGradingPolicy: true,
        sumOfWeights: 1,
      },
      certificates: {
        isActivated: false,
        hasCertificate: false,
        isEnabled: true,
      },
      updates: {
        hasUpdate: true,
      },
      proctoring: {
        needsProctoringEscalationEmail: false,
        hasProctoringEscalationEmail: false,
      },
    };

    expect(getCourseLaunchChecklist(data)).toEqual({
      totalCourseLaunchChecks: 5,
      completedCourseLaunchChecks: 2,
    });
  });

  it('getCourseBestPracticesChecklist', () => {
    const data = {
      isSelfPaced: false,
      sections: {
        totalNumber: 6,
        totalVisible: 4,
        numberWithHighlights: 2,
        highlightsActiveForCourse: true,
        highlightsEnabled: true,
      },
      subsections: {
        totalVisible: 5,
        numWithOneBlockType: 2,
        numBlockTypes: {
          min: 0,
          max: 3,
          mean: 1,
          median: 1,
          mode: 1,
        },
      },
      units: {
        totalVisible: 9,
        numBlocks: {
          min: 1,
          max: 2,
          mean: 2,
          median: 2,
          mode: 2,
        },
      },
      videos: {
        totalNumber: 7,
        numMobileEncoded: 0,
        numWithValId: 3,
        durations: {
          min: null,
          max: null,
          mean: null,
          median: null,
          mode: null,
        },
      },
    };

    expect(getCourseBestPracticesChecklist(data)).toEqual({
      totalCourseBestPracticesChecks: 4,
      completedCourseBestPracticesChecks: 2,
    });
  });
});
