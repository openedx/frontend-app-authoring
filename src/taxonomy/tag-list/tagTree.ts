import { TagTreeError } from './errors';
import type { TagData } from '../data/types';

export interface TagTreeNode extends TagData {
  subRows?: TagTreeNode[];
}

/**
 * TagTree
 * A robust utility class for managing a tree of table rows based on a flat list of TagData.
 *
 * The tree is designed to be used as row data for tanstack/react-table.
 * The focus is on reliability, and it has not been performance-optimized yet.
 */
export class TagTree {
  private data: TagData[];

  private rows: TagTreeNode[];

  constructor(data: TagData[]) {
    this.data = data;
    this.rows = [];
    this.buildTree();
  }

  /** Returns a flattened copy of all nodes in the tree.
   * For example, this array is not nested even though it contains a parent and a child tag:
   * [
   *   {
   *     value: 'parent tag name',
   *     externalId: null,
   *     childCount: 2,
   *     depth: 0,
   *     parentValue: null,
   *     id: 1,
   *     subTagsUrl: 'http://example.com',
   *     canChangeTag: true,
   *     canDeleteTag: true,
   *   },
   *   {
   *     value: 'child tag name',
   *     externalId: null,
   *     childCount: 0,
   *     depth: 1,
   *     parentValue: 'parent tag name',
   *     id: 2,
   *     subTagsUrl: 'http://example.com',
   *     canChangeTag: true,
   *     canDeleteTag: true,
   *   },
   *  // ... more tags
   * ]
   */
  getAllFlattenedAsCopy(): TagData[] {
    const flatten = (nodes: TagTreeNode[], accumulator: TagData[] = []): TagData[] => {
      for (const node of nodes) {
        const { subRows, ...tagData } = node;
        accumulator.push({ ...tagData }); // Create a shallow copy of the tag data without subRows
        if (node.subRows) {
          flatten(node.subRows, accumulator);
        }
      }
      return accumulator;
    };
    return flatten(this.rows);
  }

  getAllAsDeepCopy(): TagTreeNode[] {
    return JSON.parse(JSON.stringify(this.rows));
  }

  /** For extra robustness, we verify that there are no duplicate values
   * in the data. (The backend also guarantees this.)
   */
  private validateNoDuplicateValues(items: TagData[]) {
    const seenValues = new Set<string>();
    for (const item of items) {
      const lowerCaseValue = item.value.toLowerCase();
      if (seenValues.has(lowerCaseValue)) {
        throw new TagTreeError(`Duplicate tag value found: ${lowerCaseValue}`);
      }
      seenValues.add(lowerCaseValue);
    }
  }

  /** For extra robustness, we verify that there are no cycles in the data. (The backend also guarantees this.) */
  private validateNoCycles(items: TagData[]) {
    const parentByValue: { [key: string]: string | null } = {};
    for (const item of items) {
      parentByValue[item.value.toLowerCase()] = item.parentValue ? item.parentValue.toLowerCase() : null;
    }

    const visitStatus: { [key: string]: number } = {};

    const detectCycle = (value: string): boolean => {
      const status = visitStatus[value] || 0;
      if (status === 1) {
        return true;
      }
      if (status === 2) {
        return false;
      }

      visitStatus[value] = 1;
      const parentValue = parentByValue[value];
      if (parentValue !== null && Object.prototype.hasOwnProperty.call(parentByValue, parentValue)) {
        if (detectCycle(parentValue)) {
          return true;
        }
      }
      visitStatus[value] = 2;
      return false;
    };

    for (const item of items) {
      if (detectCycle(item.value.toLowerCase())) {
        throw new TagTreeError('Cycle detected in tag hierarchy.');
      }
    }
  }

  buildTree() {
    if (!this.data) {
      this.rows = [];
      return;
    }

    this.validateNoDuplicateValues(this.data);
    this.validateNoCycles(this.data);

    const treeChildren: TagTreeNode[] = [];
    const lookup: { [key: string]: TagTreeNode } = {};

    // Step 1: Create a lookup map of all items using 'value' as the key.
    // We use the spread operator (...) to create a shallow copy so we
    // don't mutate the original data array.
    for (const item of this.data) {
      lookup[item.value] = { ...item };
    }

    // Step 2: Iterate through the data again to link children to their parents.
    for (const item of this.data) {
      // Get the reference to the newly copied object in our lookup map
      const currentNode = lookup[item.value];
      const parentValue = currentNode?.parentValue;

      if (parentValue !== null && lookup[parentValue]) {
        // If the node has a parent, initialize the subRows array (if needed) and push it
        const parentNode = lookup[parentValue];
        if (!parentNode.subRows) {
          parentNode.subRows = [];
        }
        parentNode.subRows.push(currentNode);
      } else {
        // If there is no parentValue (or it equals null), it is a root node
        treeChildren.push(currentNode);
      }
    }

    this.rows = treeChildren;
  }

  private findNodeByValueRecursive(nodes: TagTreeNode[], value: string): TagTreeNode | null {
    for (const node of nodes) {
      if (node.value === value) {
        return node;
      }
      if (node.subRows) {
        const found = this.findNodeByValueRecursive(node.subRows, value);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  private getNode(value: string): TagTreeNode | null {
    return this.findNodeByValueRecursive(this.rows, value);
  }

  // We don't want to expose editing the tree nodes directly, so that tree integrity is maintained.
  getTagAsDeepCopy(value: string): TagTreeNode | null {
    const node = this.getNode(value);
    if (node) {
      return JSON.parse(JSON.stringify(node));
    }
    return null;
  }

  // For now, only editing a tag's "value" property is supported.
  editTagValue(oldValue: string, newValue: string) {
    const node = this.getNode(oldValue);
    if (node) {
      if (oldValue !== newValue && this.getNode(newValue)) {
        throw new TagTreeError(`Cannot change tag value to existing value: ${newValue}`);
      }
      node.value = newValue;
    }
    return node;
  }

  addNode(newNode: TagTreeNode, parentValue: string | null = null) {
    if (this.getNode(newNode.value)) {
      throw new TagTreeError(`Cannot add duplicate tag value: ${newNode.value}`);
    }

    if (parentValue) {
      const parentNode = this.getNode(parentValue);
      if (parentNode) {
        if (!parentNode.subRows) {
          parentNode.subRows = [];
        }
        parentNode.subRows.unshift(newNode);
      }
    } else {
      this.rows.unshift(newNode);
    }
  }

  removeNode(value: string, parentValue: string | null = null): TagTreeNode | null {
    const node = this.getNode(value);
    if (!node) {
      return null;
    }
    if (parentValue) {
      const parentNode = this.getNode(parentValue);
      if (parentNode && parentNode.subRows) {
        parentNode.subRows = parentNode.subRows.filter(subNode => subNode.value !== value);
      }
    } else {
      this.rows = this.rows.filter(rootNode => rootNode.value !== value);
    }
    return node;
  }
}
