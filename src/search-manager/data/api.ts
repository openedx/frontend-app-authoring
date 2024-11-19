import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import type {
  Filter, MeiliSearch, MultiSearchQuery,
} from 'meilisearch';

export const getContentSearchConfigUrl = () => new URL(
  'api/content_search/v2/studio/',
  getConfig().STUDIO_BASE_URL,
).href;

export const HIGHLIGHT_PRE_TAG = '__meili-highlight__'; // Indicate the start of a highlighted (matching) term
export const HIGHLIGHT_POST_TAG = '__/meili-highlight__'; // Indicate the end of a highlighted (matching) term

/** The separator used for hierarchical tags in the search index, e.g. tags.level1 = "Subject > Math > Calculus" */
export const TAG_SEP = ' > ';

export enum SearchSortOption {
  RELEVANCE = '', // Default; sorts results by keyword search ranking
  TITLE_AZ = 'display_name:asc',
  TITLE_ZA = 'display_name:desc',
  NEWEST = 'created:desc',
  OLDEST = 'created:asc',
  RECENTLY_PUBLISHED = 'last_published:desc',
  RECENTLY_MODIFIED = 'modified:desc',
}

/**
 * Get the content search configuration from the CMS.
 */
export const getContentSearchConfig = async (): Promise<{ url: string, indexName: string, apiKey: string }> => {
  const url = getContentSearchConfigUrl();
  const response = await getAuthenticatedHttpClient().get(url);
  return {
    url: response.data.url,
    indexName: response.data.index_name,
    apiKey: response.data.api_key,
  };
};

/**
 * Detailed "content" of an XBlock/component, from the block's index_dictionary function. Contents depends on the type.
 */
export interface ContentDetails {
  htmlContent?: string;
  capaContent?: string;
  [k: string]: any;
}

/**
 * Meilisearch filters can be expressed as strings or arrays.
 * This helper method converts from any supported input format to an array, for consistency.
 * @param filter A filter expression, e.g. `'foo = bar'` or `[['a = b', 'a = c'], 'd = e']`
 */
export function forceArray(filter?: Filter): string[] {
  if (typeof filter === 'string') {
    return [filter];
  }
  if (Array.isArray(filter)) {
    return filter as string[];
  }
  return [];
}

/**
 * Given tag paths like ["Difficulty > Hard", "Subject > Math"], convert them to an array of Meilisearch
 * filter conditions. The tag filters are all AND conditions (not OR).
 * @param tagsFilter e.g. `["Difficulty > Hard", "Subject > Math"]`
 */
function formatTagsFilter(tagsFilter?: string[]): string[] {
  const filters: string[] = [];

  tagsFilter?.forEach((tagPath) => {
    const parts = tagPath.split(TAG_SEP);
    if (parts.length === 1) {
      filters.push(`tags.taxonomy = "${tagPath}"`);
    } else {
      filters.push(`tags.level${parts.length - 2} = "${tagPath}"`);
    }
  });

  return filters;
}

/**
 * The tags that are associated with a search result, at various levels of the tag hierarchy.
 */
export interface ContentHitTags {
  taxonomy?: string[];
  level0?: string[];
  level1?: string[];
  level2?: string[];
  level3?: string[];
}

/**
 * Information about a single XBlock returned in the search results
 * Defined in edx-platform/openedx/core/djangoapps/content/search/documents.py
 */
interface BaseContentHit {
  id: string;
  type: 'course_block' | 'library_block' | 'collection';
  displayName: string;
  usageKey: string;
  blockId: string;
  /** The course or library ID */
  contextKey: string;
  org: string;
  breadcrumbs: Array<{ displayName: string }>;
  tags: ContentHitTags;
  /** Same fields with <mark>...</mark> highlights */
  formatted: { displayName: string, content?: ContentDetails, description?: string };
  created: number;
  modified: number;
}

/**
 * Information about a single XBlock returned in the search results
 * Defined in edx-platform/openedx/core/djangoapps/content/search/documents.py
 */
