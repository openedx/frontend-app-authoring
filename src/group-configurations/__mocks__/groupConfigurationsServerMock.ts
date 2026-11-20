import { snakeCaseObject } from '@edx/frontend-platform';

import groupConfigurationResponseMock from './groupConfigurationResponseMock';

/**
 * The configurations the server lists (with view=full) for the course that
 * groupConfigurationResponseMock describes: the configurations of the main
 * section, then the experiment configurations, each with can_manage.
 */
export const groupConfigurationsListMock = (canManage = true) =>
  snakeCaseObject([
    ...groupConfigurationResponseMock.allGroupConfigurations,
    ...groupConfigurationResponseMock.experimentGroupConfigurations,
  ]).map((configuration) => ({ ...configuration, can_manage: canManage }));

/** The course settings the server returns for that course. */
export const courseSettingsMock = {
  about_page_editable: true,
  can_show_certificate_available_date_field: false,
  content_experiments_enabled: true,
  course_display_name: 'Demonstration Course',
  course_display_name_with_default: 'Demonstration Course',
  credit_eligibility_enabled: true,
  enable_extended_course_details: false,
  enrollment_end_editable: true,
  is_credit_course: false,
  is_entrance_exams_enabled: true,
  is_prerequisite_courses_enabled: true,
  licensing_enabled: false,
  lms_link_for_about_page: 'https://lms.example.com/courses/course-v1:org+101+101/about',
  marketing_enabled: true,
  mfe_proctored_exam_settings_url: '',
  platform_name: 'Example Site',
  short_description_editable: true,
  show_min_grade_warning: false,
  sidebar_html_enabled: false,
  upgrade_deadline: null,
};
