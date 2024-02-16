// @ts-check
import { useQuery } from '@tanstack/react-query';
import { getOrganizations } from './api';

/**
 * Builds the query to get a list of available organizations
 */
export const useOrganizationListData = () => (
  useQuery({
    queryKey: ['organizationList'],
    queryFn: () => getOrganizations(),
  })
);

export default useOrganizationListData;
