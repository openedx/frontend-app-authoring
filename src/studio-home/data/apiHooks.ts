import { useQuery } from '@tanstack/react-query';

import { GetLibrariesV2CustomParams, getStudioHomeLibrariesV2 } from '../../library/data/api';

/**
 * Builds the query to fetch list of V2 Libraries
 */
const useListStudioHomeV2Libraries = (customParams: GetLibrariesV2CustomParams) => (
  useQuery({
    queryKey: ['listV2Libraries', customParams],
    queryFn: () => getStudioHomeLibrariesV2(customParams),
  })
);

export default useListStudioHomeV2Libraries;
