import { RequestStatus } from '../../data/constants';

export const courseId = 'course';

export const initialState = {
  studioHome: {
    loadingStatuses: {
      studioHomeLoadingStatus: RequestStatus.IN_PROGRESS,
      courseNotificationLoadingStatus: RequestStatus.IN_PROGRESS,
      courseLoadingStatus: RequestStatus.IN_PROGRESS,
      libraryLoadingStatus: RequestStatus.IN_PROGRESS,
    },
    savingStatuses: {
      courseCreatorSavingStatus: '',
      deleteNotificationSavingStatus: '',
    },
    studioHomeData: {},
    studioHomeCoursesRequestParams: {
      currentPage: 1,
    },
  },
};

export const generateGetStudioHomeDataApiResponse = () => ({
  activeTab: 'courses',
  allowCourseReruns: true,
  allowedOrganizations: ['edx', 'org'],
  archivedCourses: [],
  canCreateOrganizations: true,
  courseCreatorStatus: 'granted',
  courses: [],
  inProcessCourseActions: [],
  libraries: [],
  librariesEnabled: true,
  libraryAuthoringMfeUrl: 'http://localhost:3001',
  optimizationEnabled: false,
  redirectToLibraryAuthoringMfe: false,
  requestCourseCreatorUrl: '/request_course_creator',
  rerunCreatorStatus: true,
  showNewLibraryButton: true,
  splitStudioHome: false,
  studioName: 'Studio',
  studioShortName: 'Studio',
  studioRequestEmail: 'request@email.com',
  techSupportEmail: 'technical@example.com',
  platformName: 'Your Platform Name Here',
  userIsActive: true,
  allowToCreateNewOrg: false,
});

export const generateGetStudioCoursesApiResponse = () => ({
  archivedCourses: [
    {
      courseKey: 'course-v1:MachineLearning+123+2023',
      displayName: 'Machine Learning',
      lmsLink: '//localhost:18000/courses/course-v1:MachineLearning+123+2023/jump_to/block-v1:MachineLearning+123+2023+type@course+block@course',
      number: '123',
      org: 'LSE',
      rerunLink: '/course_rerun/course-v1:MachineLearning+123+2023',
      run: '2023',
      url: '/course/course-v1:MachineLearning+123+2023',
    },
    {
      courseKey: 'course-v1:Design+123+e.g.2025',
      displayName: 'Design',
      lmsLink: '//localhost:18000/courses/course-v1:Design+123+e.g.2025/jump_to/block-v1:Design+123+e.g.2025+type@course+block@course',
      number: '123',
      org: 'University of Cape Town',
      rerunLink: '/course_rerun/course-v1:Design+123+e.g.2025',
      run: 'e.g.2025',
      url: '/course/course-v1:Design+123+e.g.2025',
    },
  ],
  courses: [
    {
      courseKey: 'course-v1:HarvardX+123+2023',
      displayName: 'Managing Risk in the Information Age',
      lmsLink: '//localhost:18000/courses/course-v1:HarvardX+123+2023/jump_to/block-v1:HarvardX+123+2023+type@course+block@course',
      number: '123',
      org: 'HarvardX',
      rerunLink: '/course_rerun/course-v1:HarvardX+123+2023',
      run: '2023',
      url: '/course/course-v1:HarvardX+123+2023',
    },
    {
      courseKey: 'org.0/course_0/Run_0',
      displayName: 'Run 0',
      lmsLink: null,
      number: 'course_0',
      org: 'org.0',
      rerunLink: null,
      run: 'Run_0',
      url: null,
    },
  ],
  inProcessCourseActions: [],
});

export const generateGetStudioCoursesApiResponseV2 = () => ({
  count: 5,
  next: null,
  previous: null,
  numPages: 2,
  results: {
    courses: [
      {
        courseKey: 'course-v1:HarvardX+123+2023',
        displayName: 'Managing Risk in the Information Age',
        lmsLink: '//localhost:18000/courses/course-v1:HarvardX+123+2023/jump_to/block-v1:HarvardX+123+2023+type@course+block@course',
        number: '123',
        org: 'HarvardX',
        rerunLink: '/course_rerun/course-v1:HarvardX+123+2023',
        run: '2023',
        url: '/course/course-v1:HarvardX+123+2023',
      },
      {
        courseKey: 'org.0/course_0/Run_0',
        displayName: 'Run 0',
        lmsLink: null,
        number: 'course_0',
        org: 'org.0',
        rerunLink: null,
        run: 'Run_0',
        url: null,
      },
    ],
    inProcessCourseActions: [],
  },
});

export const generateGetStuioHomeLibrariesApiResponse = () => ({
  libraries: [
    {
      displayName: 'MBA',
      libraryKey: 'library-v1:MBA+123',
      url: '/library/library-v1:MDA+123',
      org: 'Cambridge',
      number: '123',
      canEdit: true,
    },
  ],
});

export const generateNewVideoApiResponse = () => ({
  files: [{
    edx_video_id: 'mOckID4',
    upload_url: 'http://testing.org',
  }],
});
