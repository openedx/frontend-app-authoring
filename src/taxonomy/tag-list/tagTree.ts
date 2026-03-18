import TagTreeError from './tagTreeError';

export interface TagData {
  childCount: number;
  descendantCount: number;
  depth: number;
  externalId?: string | null;
  canChangeTag?: boolean;
  canDeleteTag?: boolean;
  id: number;
  parentValue: string | null;
  subTagsUrl: string | null;
  value: string;
  usageCount?: number;
  _id?: string;
}

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

  getAllFlattenedAsCopy(): TagTreeNode[] {
    const flatten = (nodes: TagTreeNode[], accumulator: TagTreeNode[] = []): TagTreeNode[] => {
      for (const node of nodes) {
        accumulator.push({ ...node, subRows: undefined });
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

  private validateNoDuplicateValues(items: TagData[]) {
    // this should be case-sensitive to account for conceivable duplicates that have different cases in the backend.
    const seenValues = new Set<string>();
    for (const item of items) {
      if (seenValues.has(item.value)) {
        throw new TagTreeError(`Duplicate tag value found: ${item.value}`);
      }
      seenValues.add(item.value);
    }
  }

  private validateNoCycles(items: TagData[]) {
    const parentByValue: { [key: string]: string | null } = {};
    for (const item of items) {
      parentByValue[item.value] = item.parentValue;
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
      if (detectCycle(item.value)) {
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
