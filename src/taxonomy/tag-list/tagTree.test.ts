import { rawData, treeRowData } from './mockData';
import { TagTree } from './tagTree';
import TagTreeError from './tagTreeError';

const newSubtagChildRow = {
  value: 'newChild',
  externalId: null,
  canChangeTag: true,
  canDeleteTag: true,
  id: 8,
  parentValue: 'ab',
  subTagsUrl: null,
  childCount: 0,
  descendantCount: 0,
  depth: 1,
};

describe('TagTree', () => {
  it('builds a tree structure from flat tag data', () => {
    const tree = new TagTree(rawData);
    expect(tree.getAllAsDeepCopy()).toEqual(treeRowData);
  });

  it('handles empty data', () => {
    const tree = new TagTree([]);
    expect(tree.getAllAsDeepCopy()).toEqual([]);
  });

  it('gets all rows as deep copy', () => {
    const tree = new TagTree(rawData);
    const nodes = tree.getAllAsDeepCopy();
    expect(nodes).toEqual(treeRowData);
  });

  it('gets a node by value', () => {
    const tree = new TagTree(rawData);
    const node = tree.getTagAsDeepCopy('ab');
    expect(node).not.toBeNull();
    expect(node?.value).toBe('ab');
  });

  it('gets a deep copy when getting a node so that direct mutations do not affect the original tree', () => {
    const tree = new TagTree(rawData);
    const node = tree.getTagAsDeepCopy('ab');
    expect(node?.externalId).toBeNull();

    if (node) {
      node.externalId = 'modified';
    }
    const originalNode = tree.getTagAsDeepCopy('ab');
    expect(originalNode?.externalId).toBeNull();
  });

  it('returns null for non-existent node', () => {
    const tree = new TagTree(rawData);
    const node = tree.getTagAsDeepCopy('nonExistent');
    expect(node).toBeNull();
  });

  it('creates a new top-level row', () => {
    const tree = new TagTree(rawData);
    const newRow = {
      value: 'newTopLevel',
      externalId: null,
      canChangeTag: true,
      canDeleteTag: true,
      id: 7,
      parentValue: null,
      subTagsUrl: null,
      childCount: 0,
      descendantCount: 0,
      depth: 0,
    };
    tree.addNode(newRow, null);
    expect(tree.getAllAsDeepCopy()).toContainEqual(newRow);
  });

  it('creates a new child row', () => {
    const tree = new TagTree(rawData);
    tree.addNode(newSubtagChildRow, 'ab');
    const parentNode = tree.getTagAsDeepCopy('ab');
    expect(parentNode?.subRows).toContainEqual(newSubtagChildRow);
  });

  it('edits a node value', () => {
    const tree = new TagTree(rawData);
    tree.addNode(newSubtagChildRow, 'ab');
    tree.editTagValue('ab', 'editedAb');
    expect(tree.getTagAsDeepCopy('editedAb')).not.toBeNull();
    expect(tree.getTagAsDeepCopy('ab')).toBeNull();
    expect(tree.getTagAsDeepCopy('editedAb')?.value).toBe('editedAb');
    expect(tree.getTagAsDeepCopy('editedAb')?.subRows).toContainEqual(newSubtagChildRow);
  });

  it('deletes a top-level node and its children', () => {
    const tree = new TagTree(rawData);
    tree.addNode(newSubtagChildRow, 'ab');
    tree.removeNode('ab');
    expect(tree.getTagAsDeepCopy('ab')).toBeNull();
    expect(tree.getTagAsDeepCopy('newChild')).toBeNull();
  });

  it('deletes a child node', () => {
    const tree = new TagTree(rawData);
    tree.addNode(newSubtagChildRow, 'ab');
    tree.removeNode('newChild', 'ab');
    const parentNode = tree.getTagAsDeepCopy('ab');
    expect(parentNode?.subRows).not.toContainEqual(newSubtagChildRow);
  });

  it('returns null and leaves tree unchanged when removing a non-existent node', () => {
    const tree = new TagTree(rawData);
    const before = tree.getTagAsDeepCopy('ab');

    const removed = tree.removeNode('does-not-exist');

    expect(removed).toBeNull();
    expect(tree.getTagAsDeepCopy('ab')).toEqual(before);
  });

  it('returns null and leaves tree unchanged when editing a non-existent node', () => {
    const tree = new TagTree(rawData);
    const before = tree.getTagAsDeepCopy('ab');

    const edited = tree.editTagValue('does-not-exist', 'new-value');

    expect(edited).toBeNull();
    expect(tree.getTagAsDeepCopy('ab')).toEqual(before);
  });

  it('does not add a node when parentValue is provided but parent does not exist', () => {
    const tree = new TagTree(rawData);
    const rowCountBefore = tree.getAllAsDeepCopy().length;

    tree.addNode(newSubtagChildRow, 'missing-parent');

    expect(tree.getAllAsDeepCopy()).toHaveLength(rowCountBefore);
    expect(tree.getTagAsDeepCopy('newChild')).toBeNull();
  });

  it('treats orphaned nodes as roots during tree construction', () => {
    const orphanData = [
      {
        value: 'orphan',
        externalId: null,
        canChangeTag: true,
        canDeleteTag: true,
        id: 900,
        parentValue: 'missing-parent',
        subTagsUrl: null,
        childCount: 0,
        descendantCount: 0,
        depth: 1,
      },
    ];

    const tree = new TagTree(orphanData);

    expect(tree.getAllAsDeepCopy()).toHaveLength(1);
    expect(tree.getAllAsDeepCopy()[0].value).toBe('orphan');
  });

  it('rejects duplicate tag values during tree construction', () => {
    const duplicateValueData = [
      {
        value: 'dup',
        externalId: null,
        canChangeTag: true,
        canDeleteTag: true,
        id: 1001,
        parentValue: null,
        subTagsUrl: null,
        childCount: 0,
        descendantCount: 0,
        depth: 0,
      },
      {
        value: 'dup',
        externalId: null,
        canChangeTag: true,
        canDeleteTag: true,
        id: 1002,
        parentValue: null,
        subTagsUrl: null,
        childCount: 0,
        descendantCount: 0,
        depth: 0,
      },
    ];

    expect(() => new TagTree(duplicateValueData)).toThrow(TagTreeError);
  });

  it('rejects cycles in parent/child relationships during tree construction', () => {
    const cyclicData = [
      {
        value: 'a',
        externalId: null,
        canChangeTag: true,
        canDeleteTag: true,
        id: 1101,
        parentValue: 'b',
        subTagsUrl: null,
        childCount: 1,
        descendantCount: 1,
        depth: 0,
      },
      {
        value: 'b',
        externalId: null,
        canChangeTag: true,
        canDeleteTag: true,
        id: 1102,
        parentValue: 'a',
        subTagsUrl: null,
        childCount: 1,
        descendantCount: 1,
        depth: 1,
      },
    ];

    expect(() => new TagTree(cyclicData)).toThrow(TagTreeError);
  });

  it('throws TagTreeError when editing a tag value to one that already exists', () => {
    const tree = new TagTree(rawData);

    expect(() => tree.editTagValue('ab', 'Brass2')).toThrow(TagTreeError);
  });

  it('throws TagTreeError when adding a node with a value that already exists', () => {
    const tree = new TagTree(rawData);
    const newNode = {
      value: 'ab',
      externalId: null,
      canChangeTag: true,
      canDeleteTag: true,
      id: 999,
      parentValue: null,
      subTagsUrl: null,
      childCount: 0,
      descendantCount: 0,
      depth: 0,
    };

    expect(() => tree.addNode(newNode)).toThrow(TagTreeError);
  });

  it('adds new top-level rows to the beginning of the tree', () => {
    const tree = new TagTree(rawData);
    const newNode = {
      value: 'new row',
      externalId: null,
      canChangeTag: true,
      canDeleteTag: true,
      id: 1000,
      parentValue: null,
      subTagsUrl: null,
      childCount: 0,
      descendantCount: 0,
      depth: 0,
    };

    tree.addNode(newNode, null); // Add as the first child of the root

    expect(tree.getAllAsDeepCopy()[0]).toEqual(newNode);
    const nextNewNode = {
      value: 'another new row',
      externalId: null,
      canChangeTag: true,
      canDeleteTag: true,
      id: 1001,
      parentValue: null,
      subTagsUrl: null,
      childCount: 0,
      descendantCount: 0,
      depth: 0,
    };
    tree.addNode(nextNewNode, null); // Add another top-level node
    expect(tree.getAllAsDeepCopy()[0]).toEqual(nextNewNode);
    expect(tree.getAllAsDeepCopy()[1]).toEqual(newNode);
  });

  it('adds new child rows to the beginning of the parent node children', () => {
    const tree = new TagTree(rawData);
    const newChild = {
      value: 'new child',
      externalId: null,
      canChangeTag: true,
      canDeleteTag: true,
      id: 1002,
      parentValue: 'ab',
      subTagsUrl: null,
      childCount: 0,
      descendantCount: 0,
      depth: 1,
    };

    tree.addNode(newChild, 'ab'); // Add as the first child of 'ab'

    let parentNode = tree.getTagAsDeepCopy('ab');
    expect(parentNode?.subRows?.[0]).toEqual(newChild);

    const nextNewChild = {
      value: 'another new child',
      externalId: null,
      canChangeTag: true,
      canDeleteTag: true,
      id: 1003,
      parentValue: 'ab',
      subTagsUrl: null,
      childCount: 0,
      descendantCount: 0,
      depth: 1,
    };
    tree.addNode(nextNewChild, 'ab'); // Add another child to 'ab'
    parentNode = tree.getTagAsDeepCopy('ab');
    expect(parentNode?.subRows?.[0]).toEqual(nextNewChild);
    expect(parentNode?.subRows?.[1]).toEqual(newChild);
  });

  it('returns a flattened list of all nodes including subRows', () => {
    const tree = new TagTree(rawData);
    const flattened = tree.getAllFlattenedAsCopy();
    const expectedValues = rawData.map(item => item.value);
    expect(flattened.map(node => node.value)).toEqual(expectedValues);
  });
});
