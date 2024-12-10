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
  librariesV1Enabled: true,
  librariesV2Enabled: true,
  optimizationEnabled: false,
  requestCourseCreatorUrl: '/request_course_creator',
  rerunCreatorStatus: true,
  showNewLibraryButton: true,
  showNewLibraryV2Button: true,
  splitStudioHome: false,
  studioName: 'Studio',
  studioShortName: 'Studio',
  studioRequestEmail: 'request@email.com',
  techSupportEmail: 'technical@example.com',
  platformName: 'Your Platform Name Here',
  userIsActive: true,
  allowToCreateNewOrg: false,
});

/** Mock for the deprecated /api/contentstore/v1/home/courses endpoint. Note this endpoint is NOT paginated. */
export const generateGetStudioCoursesApiResponse = () => ({
  archivedCourses: /** @type {any[]} */([]),
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

export const generateGetStudioHomeLibrariesApiResponse = () => ({
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

export const generateGetStudioHomeLibrariesV2ApiResponse = () => ({
  next: null,
  previous: null,
  count: 2,
  numPages: 1,
  currentPage: 1,
  start: 0,
  results: [
    {
      id: 'lib:SampleTaxonomyOrg1:AL1',
      type: 'complex',
      org: 'SampleTaxonomyOrg1',
      slug: 'AL1',
      title: 'Another Library 2',
      description: '',
      numBlocks: 0,
      version: 0,
      lastPublished: null,
      allowLti: false,
      allowPublicLearning: false,
      allowpublicRead: false,
      hasUnpublishedChanges: false,
      hasUnpublishedDeletes: false,
      license: '',
    },
    {
      id: 'lib:SampleTaxonomyOrg1:TL1',
      type: 'complex',
      org: 'SampleTaxonomyOrg1',
      slug: 'TL1',
      title: 'Test Library 1',
      description: '',
      numBlocks: 0,
      version: 0,
      lastPublished: null,
      allowLti: false,
      allowPublicLearning: false,
      allowPublicRead: false,
      hasUnpublishedChanges: false,
      hasUnpublishedDeletes: false,
      license: '',
    },
  ],
});

export const generateNewVideoApiResponse = () => ({
  files: [{
    edx_video_id: 'mOckID4',
    upload_url: 'http://testing.org',
  }],
});
