/**
 * The maximum number of taxonomy items expected.
 * This is used to set `full_depth_threshold` for the tag list API endpoint,
 * which determines when to include the `full_depth` field in the response.
 * Right now we expect to load all tags for a taxonomy in one request,
 * and we just set this number really high to avoid any edge cases.
 */
export const EXPECTED_MAX_TAXONOMY_ITEMS = 100000000;
