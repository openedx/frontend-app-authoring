// @ts-check
import { useQuery } from '@tanstack/react-query';
import { getTagsCount } from './api';

/**
 * Builds the query to get tags count of the whole contentId course and
 * returns the tags count of the specific contentId.
 * @param {string} contentId
 */
/* eslint-disable import/prefer-default-export */
export const useContentTagsCount = (contentId) => {
  let contentPattern;
  if (contentId.includes('course-v1')) {
    contentPattern = contentId;
  } else {
    contentPattern = contentId.replace(/\+type@.*$/, '*');
  }
  return useQuery({
    queryKey: ['contentTagsCount', contentPattern],
    queryFn: /* istanbul ignore next */ () => getTagsCount(contentPattern),
    select: (data) => data[contentId] || 0,
  });
};