export interface ContentHit extends BaseContentHit {
  /** The block_type part of the usage key. What type of XBlock this is. */
  blockType: string;
  /**
   * Breadcrumbs:
   * - First one is the name of the course/library itself.
   * - After that is the name and usage key of any parent Section/Subsection/Unit/etc.
   */
  type: 'course_block' | 'library_block';
  breadcrumbs: [{ displayName: string }, ...Array<{ displayName: string, usageKey: string }>];
  description?: string;
  content?: ContentDetails;
  lastPublished: number | null;
  collections: { displayName?: string[], key?: string[] };
  published?: ContentPublishedData;
  formatted: BaseContentHit['formatted'] & { published?: ContentPublishedData, };
}

/**
 * Information about the published data of single Xblock returned in search results
 * Defined in edx-platform/openedx/core/djangoapps/content/search/documents.py
 */
export interface ContentPublishedData {
  description?: string,
  displayName?: string,
  numChildren?: number,
}

/**
 * Information about a single collection returned in the search results
 * Defined in edx-platform/openedx/core/djangoapps/content/search/documents.py
 */
export interface CollectionHit extends BaseContentHit {
  type: 'collection';
  description: string;
  numChildren?: number;
  published?: ContentPublishedData;
}

/**
 * Convert search hits to camelCase
 * @param hit A search result directly from Meilisearch
 */
export function formatSearchHit(hit: Record<string, any>): ContentHit | CollectionHit {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { _formatted, ...newHit } = hit;
  newHit.formatted = {
    displayName: _formatted?.display_name,
    content: _formatted?.content ?? {},
    description: _formatted?.description,
    published: _formatted?.published,
  };
  return camelCaseObject(newHit);
}

interface FetchSearchParams {
  client: MeiliSearch,
  indexName: string,
  searchKeywords: string,
  blockTypesFilter?: string[],
  problemTypesFilter?: string[],
  /** The full path of tags that each result MUST have, e.g. ["Difficulty > Hard", "Subject > Math"] */
  tagsFilter?: string[],
  extraFilter?: Filter,
  sort?: SearchSortOption[],
  /** How many results to skip, e.g. if limit=20 then passing offset=20 gets the second page. */
  offset?: number,
  skipBlockTypeFetch?: boolean,
}

export async function fetchSearchResults({
  client,
  indexName,
  searchKeywords,
  blockTypesFilter,
  problemTypesFilter,
  tagsFilter,
  extraFilter,
  sort,
  offset = 0,
  skipBlockTypeFetch = false,
}: FetchSearchParams): Promise<{
    hits: (ContentHit | CollectionHit)[],
    nextOffset: number | undefined,
    totalHits: number,
    blockTypes: Record<string, number>,
    problemTypes: Record<string, number>,
  }> {
  const queries: MultiSearchQuery[] = [];

  // Convert 'extraFilter' into an array
  const extraFilterFormatted = forceArray(extraFilter);

  const blockTypesFilterFormatted = blockTypesFilter?.length ? [blockTypesFilter.map(bt => `block_type = ${bt}`)] : [];

  const problemTypesFilterFormatted = problemTypesFilter?.length ? [problemTypesFilter.map(pt => `content.problem_types = ${pt}`)] : [];

  const tagsFilterFormatted = formatTagsFilter(tagsFilter);

  const limit = 20; // How many results to retrieve per page.

  // To filter normal block types and problem types as 'OR' query
  const typeFilters = [[
    ...blockTypesFilterFormatted,
    ...problemTypesFilterFormatted,
  ].flat()];

  // First query is always to get the hits, with all the filters applied.
  queries.push({
    indexUid: indexName,
    q: searchKeywords,
    filter: [
      // top-level entries in the array are AND conditions and must all match
      // Inner arrays are OR conditions, where only one needs to match.
      ...typeFilters,
      ...extraFilterFormatted,
      ...tagsFilterFormatted,
    ],
    attributesToHighlight: ['display_name', 'description', 'published'],
    highlightPreTag: HIGHLIGHT_PRE_TAG,
    highlightPostTag: HIGHLIGHT_POST_TAG,
    attributesToCrop: ['description', 'published'],
    sort,
    offset,
    limit,
  });

  // The second query is to get the possible values for the "block types" filter
  if (!skipBlockTypeFetch) {
    queries.push({
      indexUid: indexName,
      facets: ['block_type', 'content.problem_types'],
      filter: [
        ...extraFilterFormatted,
        // We exclude the block type filter here so we get all the other available options for it.
        ...tagsFilterFormatted,
      ],
      limit: 0, // We don't need any "hits" for this - just the facetDistribution
    });
  }

  const { results } = await client.multiSearch(({ queries }));
  const hitLength = results[0].hits.length;
  return {
    hits: results[0].hits.map(formatSearchHit) as ContentHit[],
    totalHits: results[0].totalHits ?? results[0].estimatedTotalHits ?? hitLength,
    blockTypes: results[1]?.facetDistribution?.block_type ?? {},
    problemTypes: results[1]?.facetDistribution?.['content.problem_types'] ?? {},
    nextOffset: hitLength === limit ? offset + limit : undefined,
  };
}

