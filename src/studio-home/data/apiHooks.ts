import { useQuery } from '@tanstack/react-query';

import { getStudioHomeLibrariesV2 } from './api';


/**
 * Builds the query to fetch list of V2 Libraries
 */
export const useListStudioHomeV2Libraries = (customParams) => (
  useQuery({
    queryKey: ['listV2Libraries', customParams],
    queryFn: () => getStudioHomeLibrariesV2(customParams),
  })
);
