import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

ensureConfig(['STUDIO_BASE_URL'], 'library API service');

export async function getCourseList(params) {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().LMS_BASE_URL;

  const response = await client.get(`${baseUrl}/api/courses/v1/courses/`, {
    params: {
      ...params.filterParams,
      ...params.coursePaginationParams,
      permissions: 'instructor',
      username: params.authenticatedUser.username,
    },
  });

  return {
    count: response.data.pagination.count,
    courses: response.data.results
      .map((course) => ({
        id: course.course_id,
        title: course.name,
        org: course.org,
      })),
  };
}

export async function getImportTasks(params) {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;
  const response = await client.get(`${baseUrl}/api/libraries/v2/${params.libraryId}/import_blocks/tasks/`, {
    params: {
      ...params.taskPaginationParams,
    },
  });

  return {
    count: response.data.count,
    tasks: response.data.results,
  };
}

export async function importBlocks({ libraryId, courseId }) {
  const client = getAuthenticatedHttpClient();
  const baseUrl = getConfig().STUDIO_BASE_URL;
  const response = await client.post(`${baseUrl}/api/libraries/v2/${libraryId}/import_blocks/tasks/`, {
    course_key: courseId,
  });

  return response.data;
}