/**
 * Fetch the block types facet distribution for the search results.
 */
export const fetchBlockTypes = async (
  client: MeiliSearch,
  indexName: string,
  extraFilter?: Filter,
): Promise<Record<string, number>> => {
  // Convert 'extraFilter' into an array
  const extraFilterFormatted = forceArray(extraFilter);

  const { results } = await client.multiSearch({
    queries: [{
      indexUid: indexName,
      facets: ['block_type'],
      filter: extraFilterFormatted,
      limit: 0, // We don't need any "hits" for this - just the facetDistribution
    }],
  });

  return results[0].facetDistribution?.block_type ?? {};
};

/** Information about a single tag in the tag tree, as returned by fetchAvailableTagOptions() */
export interface TagEntry {
  tagName: string;
  tagPath: string;
  tagCount: number;
  hasChildren: boolean;
}

/**
 * In the context of a particular search (which may already be filtered to a specific course, specific block types,
 * and/or have a keyword search applied), get the tree of tags that can be used to further filter/refine the search.
 */
export async function fetchAvailableTagOptions({
  client,
  indexName,
  searchKeywords,
  blockTypesFilter,
  extraFilter,
  parentTagPath,
  // Ideally this would include 'tagSearchKeywords' to filter the tag tree by keyword search but that's not possible yet
}: {
  /** The Meilisearch client instance */
  client: MeiliSearch;
  /** Which index to search */
  indexName: string;
  /** Overall query string for the search; may be empty */
  searchKeywords: string;
  /** Filter to only include these block types e.g. ["problem", "html"] */
  blockTypesFilter?: string[];
  /** Any other filters to apply, e.g. course ID. */
  extraFilter?: Filter;
  /** Only fetch tags below this parent tag/taxonomy e.g. "Places > North America" */
  parentTagPath?: string;
}): Promise<{ tags: TagEntry[]; mayBeMissingResults: boolean; }> {
  const meilisearchFacetLimit = 100; // The 'maxValuesPerFacet' on the index. For Open edX we leave the default, 100.

  // Convert 'extraFilter' into an array
  const extraFilterFormatted = forceArray(extraFilter);

  const blockTypesFilterFormatted = blockTypesFilter?.length ? [blockTypesFilter.map(bt => `block_type = ${bt}`)] : [];

  // Figure out which "facet" (attribute of the documents in the search index) holds the tags at the level we want.
  // e.g. "tags.taxonomy" is the facet/attribute that holds the root tags, and "tags.level0" has its child tags.
  let facetName;
  let depth;
  let parentFilter: string[] = [];
  if (!parentTagPath) {
    facetName = 'tags.taxonomy';
    depth = 0;
  } else {
    const parentParts = parentTagPath.split(TAG_SEP);
    depth = parentParts.length;
    facetName = `tags.level${depth - 1}`;
    const parentFacetName = parentParts.length === 1 ? 'tags.taxonomy' : `tags.level${parentParts.length - 2}`;
    parentFilter = [`${parentFacetName} = "${parentTagPath}"`];
  }

  // As an optimization, start pre-loading the data about "has child tags", if we will need it later.
  // Notice we don't 'await' the result of this request, so it can happen in parallel with the main request that follows
  const maybeHasChildren = depth > 0 && depth < 4; // If depth=0, it definitely has children; we don't support depth > 4
  const nextLevelFacet = `tags.level${depth}`; // This will give the children of the current tags.
  const preloadChildTagsData = maybeHasChildren ? client.index(indexName).searchForFacetValues({
    facetName: nextLevelFacet,
    facetQuery: parentTagPath,
    q: searchKeywords,
    filter: [...extraFilterFormatted, ...blockTypesFilterFormatted, ...parentFilter],
  }) : undefined;

  // Now load the facet values. Doing it with this API gives us much more flexibility in loading than if we just
  // requested the facets by passing { facets: ["tags"] } into the main search request; that works fine for loading the
  // root tags but can't load specific child tags like we can using this approach.
  const tags: TagEntry[] = [];
  const { facetHits } = await client.index(indexName).searchForFacetValues({
    facetName,
    // It's not super clear in the documentation, but facetQuery is basically a "startsWith" query, which is what we
    // need here to return just the tags below the selected parent tag. However, it's a fuzzy query that may match
    // more tags than we want it to, so we have to explicitly post-process and reduce the set of results using an
    // exact match.
    facetQuery: parentTagPath,
    q: searchKeywords,
    filter: [...extraFilterFormatted, ...blockTypesFilterFormatted, ...parentFilter],
  });
  facetHits.forEach(({ value: tagPath, count: tagCount }) => {
    if (!parentTagPath) {
      tags.push({
        tagName: tagPath,
        tagPath,
        tagCount,
        hasChildren: true, // You can't tag something with just a taxonomy, so this definitely has child tags.
      });
    } else {
      const parts = tagPath.split(TAG_SEP);
      const tagName = parts[parts.length - 1];
      if (tagPath === `${parentTagPath}${TAG_SEP}${tagName}`) {
        tags.push({
          tagName,
          tagPath,
          tagCount,
          hasChildren: false, // We'll set this later
        });
      } // Else this is a tag from another taxonomy/parent that was included because this search is "fuzzy". Ignore it.
    }
  });

  // Figure out if [some of] the tags at this level have children:
  if (maybeHasChildren) {
    if (preloadChildTagsData === undefined) { throw new Error('Child tags data unexpectedly not pre-loaded'); }
    // Retrieve the children of the current tags:
    const { facetHits: childFacetHits } = await preloadChildTagsData;
    if (childFacetHits.length >= meilisearchFacetLimit) {
      // Assume they all have child tags; we can't retrieve more than 100 facet values (per Meilisearch docs) so
      // we can't say for sure on a tag-by-tag basis, but we know that at least some of them have children, so
      // it's a safe bet that most/all of them have children. And it's not a huge problem if we say they have children
      // but they don't.
      // eslint-disable-next-line no-param-reassign
      tags.forEach((t) => { t.hasChildren = true; });
    } else if (childFacetHits.length > 0) {
      // Some (or maybe all) of these tags have child tags. Let's figure out which ones exactly.
      const tagsWithChildren = new Set<string>();
      childFacetHits.forEach(({ value }) => {
        // Trim the child tag off: 'Places > North America > New York' becomes 'Places > North America'
        const tagPath = value.split(TAG_SEP).slice(0, -1).join(TAG_SEP);
        tagsWithChildren.add(tagPath);
      });
      // eslint-disable-next-line no-param-reassign
      tags.forEach((t) => { t.hasChildren = tagsWithChildren.has(t.tagPath); });
    }
  }

  // If we hit the limit of facetHits, there are probably even more tags, but there is no API to retrieve
  // them (no pagination etc.), so just tell the user that not all tags could be displayed. This should be pretty rare.
  return { tags, mayBeMissingResults: facetHits.length >= meilisearchFacetLimit };
}

