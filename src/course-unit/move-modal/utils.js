import { CATEGORIES_KEYS } from './constants';

/**
 * Determines the XBlock type based on the provided category and parent information.
 *
 * @param {string} category - The category of the XBlock (e.g., 'chapter', 'sequential', 'vertical').
 * @param {string} parentCategory  - The category of the parent XBlock, if applicable.
 * @returns {string} - The determined XBlock type (e.g., 'section', 'subsection', 'unit').
 */
export const getXBlockType = (category, parentCategory) => {
  switch (true) {
    case category === CATEGORIES_KEYS.chapter:
      return CATEGORIES_KEYS.section;
    case category === CATEGORIES_KEYS.sequential:
      return CATEGORIES_KEYS.subsection;
    case category === CATEGORIES_KEYS.vertical:
      return CATEGORIES_KEYS.unit;
    default:
      return category;
  }
};

/**
 * Recursively finds the parent IDs of the target ID in a hierarchical object structure.
 * It returns an array of IDs leading to the target, including the target's own ID.
 *
 * @param {Object} tree - The hierarchical object to search through.
 * @param {string} targetId - The ID of the target element for which to find the parent IDs.
 * @returns {string[]}  - An array of IDs representing the path from the root to the target element.
 */
export const findParentIds = (tree, targetId) => {
  let path = [];

  function traverse(node, targetId, currentPath) {
    if (!node) return false;

    currentPath.push(node.id);

    if (node.id === targetId) {
      path = currentPath.slice();
      return true;
    }

    for (let child of node.child_info?.children ?? []) {
      if (traverse(child, targetId, currentPath)) {
        return true;
      }
    }

    currentPath.pop();
    return false;
  }

  traverse(tree, targetId, []);
  return path;
}
