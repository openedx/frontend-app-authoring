// @ts-check
import { useQuery } from '@tanstack/react-query';
import { getOrganizations, getTagsCount } from './api';

/**
 * Builds the query to get a list of available organizations
 */
export const useOrganizationListData = () => (
  useQuery({
    queryKey: ['organizationList'],
    queryFn: getOrganizations,
  })
);

/**
 * Builds the query to get tags count of the whole contentId course and
 * returns the tags count of the specific contentId.
 * @param {string} contentId
 */
export const useContentTagsCount = (contentId) => {
  let contentPattern;
  if (contentId.includes('course-v1')) {
    // If the contentId is a course, we want to get the tags count only for the course
    contentPattern = contentId;
  } else {
    // If the contentId is not a course, we want to get the tags count for all the content of the course
    contentPattern = contentId.replace(/\+type@.*$/, '*');
  }
  return useQuery({
    queryKey: ['contentTagsCount', contentPattern],
    queryFn: /* istanbul ignore next */ () => getTagsCount(contentPattern),
    select: (data) => data[contentId] || 0, // Return the tags count of the specific contentId
  });
};
