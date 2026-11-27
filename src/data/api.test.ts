import { initializeMocks } from '../testUtils';
import * as api from './api';

let axiosMock;

describe('legacy libraries migration API', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  describe('getModulestoreMigrationStatus', () => {
    it('should get migration status', async () => {
      const migrationId = '1';
      const url = api.getModulestoreMigrationStatusUrl(migrationId);
      axiosMock.onGet(url).reply(200);
      await api.getModulestoreMigrationStatus(migrationId);

      expect(axiosMock.history.get[0].url).toEqual(url);
    });
  });

  describe('bulkMigrateLegacyLibraries', () => {
    it('should call bulk migrate legacy libraries', async () => {
      const url = api.bulkModulestoreMigrateUrl();
      axiosMock.onPost(url).reply(200);
      await api.bulkModulestoreMigrate({
        sources: [],
        target: '1',
      });

      expect(axiosMock.history.post[0].url).toEqual(url);
    });
  });

  describe('getPreviewModulestoreMigration', () => {
    it('should call get preview modulestore migration', async () => {
      const url = api.getPreviewModulestoreMigrationUrl();
      axiosMock.onGet(url).reply(200);
      await api.getPreviewModulestoreMigration('1', '2');

      expect(axiosMock.history.get[0].url).toEqual(url);
    });
  });
});

describe('course settings API', () => {
  const courseId = 'course-v1:edX+DemoX+Demo_Course';
  const settingsUrl = `http://localhost:18010/api/authoring/v2/courses/${courseId}/settings/`;
  const minimalSettings = {
    about_page_editable: true,
    can_show_certificate_available_date_field: false,
    content_experiments_enabled: true,
    course_display_name: 'Demonstration Course',
    course_display_name_with_default: 'Demonstration Course',
    credit_eligibility_enabled: true,
    enable_extended_course_details: false,
    enrollment_end_editable: true,
    is_credit_course: true,
    is_entrance_exams_enabled: true,
    is_prerequisite_courses_enabled: true,
    licensing_enabled: false,
    lms_link_for_about_page: 'http://localhost:18000/courses/course-v1:edX+DemoX+Demo_Course/about',
    marketing_enabled: true,
    mfe_proctored_exam_settings_url: '',
    platform_name: 'Example Site',
    short_description_editable: true,
    show_min_grade_warning: false,
    sidebar_html_enabled: false,
    upgrade_deadline: null,
  };

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  it('reads the minimal view by default', async () => {
    axiosMock.onGet(settingsUrl).reply(200, minimalSettings);
    const result = await api.getCourseSettings(courseId);

    expect(api.getCourseSettingsApiUrl(courseId)).toEqual(settingsUrl);
    expect(axiosMock.history.get[0].url).toEqual(settingsUrl);
    expect(axiosMock.history.get[0].params).toBeUndefined();
    expect(result).toEqual(expect.objectContaining({
      contentExperimentsEnabled: true,
      courseDisplayNameWithDefault: 'Demonstration Course',
      creditEligibilityEnabled: true,
      isCreditCourse: true,
      mfeProctoredExamSettingsUrl: '',
    }));
    expect(result).not.toHaveProperty('languageOptions');
    expect(result).not.toHaveProperty('possiblePreRequisiteCourses');
  });

  it('asks for the full view when requested', async () => {
    axiosMock.onGet(settingsUrl, { params: { view: 'full' } }).reply(200, {
      ...minimalSettings,
      language_options: [['en', 'English'], ['fr', 'French']],
      possible_pre_requisite_courses: [{
        course_key: 'course-v1:edX+Intro+2025',
        display_name: 'Introduction',
        lms_link: 'http://localhost:18000/courses/course-v1:edX+Intro+2025/jump_to/'
          + 'block-v1:edX+Intro+2025+type@course+block@course',
        number: 'Intro',
        org: 'edX',
        rerun_link: '/course_rerun/course-v1:edX+Intro+2025',
        run: '2025',
        url: '/course/course-v1:edX+Intro+2025',
      }],
      credit_requirements: {
        grade: [{ name: 'grade', display_name: 'Minimum Grade', criteria: { min_grade: 0.8 } }],
      },
    });
    const result = await api.getCourseSettings(courseId, 'full');

    expect(axiosMock.history.get[0].params).toEqual({ view: 'full' });
    expect(result.languageOptions).toEqual([['en', 'English'], ['fr', 'French']]);
    expect(result.possiblePreRequisiteCourses).toEqual([{
      courseKey: 'course-v1:edX+Intro+2025',
      displayName: 'Introduction',
      lmsLink: 'http://localhost:18000/courses/course-v1:edX+Intro+2025/jump_to/'
        + 'block-v1:edX+Intro+2025+type@course+block@course',
      number: 'Intro',
      org: 'edX',
      rerunLink: '/course_rerun/course-v1:edX+Intro+2025',
      run: '2025',
      url: '/course/course-v1:edX+Intro+2025',
    }]);
    expect(result.creditRequirements).toEqual({
      grade: [{ name: 'grade', displayName: 'Minimum Grade', criteria: { minGrade: 0.8 } }],
    });
  });
});
