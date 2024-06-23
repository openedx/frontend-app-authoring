import { useQuery } from '@tanstack/react-query';

import { getStudioHomeLibrariesV2 } from './api';

interface CustomParams {
  type?: string,
  page?: number,
  pageSize?: number,
  pagination?: boolean,
  order?: string,
  saerch?: string,
}

/**
 * Builds the query to fetch list of V2 Libraries
 */
const useListStudioHomeV2Libraries = (customParams: CustomParams) => (
  useQuery({
    queryKey: ['listV2Libraries', customParams],
    queryFn: () => getStudioHomeLibrariesV2(customParams),
  })
);

export default useListStudioHomeV2Libraries;