/**
 * Best-effort search for *all* tags among the search results (with filters applied) that contain the given keyword.
 *
 * Unfortunately there is no good Meilisearch API for this, so we just have to do the best we can. If more than 1,000
 * objects are tagged with matching tags, this will be an incomplete result. For example, if 1,000 XBlocks/components
 * are tagged with "Tag Alpha 1" and 10 XBlocks are tagged with "Tag Alpha 2", a search for "Alpha" may only return
 * ["Tag Alpha 1"] instead of the correct result ["Tag Alpha 1", "Tag Alpha 2"] because we are limited to 1,000 matches,
 * which may all have the same tags.
 */
export async function fetchTagsThatMatchKeyword({
  client,
  indexName,
  blockTypesFilter,
  extraFilter,
  tagSearchKeywords,
}: {
  /** The Meilisearch client instance */
  client: MeiliSearch;
  /** Which index to search */
  indexName: string;
  /** Filter to only include these block types e.g. `["problem", "html"]` */
  blockTypesFilter?: string[];
  /** Any other filters to apply to the overall search. */
  extraFilter?: Filter;
  /** Only show taxonomies/tags that match these keywords */
  tagSearchKeywords?: string;
}): Promise<{ mayBeMissingResults: boolean; matches: { tagPath: string }[] }> {
  if (!tagSearchKeywords || tagSearchKeywords.trim() === '') {
    // This data isn't needed if there is no tag keyword search. Don't bother making a search query.
    return { matches: [], mayBeMissingResults: false };
  }
  // Convert 'extraFilter' into an array
  const extraFilterFormatted = forceArray(extraFilter);

  const blockTypesFilterFormatted = blockTypesFilter?.length ? [blockTypesFilter.map(bt => `block_type = ${bt}`)] : [];

  const limit = 1000; // This is the most results we can retrieve in a single query.

  // We search for any matches of the keyword in the "tags" field, respecting the current filters like block type filter
  // or current course filter. (Unfortunately we cannot also include the overall `searchKeywords` so this will match
  // against more content than it should.)
  const { hits } = await client.index(indexName).search(tagSearchKeywords, {
    filter: [...extraFilterFormatted, ...blockTypesFilterFormatted],
    attributesToSearchOn: ['tags.taxonomy', 'tags.level0', 'tags.level1', 'tags.level2', 'tags.level3'],
    attributesToRetrieve: ['tags'],
    limit,
    // We'd like to use 'showMatchesPosition: true' to know exactly which tags match, but it doesn't provide the
    // detail we need; it's impossible to tell which tag at a given level matched based on the returned _matchesPosition
    // data - https://github.com/orgs/meilisearch/discussions/550
  });

  const tagSearchKeywordsLower = tagSearchKeywords.toLocaleLowerCase();

  const matches = new Set<string>();

  // We have data like this:
  // hits: [
  //   {
  //     tags: {
  //       taxonomy: ["Competency"],
  //       level0: ["Competency > Abilities"],
  //       level1: ["Competency > Abilities > ..."]
  //     }, ...
  //   }, ...
  // ]
  hits.forEach((hit) => {
    Object.values(hit.tags).forEach((tagPathList: string[]) => {
      tagPathList.forEach((tagPath) => {
        if (tagPath.toLocaleLowerCase().includes(tagSearchKeywordsLower)) {
          matches.add(tagPath);
        }
      });
    });
  });

  return { matches: Array.from(matches).map((tagPath) => ({ tagPath })), mayBeMissingResults: hits.length === limit };
}
