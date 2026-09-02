/**
 * The maximum number of taxonomy items expected.
 * Used to ensure that we load all nested subtags.
 * This is set to the maximum value allowed by the backend.
 * However, if the taxonomy size exceeds this value, the results
 * will be incomplete because the backend only supports a taxonomy size of 10,000 items or fewer.
 */
export const MAX_TAXONOMY_ITEMS = 10000;

export enum TaxonomyType {
  /**
   * A taxonomy whose tags are only labels for content. They say what a piece of content is about,
   * and carry no rules about demonstrating mastery of what they describe.
   */
  Tags = 'tags',
  /**
   * A taxonomy of skills. Beyond labelling content, choosing this type enables the Competency
   * Management page, where the rules used to demonstrate mastery of those skills are configured.
   */
  Competency = 'competency',
}
