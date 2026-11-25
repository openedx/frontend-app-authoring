import type { Course } from '@src/studio-home/data/api';
import { getApiBaseUrl } from '@src/studio-home/data/api';

/** The course list endpoint, which `CompetencyAssociationsProvider` queries for the listed courses. */
export const courseListUrl = () => `${getApiBaseUrl()}/api/contentstore/v2/home/courses`;

export const buildCourseRow = (courseKey: string, displayName = courseKey): Course => ({
  courseKey,
  displayName,
  lmsLink: null,
  number: 'CS102',
  org: 'OrgX',
  rerunLink: null,
  run: '2024',
  url: `/course/${courseKey}`,
});

/** A page of the course list response, as the API returns it once camel-cased. */
export const buildCourseListResponse = (courseKeys: string[], numPages = 1) => ({
  results: { courses: courseKeys.map((courseKey) => buildCourseRow(courseKey)) },
  numPages,
  count: courseKeys.length,
});
