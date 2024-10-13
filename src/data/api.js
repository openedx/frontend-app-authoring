/* eslint-disable import/prefer-default-export */
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

function normalizeCourseDetail(data) {
  return {
    id: data.course_id,
    ...camelCaseObject(data),
  };
}

export async function getCourseDetail(courseId, username) {
  const { data } = await getAuthenticatedHttpClient()
    .get(`${getConfig().LMS_BASE_URL}/api/courses/v1/courses/${courseId}?username=${username}`);

  return normalizeCourseDetail(data);
}

export async function getWaffleFlags(courseId) {
  // const { data } = await getAuthenticatedHttpClient()
  //   .get(`${getConfig().STUDIO_BASE_URL}/api/contentstore/v1/course_waffle_flags`);

  const data = {
    use_new_home_page: true,
    use_new_custom_pages: true,
    use_new_schedule_details_page: true,
    use_new_advanced_settings_page: true,
    use_new_grading_page: true,
    use_new_updates_page: true,
    use_new_import_page: true,
    use_new_export_page: true,
    use_new_files_uploads_page: true,
    use_new_video_uploads_page: true,
    use_new_course_outline_page: true,
    use_new_unit_page: true,
    use_new_course_team_page: true,
    use_new_certificates_page: true,
    use_new_textbooks_page: true,
    use_new_group_configurations_page: true,
  };

  return normalizeCourseDetail(data);
}
