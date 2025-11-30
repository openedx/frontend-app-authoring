import { useQuery } from '@tanstack/react-query';

import * as api from './api';

/**
 * Hook to fetch all help urls
 */
export const useAllHelpUrls = () => (
  useQuery({
    queryKey: ['helpURLs'],
    queryFn: api.getHelpUrls,
  })
);
