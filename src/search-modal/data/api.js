// @ts-check
import { camelCaseObject, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

export const getContentSearchConfigUrl = () => new URL(
  'api/content_search/v2/studio/',
  getConfig().STUDIO_BASE_URL,
).href;

/** The separator used for hierarchical tags in the search index, e.g. tags.level1 = "Subject > Math > Calculus" */
export const TAG_SEP = ' > ';

export const highlightPreTag = '__meili-highlight__'; // Indicate the start of a highlighted (matching) term
export const highlightPostTag = '__/meili-highlight__'; // Indicate the end of a highlighted (matching) term

/**
 * Get the content search configuration from the CMS.
 *
 * @returns {Promise<{url: string, indexName: string, apiKey: string}>}
 */
export const getContentSearchConfig = async () => {
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
 * @typedef {{htmlContent?: string, capaContent?: string, [k: string]: any}} ContentDetails
 */

/**
 * Meilisearch filters can be expressed as strings or arrays.
 * This helper method converts from any supported input format to an array, for consistency.
 * @param {import('meilisearch').Filter} [filter] A filter expression, e.g. 'foo = bar' or [['a = b', 'a = c'], 'd = e']
 * @returns {(string | string[])[]}
 */
function forceArray(filter) {
  if (typeof filter === 'string') {
    return [filter];
  }
  if (filter === undefined) {
    return [];
  }
  return filter;
}

/**
 * Given tag paths like ["Difficulty > Hard", "Subject > Math"], convert them to an array of Meilisearch
 * filter conditions. The tag filters are all AND conditions (not OR).
 * @param {string[]} [tagsFilter] e.g. ["Difficulty > Hard", "Subject > Math"]
 * @returns {string[]}
 */
function formatTagsFilter(tagsFilter) {
  /** @type {string[]} */
  const filters = [];

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
 * Information about a single XBlock returned in the search results
 * Defined in edx-platform/openedx/core/djangoapps/content/search/documents.py
 * @typedef {Object} ContentHit
 * @property {string} id
 * @property {string} usageKey
 * @property {"course_block"|"library_block"} type
 * @property {string} blockId
 * @property {string} displayName
 * @property {string} blockType The block_type part of the usage key. What type of XBlock this is.
 * @property {string} contextKey The course or library ID
 * @property {string} org
 * @property {[{displayName: string}, ...Array<{displayName: string, usageKey: string}>]} breadcrumbs
 *          First one is the name of the course/library itself.
 *          After that is the name and usage key of any parent Section/Subsection/Unit/etc.
 * @property {Record<'taxonomy'|'level0'|'level1'|'level2'|'level3', string[]>} tags
 * @property {ContentDetails} [content]
 * @property {{displayName: string, content: ContentDetails}} formatted Same fields with <mark>...</mark> highlights
 */

/**
 * Convert search hits to camelCase
 * @param {Record<string, any>} hit A search result directly from Meilisearch
 * @returns {ContentHit}
 */
function formatSearchHit(hit) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { _formatted, ...newHit } = hit;
  newHit.formatted = {
    displayName: _formatted.display_name,
    content: _formatted.content ?? {},
  };
  return camelCaseObject(newHit);
}

/**
 * @param {{
 *   client: import('meilisearch').MeiliSearch,
 *   indexName: string,
 *   searchKeywords: string,
 *   blockTypesFilter?: string[],
 *   tagsFilter?: string[],
 *   extraFilter?: import('meilisearch').Filter,
 *   offset?: number,
 * }} context
 * @returns {Promise<{
 *   hits: ContentHit[],
 *   nextOffset: number|undefined,
 *   totalHits: number,
 *   blockTypes: Record<string, number>,
 * }>}
 */
export async function fetchSearchResults({
  client,
  indexName,
  searchKeywords,
  blockTypesFilter,
  /** The full path of tags that each result MUST have, e.g. ["Difficulty > Hard", "Subject > Math"] */
  tagsFilter,
  extraFilter,
  /** How many results to skip, e.g. if limit=20 then passing offset=20 gets the second page. */
  offset = 0,
}) {
  /** @type {import('meilisearch').MultiSearchQuery[]} */
  const queries = [];

  // Convert 'extraFilter' into an array
  const extraFilterFormatted = forceArray(extraFilter);

  const blockTypesFilterFormatted = blockTypesFilter?.length ? [blockTypesFilter.map(bt => `block_type = ${bt}`)] : [];

  const tagsFilterFormatted = formatTagsFilter(tagsFilter);

  const limit = 20; // How many results to retrieve per page.

  // First query is always to get the hits, with all the filters applied.
  queries.push({
    indexUid: indexName,
    q: searchKeywords,
    filter: [
      // top-level entries in the array are AND conditions and must all match
      // Inner arrays are OR conditions, where only one needs to match.
      ...extraFilterFormatted,
      ...blockTypesFilterFormatted,
      ...tagsFilterFormatted,
    ],
    attributesToHighlight: ['display_name', 'content'],
    highlightPreTag,
    highlightPostTag,
    attributesToCrop: ['content'],
    cropLength: 20,
    offset,
    limit,
  });

  // The second query is to get the possible values for the "block types" filter
  queries.push({
    indexUid: indexName,
    q: searchKeywords,
    facets: ['block_type'],
    filter: [
      ...extraFilterFormatted,
      // We exclude the block type filter here so we get all the other available options for it.
      ...tagsFilterFormatted,
    ],
    limit: 0, // We don't need any "hits" for this - just the facetDistribution
  });

  const { results } = await client.multiSearch(({ queries }));
  return {
    hits: results[0].hits.map(formatSearchHit),
    totalHits: results[0].totalHits ?? results[0].estimatedTotalHits ?? results[0].hits.length,
    blockTypes: results[1].facetDistribution?.block_type ?? {},
    nextOffset: results[0].hits.length === limit ? offset + limit : undefined,
  };
}

/**
 * In the context of a particular search (which may already be filtered to a specific course, specific block types,
 * and/or have a keyword search applied), get the tree of tags that can be used to further filter/refine the search.
 *
 * @param {object} context
 * @param {import('meilisearch').MeiliSearch} context.client The Meilisearch client instance
 * @param {string} context.indexName Which index to search
 * @param {string} context.searchKeywords Overall query string for the search; may be empty
 * @param {string[]} [context.blockTypesFilter] Filter to only include these block types e.g. ["problem", "html"]
 * @param {import('meilisearch').Filter} [context.extraFilter] Any other filters to apply, e.g. course ID.
 * @param {string} [context.parentTagPath] Only fetch tags below this parent tag/taxonomy e.g. "Places > North America"
 * @returns {Promise<{
 *   tags: {tagName: string, tagPath: string, tagCount: number, hasChildren: boolean}[];
 *   mayBeMissingResults: boolean;
 * }>}
 */
export async function fetchAvailableTagOptions({
  client,
  indexName,
  searchKeywords,
  blockTypesFilter,
  extraFilter,
  parentTagPath,
  // Ideally this would include 'tagSearchKeywords' to filter the tag tree by keyword search but that's not possible yet
}) {
  const meilisearchFacetLimit = 100; // The 'maxValuesPerFacet' on the index. For Open edX we leave the default, 100.

  // Convert 'extraFilter' into an array
  const extraFilterFormatted = forceArray(extraFilter);

  const blockTypesFilterFormatted = blockTypesFilter?.length ? [blockTypesFilter.map(bt => `block_type = ${bt}`)] : [];

  // Figure out which "facet" (attribute of the documents in the search index) holds the tags at the level we want.
  // e.g. "tags.taxonomy" is the facet/attribute that holds the root tags, and "tags.level0" has its child tags.
  let facetName;
  let depth;
  /** @type {string[]} */
  let parentFilter = [];
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
  /** @type {{tagName: string, tagPath: string, tagCount: number, hasChildren: boolean}[]} */
  const tags = [];
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
      /** @type {Set<string>} */
      const tagsWithChildren = new Set();
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
 *
 * @param {object} context
 * @param {import('meilisearch').MeiliSearch} context.client The Meilisearch client instance
 * @param {string} context.indexName Which index to search
 * @param {string[]} [context.blockTypesFilter] Filter to only include these block types e.g. ["problem", "html"]
 * @param {import('meilisearch').Filter} [context.extraFilter] Any other filters to apply to the overall search.
 * @param {string} [context.tagSearchKeywords] Only show taxonomies/tags that match these keywords
 * @returns {Promise<{ mayBeMissingResults: boolean; matches: {tagPath: string}[] }>}
 */
export async function fetchTagsThatMatchKeyword({
  client,
  indexName,
  blockTypesFilter,
  extraFilter,
  tagSearchKeywords,
}) {
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
    // We'd like to use 'showMatchesPosition: true' to know exaclty which tags match, but it doesn't provide the
    // detail we need; it's impossible to tell which tag at a given level matched based on the returned _matchesPosition
    // data - https://github.com/orgs/meilisearch/discussions/550
  });

  const tagSearchKeywordsLower = tagSearchKeywords.toLocaleLowerCase();

  /** @type {Set<string>} */
  const matches = new Set();

  // We have data like this:
  // hits: [
  //   {
  //     tags: { taxonomy: "Competency", "level0": "Competency > Abilities", "level1": "Competency > Abilities > ..." },
  //   }, ...
  // ]
  hits.forEach((hit) => {
    Object.values(hit.tags).forEach((tagPathList) => {
      tagPathList.forEach((tagPath) => {
        if (tagPath.toLocaleLowerCase().includes(tagSearchKeywordsLower)) {
          matches.add(tagPath);
        }
      });
    });
  });

  return { matches: Array.from(matches).map((tagPath) => ({ tagPath })), mayBeMissingResults: hits.length === limit };
}
