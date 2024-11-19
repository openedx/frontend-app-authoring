// @ts-check
import { useMemo } from 'react';
import { getConfig } from '@edx/frontend-platform';
import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getTaxonomyTagsData,
  getContentTaxonomyTagsData,
  getContentData,
  updateContentTaxonomyTags,
  getContentTaxonomyTagsCount,
} from './api';
import { libraryQueryPredicate, xblockQueryKeys } from '../../library-authoring/data/apiHooks';
import { getLibraryId } from '../../generic/key-utils';

/** @typedef {import("../../taxonomy/data/types.js").TagListData} TagListData */
/** @typedef {import("../../taxonomy/data/types.js").TagData} TagData */

/**
 * Builds the query to get the taxonomy tags
 * @param {number} taxonomyId The id of the taxonomy to fetch tags for
 * @param {string|null} parentTag The tag whose children we're loading, if any
 * @param {string} searchTerm The term passed in to perform search on tags
 * @param {number} numPages How many pages of tags to load at this level
 */
export const useTaxonomyTagsData = (taxonomyId, parentTag = null, numPages = 1, searchTerm = '') => {
  const queryClient = useQueryClient();

  const queryFn = async ({ queryKey }) => {
    const page = queryKey[3];
    return getTaxonomyTagsData(taxonomyId, { parentTag: parentTag || '', searchTerm, page });
  };

  /** @type {{queryKey: any[], queryFn: typeof queryFn, staleTime: number}[]} */
  const queries = [];
  for (let page = 1; page <= numPages; page++) {
    queries.push(
      { queryKey: ['taxonomyTags', taxonomyId, parentTag, page, searchTerm], queryFn, staleTime: Infinity },
    );
  }

  const dataPages = useQueries({ queries });

  const totalPages = dataPages[0]?.data?.numPages || 1;
  const hasMorePages = numPages < totalPages;

  const tagPages = useMemo(() => {
    // Pre-load desendants if possible
    const preLoadedData = new Map();

    const newTags = dataPages.map(result => {
      /** @type {TagData[]} */
      const simplifiedTagsList = [];

      result.data?.results?.forEach((tag) => {
        if (tag.parentValue === parentTag) {
          simplifiedTagsList.push(tag);
        } else if (!preLoadedData.has(tag.parentValue)) {
          preLoadedData.set(tag.parentValue, [tag]);
        } else {
          preLoadedData.get(tag.parentValue).push(tag);
        }
      });

      return { ...result, data: simplifiedTagsList };
    });

    // Store the pre-loaded descendants into the query cache:
    preLoadedData.forEach((tags, parentValue) => {
      const queryKey = ['taxonomyTags', taxonomyId, parentValue, 1, searchTerm];
      /** @type {TagListData} */
      const cachedData = {
        next: '',
        previous: '',
        count: tags.length,
        numPages: 1,
        currentPage: 1,
        start: 0,
        results: tags,
      };
      queryClient.setQueryData(queryKey, cachedData);
    });

    return newTags;
  }, [dataPages]);

  const flatTagPages = {
    isLoading: tagPages.some(page => page.isLoading),
    isError: tagPages.some(page => page.isError),
    isSuccess: tagPages.every(page => page.isSuccess),
    data: tagPages.flatMap(page => page.data),
  };

  return { hasMorePages, tagPages: flatTagPages };
};

/**
 * Builds the query to get the taxonomy tags applied to the content object
 * @param {string} contentId The ID of the content object to fetch the applied tags for (e.g. an XBlock usage key)
 */
export const useContentTaxonomyTagsData = (contentId) => (
  useQuery({
    queryKey: ['contentTaxonomyTags', contentId],
    queryFn: () => getContentTaxonomyTagsData(contentId),
  })
);

/**
 * Builds the query to get meta data about the content object
 * @param {string} contentId The id of the content object (unit/component)
 */
export const useContentData = (contentId) => (
  useQuery({
    queryKey: ['contentData', contentId],
    queryFn: () => getContentData(contentId),
  })
);

/**
 * Builds the mutation to update the tags applied to the content object
 * @param {string} contentId The id of the content object to update tags for
 */
export const useContentTaxonomyTagsUpdater = (contentId) => {
  const queryClient = useQueryClient();

  return useMutation({
    /**
     * @type {import("@tanstack/react-query").MutateFunction<
     *   any,
     *   any,
     *   {
     *     tagsData: Promise<import("./types.js").UpdateTagsData[]>
     *   }
     * >}
     */
    mutationFn: ({ tagsData }) => updateContentTaxonomyTags(contentId, tagsData),
    onSettled: /* istanbul ignore next */ () => {
      queryClient.invalidateQueries({ queryKey: ['contentTaxonomyTags', contentId] });
      /// Invalidate query with pattern on course outline
      let contentPattern;
      if (contentId.includes('course-v1')) {
        contentPattern = contentId;
      } else {
        contentPattern = contentId.replace(/\+type@.*$/, '*');
      }
      queryClient.invalidateQueries({ queryKey: ['contentTagsCount', contentPattern] });
      if (contentId.startsWith('lb:') || contentId.startsWith('lib-collection:')) {
        // Obtain library id from contentId
        const libraryId = getLibraryId(contentId);
        // Invalidate component metadata to update tags count
        queryClient.invalidateQueries(xblockQueryKeys.componentMetadata(contentId));
        // Invalidate content search to update tags count
        queryClient.invalidateQueries(['content_search'], { predicate: (query) => libraryQueryPredicate(query, libraryId) });
      }
    },
    onSuccess: /* istanbul ignore next */ () => {
      /* istanbul ignore next */
      if (window.top != null) {
        // This send messages to the parent page if the drawer is called from a iframe.
        // Is used on Studio to update tags data and counts.
        // In the future, when the Course Outline Page and Unit Page are integrated into this MFE,
        // they should just use React Query to load the tag counts, and React Query will automatically
        // refresh those counts when the mutation invalidates them. So this postMessage is just a temporary
        // feature to support the legacy Django template courseware page.

        // Sends content tags.
        getContentTaxonomyTagsData(contentId).then((data) => {
          const contentData = {
            contentId,
            ...data,
          };
          window.top?.postMessage(
            { type: 'authoring.events.tags.updated', data: contentData },
            getConfig().STUDIO_BASE_URL,
          );
        });

        // Sends tags count.
        getContentTaxonomyTagsCount(contentId).then((data) => {
          const contentData = {
            contentId,
            count: data,
          };
          window.top?.postMessage(
            { type: 'authoring.events.tags.count.updated', data: contentData },
            getConfig().STUDIO_BASE_URL,
          );
        });
      }
    },
  });
};
