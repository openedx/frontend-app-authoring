/**
 * The maximum allowable depth for any tag in the taxonomy (0-indexed).
 * * **Constraint**: A value of 3 allows levels 0, 1, 2, and 3. Creation of new subtags
 * is disabled for any tag already at this depth to prevent exceeding the limit.
 * * **Data Handling**: This is a UI safety gate, not a filter. If the backend returns
 * tags exceeding this depth, they will still be rendered, but further nesting will be blocked.
 * * **Sync Required**: This must match `TAXONOMY_MAX_DEPTH` in the openedx-core backend.
 */
const TAXONOMY_MAX_DEPTH = 3;

export { TAXONOMY_MAX_DEPTH };
