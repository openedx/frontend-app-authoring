import { getTagWithDescendantsCount } from './utils';

describe('getTagsWithDescendantCount', () => {
  it('returns 1 for a leaf tag', () => {
    expect(getTagWithDescendantsCount({ value: 'leaf', subRows: [] } as any)).toBe(1);
  });

  it('counts all descendants across multiple nested levels', () => {
    const rowData = {
      value: 'root',
      subRows: [
        {
          value: 'child 1',
          subRows: [
            { value: 'grandchild 1', subRows: [] },
            { value: 'grandchild 2', subRows: [] },
          ],
        },
        {
          value: 'child 2',
          subRows: [
            {
              value: 'grandchild 3',
              subRows: [{ value: 'great grandchild 1', subRows: [] }],
            },
          ],
        },
      ],
    } as any;

    // The total includes the root tag itself:
    // root + child 1 + 2 grandchildren + child 2 + grandchild 3 + great grandchild 1 = 7.
    expect(getTagWithDescendantsCount(rowData)).toBe(7);
  });
});
