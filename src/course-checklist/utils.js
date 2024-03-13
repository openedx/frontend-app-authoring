import { getConfig } from '@edx/frontend-platform';

const getUpdateLinks = (courseId) => ({
  welcomeMessage: `${getConfig().STUDIO_BASE_URL}/course_info/${courseId}`,
  gradingPolicy: `${getConfig().STUDIO_BASE_URL}/settings/grading/${courseId}`,
  certificate: `${getConfig().STUDIO_BASE_URL}/certificates/${courseId}`,
  courseDates: `${getConfig().STUDIO_BASE_URL}/settings/details/${courseId}#schedule`,
  proctoringEmail: 'pages-and-resources/proctoring/settings',
  outline: `${getConfig().STUDIO_BASE_URL}/course/${courseId}`,
});

export default getUpdateLinks;
