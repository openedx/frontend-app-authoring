module.exports = {
  mfeProctoredExamSettingsUrl: '',
  courseAssignmentLists: {},
  courseDetails: {
    graders: [
      {
        type: 'Homework',
        minCount: 0,
        dropCount: 0,
        shortLabel: null,
        weight: 15,
        id: 0,
      },
      {
        type: 'Lab',
        minCount: 0,
        dropCount: 0,
        shortLabel: null,
        weight: 15,
        id: 1,
      },
      {
        type: 'Midterm Exam',
        minCount: 0,
        dropCount: 0,
        shortLabel: null,
        weight: 30,
        id: 2,
      },
      {
        type: 'Final Exam',
        minCount: 0,
        dropCount: 0,
        shortLabel: null,
        weight: 40,
        id: 3,
      },
    ],
    gradeCutoffs: {
      a: 0.72,
      d: 0.71,
      c: 0.31,
    },
    gracePeriod: { hours: 7, minutes: 6 },
    minimumGradeCredit: 0.8,
  },
  showCreditEligibility: false,
  isCreditCourse: false,
};
