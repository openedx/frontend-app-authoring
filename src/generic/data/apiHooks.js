// @ts-check
import { useQuery } from '@tanstack/react-query';
import { getOrganizations, getStudioHomeData, getTagsCount } from './api';

/**
 * Builds the query to get a list of available organizations
 */
export const useOrganizationListData = () => (
  useQuery({
    queryKey: ['organizationList'],
    queryFn: () => getOrganizations(),
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

export const useStudioHomeData = () => useQuery({
  queryKey: ['studioHomeData'],
  queryFn: getStudioHomeData,
});

/**
 * Are the tagging/taxonomy features enabled?
 * @returns {boolean} Whether they are enabled (default true)
 */
export const useTaggingFeaturesEnabled = () => {
  const { data: studioHomeData } = useStudioHomeData();
  // Default is true unless it's explicitly disabled. This _may_ cause a "flash" of features that then disappear
  // on some instances with tagging disabled, but we are treating "tagging disabled" as an unusual exception, and
  // having tagging enabled as the default expected for 99% of users.
  return studioHomeData?.taxonomiesEnabled ?? true;
};
