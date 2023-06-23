module.exports = {
  aboutPageEditable: true,
  canShowCertificateAvailableDateField: false,
  courseDisplayName: 'Differential Equations',
  courseDisplayNameWithDefault: 'Differential Equations',
  creditEligibilityEnabled: true,
  creditRequirements: {
    grade: [
      {
        name: 'grade',
        displayName: 'Minimum Grade',
        criteria: {
          minGrade: 0.8,
        },
      },
    ],
  },
  enableExtendedCourseDetails: true,
  enrollmentEndEditable: true,
  isCreditCourse: true,
  isEntranceExamsEnabled: true,
  isPrerequisiteCoursesEnabled: true,
  languageOptions: [
    ['en', 'English'],
    ['uk', 'Ukrainian'],
  ],
  lmsLinkForAboutPage:
    'http://localhost:18000/courses/course-v1:edX+M12+2T2023/about',
  marketingEnabled: true,
  mfeProctoredExamSettingsUrl: '',
  possiblePreRequisiteCourses: [
    {
      courseKey: 'course-v1:edX+P315+2T2023',
      displayName: 'Quantum Entanglement',
      lmsLink:
        '//localhost:18000/courses/course-v1:edX+P315+2T2023/jump_to/block-v1:edX+P315+2T2023+type@course+block@course',
      number: 'P315',
      org: 'edX',
      rerunLink: '/course_rerun/course-v1:edX+P315+2T2023',
      run: '2T2023',
      url: '/course/course-v1:edX+P315+2T2023',
    },
    {
      courseKey: 'course-v1:edX+DemoX+Demo_Course',
      displayName: 'Demonstration Course',
      lmsLink:
        '//localhost:18000/courses/course-v1:edX+DemoX+Demo_Course/jump_to/block-v1:edX+DemoX+Demo_Course+type@course+block@course',
      number: 'DemoX',
      org: 'edX',
      rerunLink: '/course_rerun/course-v1:edX+DemoX+Demo_Course',
      run: 'Demo_Course',
      url: '/course/course-v1:edX+DemoX+Demo_Course',
    },
  ],
  shortDescriptionEditable: true,
  showMinGradeWarning: false,
  sidebarHtmlEnabled: true,
  upgradeDeadline: '2023-07-02T23:59:59+00:00',
  useV2CertDisplaySettings: false,
  platformName: 'edX',
};
