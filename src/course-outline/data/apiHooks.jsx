// @ts-check
import { useQuery } from '@tanstack/react-query';
import { getTagsCount } from './api';

/**
 * Builds the query to get tags count of a group of units.
 * @param {string} contentPattern The IDs of units separated by commas.
 */
const useUnitTagsCount = (contentPattern) => (
  useQuery({
    queryKey: ['unitTagsCount', contentPattern],
    queryFn: /* istanbul ignore next */ () => getTagsCount(contentPattern),
  })
);

export default useUnitTagsCount;
