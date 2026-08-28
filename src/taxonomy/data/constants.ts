/**
 * The maximum number of taxonomy items expected.
 * Used to ensure that we load all nested subtags.
 * This is set to the maximum value allowed by the backend.
 * However, if the taxonomy size exceeds this value, the results
 * will be incomplete because the backend only supports a taxonomy size of 10,000 items or fewer.
 */
export const MAX_TAXONOMY_ITEMS = 10000;

/**
 * The type of a taxonomy.
 *
 * Note: the backend also has a "system" type, reserved for platform-defined
 * taxonomies. It is intentionally not selectable by users.
 */
export enum TaxonomyType {
  Tags = 'tags',
  Competency = 'competency',
}
