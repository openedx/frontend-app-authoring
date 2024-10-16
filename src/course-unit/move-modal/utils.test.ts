import { CATEGORIES } from './constants';
import { ITreeNode, IXBlockInfo, IAncestor } from './interfaces';
import {
  getXBlockType, findParentIds, isValidCategory, getBreadcrumbs,
} from './utils';
import messages from './messages';

const mockFormatMessage = jest.fn((message) => message.defaultMessage);

const tree: ITreeNode = {
  id: 'root',
  childInfo: {
    children: [
      {
        id: 'child-1',
        childInfo: {
          children: [
            {
              id: 'grandchild-1',
              childInfo: {
                children: [],
              },
            },
            {
              id: 'grandchild-2',
              childInfo: {
                children: [],
              },
            },
          ],
        },
      },
      {
        id: 'child-2',
        childInfo: {
          children: [],
        },
      },
    ],
  },
};

describe('getXBlockType utility', () => {
  it('returns section for chapter category', () => {
    const result = getXBlockType(CATEGORIES.KEYS.chapter);
    expect(result).toBe(CATEGORIES.KEYS.section);
  });

  it('returns subsection for sequential category', () => {
    const result = getXBlockType(CATEGORIES.KEYS.sequential);
    expect(result).toBe(CATEGORIES.KEYS.subsection);
  });

  it('returns unit for vertical category', () => {
    const result = getXBlockType(CATEGORIES.KEYS.vertical);
    expect(result).toBe(CATEGORIES.KEYS.unit);
  });

  it('returns the same category if no match is found', () => {
    const customCategory = 'custom-category';
    const result = getXBlockType(customCategory);
    expect(result).toBe(customCategory);
  });
});

describe('findParentIds utility', () => {
  it('returns path to target ID in the tree', () => {
    const result = findParentIds(tree, 'grandchild-2');
    expect(result).toEqual(['root', 'child-1', 'grandchild-2']);
  });

  it('returns empty array if target ID is not found', () => {
    const result = findParentIds(tree, 'non-existent-id');
    expect(result).toEqual([]);
  });

  it('returns path with only root when target ID is the root', () => {
    const result = findParentIds(tree, 'root');
    expect(result).toEqual(['root']);
  });

  it('returns empty array if tree is undefined', () => {
    const result = findParentIds(undefined, 'some-id');
    expect(result).toEqual([]);
  });
});

describe('isValidCategory utility', () => {
  const sourceParentInfo: IXBlockInfo = {
    displayName: 'test-source-parent-name',
    id: '12345',
    category: 'chapter',
    hasChildren: true,
  };
  const targetParentInfo: IXBlockInfo = {
    displayName: 'test-target-parent-name',
    id: '67890',
    category: 'chapter',
    hasChildren: true,
  };

  it('returns true when target and source categories are the same', () => {
    const result = isValidCategory(sourceParentInfo, targetParentInfo);
    expect(result).toBe(true);
  });

  it('returns false when categories are different', () => {
    const result = isValidCategory(sourceParentInfo, { ...targetParentInfo, category: 'unit' });
    expect(result).toBe(false);
  });

  it('converts source category to vertical if it has children and is not basic block type', () => {
    const result = isValidCategory(
      { ...sourceParentInfo, category: 'section' },
      { ...targetParentInfo, category: 'vertical' },
    );
    expect(result).toBe(true);
  });

  it('converts target category to vertical if it has children and is not basic block type or split_test', () => {
    const result = isValidCategory(
      { ...sourceParentInfo, category: 'vertical' },
      { ...targetParentInfo, category: 'section' },
    );
    expect(result).toBe(true);
  });

  it('returns false when categories are different after conversion', () => {
    const result = isValidCategory(
      { ...sourceParentInfo, category: 'chapter' },
      { ...targetParentInfo, category: 'section' },
    );
    expect(result).toBe(false);
  });
});

describe('getBreadcrumbs utility', () => {
  it('returns correct breadcrumb labels for visited ancestors', () => {
    const visitedAncestors: IAncestor[] = [
      { category: 'chapter', displayName: 'Chapter 1' },
      { category: 'section', displayName: 'Section 1' },
    ];

    const result = getBreadcrumbs(visitedAncestors, mockFormatMessage);

    expect(result).toEqual(['Chapter 1', 'Section 1']);
  });

  it('returns base category label when category is course', () => {
    const visitedAncestors: IAncestor[] = [
      { category: CATEGORIES.KEYS.course, displayName: 'Course Name' },
    ];

    const result = getBreadcrumbs(visitedAncestors, mockFormatMessage);

    expect(result).toEqual(['Course Outline']);
    expect(mockFormatMessage).toHaveBeenCalledWith(messages.moveModalBreadcrumbsBaseCategory);
  });

  it('returns empty string if displayName is missing', () => {
    const visitedAncestors: IAncestor[] = [
      { category: 'chapter', displayName: '' },
    ];

    const result = getBreadcrumbs(visitedAncestors, mockFormatMessage);

    expect(result).toEqual(['']);
  });

  it('returns empty array if visitedAncestors is not an array', () => {
    const result = getBreadcrumbs(undefined as any, mockFormatMessage);

    expect(result).toEqual([]);
  });
});
