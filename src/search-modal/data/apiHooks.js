// @ts-check

import { useQuery } from '@tanstack/react-query';

import { getContentSearchConfig } from './api';

/**
  * Load the Meilisearch connection details from the CMS: the URL to use, the index name, and an API key specific
  * to the current user that allows it to search all content he have permission to view.
  *
  */
/* eslint-disable import/prefer-default-export */
export const useContentSearch = () => (
  useQuery({
    queryKey: ['content_search'],
    queryFn: getContentSearchConfig,
    cacheTime: 60 * 60_000, // Even if we're not actively using the search modal, keep it in memory up to an hour
    staleTime: 60 * 60_000, // If cache is up to one hour old, no need to re-fetch
    refetchInterval: 60 * 60_000,
    refetchOnWindowFocus: false, // This doesn't need to be refreshed when the user switches back to this tab.
    refetchOnMount: false,
  })
);
