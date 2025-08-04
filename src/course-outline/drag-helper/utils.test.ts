import { XBlock } from '@src/data/types';
import {
  possibleSubsectionMoves, moveSubsection, moveSubsectionOver, possibleUnitMoves, moveUnit, moveUnitOver,
} from './utils';

describe('possibleSubsectionMoves', () => {
  const mockSections = [
    {
      id: 'section1',
      actions: { childAddable: true },
      childInfo: { children: [] },
    },
    {
      id: 'section2',
      actions: { childAddable: true },
      childInfo: { children: [] },
    },
    {
      id: 'section3',
      actions: { childAddable: false },
      childInfo: { children: [] },
    },
  ] as unknown as XBlock[];

  const mockSubsections = [
    { actions: { draggable: true } },
    { actions: { draggable: true } },
    { actions: { draggable: true } },
  ];

  const createMoveFunction = possibleSubsectionMoves(
    mockSections,
    1,
    mockSections[1],
    mockSubsections,
  );

  test('should return empty object if subsection is not draggable', () => {
    const mockNonDraggableSubsections = [
      { actions: { draggable: false } },
      { actions: { draggable: true } },
    ];

    const createMove = possibleSubsectionMoves(
      mockSections,
      1,
      mockSections[1],
      mockNonDraggableSubsections,
    );

    const result = createMove(0, 1);
    expect(result).toEqual({});
  });

  test('should allow moving subsection down within same section', () => {
    const result = createMoveFunction(0, 1);
    expect(result).toEqual({
      fn: moveSubsection,
      args: [mockSections, 1, 0, 1],
      sectionId: 'section2',
    });
  });

  test('should allow moving subsection up within same section', () => {
    const result = createMoveFunction(1, -1);
    expect(result).toEqual({
      fn: moveSubsection,
      args: [mockSections, 1, 1, 0],
      sectionId: 'section2',
    });
  });

  test('should move subsection to previous section when at first position', () => {
    const result = createMoveFunction(0, -1);
    expect(result).toEqual({
      fn: moveSubsectionOver,
      args: [mockSections, 1, 0, 0, mockSections[0].childInfo.children.length + 1],
      sectionId: 'section1',
    });
  });

  test('should return empty object when moving to previous section not allowed', () => {
    const mockRestrictedSections = [
      { id: 'section1', actions: { childAddable: false } },
      { id: 'section2', actions: { childAddable: true } },
    ] as unknown as XBlock[];

    const createMove = possibleSubsectionMoves(
      mockRestrictedSections,
      1,
      mockRestrictedSections[1],
      mockSubsections,
    );

    const result = createMove(0, -1);
    expect(result).toEqual({});
  });

  test('should move subsection to next section when at last position', () => {
    const createMove = possibleSubsectionMoves(
      mockSections,
      0,
      mockSections[0],
      mockSubsections,
    );

    const result = createMove(2, 1);
    expect(result).toEqual({
      fn: moveSubsectionOver,
      args: [mockSections, 0, 2, 1, 0],
      sectionId: 'section2',
    });
  });

  test('should return empty object when moving subsection to next section that does not accept children', () => {
    const result = createMoveFunction(2, 1);
    expect(result).toEqual({});
  });

  test('should return empty object when moving to next section not allowed', () => {
    const mockRestrictedSections = [
      { id: 'section1', actions: { childAddable: true } },
      { id: 'section2', actions: { childAddable: false } },
    ] as unknown as XBlock[];

    const createMove = possibleSubsectionMoves(
      mockRestrictedSections,
      0,
      mockRestrictedSections[0],
      mockSubsections,
    );

    const result = createMove(2, 1);
    expect(result).toEqual({});
  });

  test('should return empty object when attempting to move beyond section boundaries', () => {
    // Test moving up from first subsection of first section
    const firstSectionMove = possibleSubsectionMoves(
      mockSections,
      0,
      mockSections[0],
      mockSubsections,
    );

    const resultUp = firstSectionMove(0, -1);
    expect(resultUp).toEqual({});

    // Test moving down from last subsection of last section
    const lastSectionMove = possibleSubsectionMoves(
      mockSections,
      2,
      mockSections[2],
      mockSubsections,
    );

    const resultDown = lastSectionMove(2, 1);
    expect(resultDown).toEqual({});
  });

  test('should handle edge cases with empty sections or subsections', () => {
    const emptySections = [];
    const emptySubsections = [];

    const createMove = possibleSubsectionMoves(
      emptySections,
      0,
      {} as unknown as XBlock,
      emptySubsections,
    );

    const result = createMove(0, 1);
    expect(result).toEqual({});
  });

  test('should work with different step values', () => {
    // Positive step
    const resultPositive = createMoveFunction(1, 1);
    expect(resultPositive).toEqual({
      fn: moveSubsection,
      args: [mockSections, 1, 1, 2],
      sectionId: 'section2',
    });

    // Negative step
    const resultNegative = createMoveFunction(1, -1);
    expect(resultNegative).toEqual({
      fn: moveSubsection,
      args: [mockSections, 1, 1, 0],
      sectionId: 'section2',
    });
  });
});

describe('possibleSubsectionMoves - skipping non-childAddable sections', () => {
  test('should move subsection to next childAddable section, skipping non-childAddable sections', () => {
    const sectionsWithBlockers = [
      {
        id: 'section1',
        actions: { childAddable: true },
        childInfo: { children: [] },
      },
      {
        id: 'section2',
        actions: { childAddable: false },
        childInfo: { children: [] },
      },
      {
        id: 'section3',
        actions: { childAddable: false },
        childInfo: { children: [] },
      },
      {
        id: 'section4',
        actions: { childAddable: true },
        childInfo: { children: [] },
      },
    ] as unknown as XBlock[];

    const subsections = [
      { actions: { draggable: true } },
    ] as unknown as XBlock[];

    // Moving from first section (index 0) to the next available childAddable section
    const createMove = possibleSubsectionMoves(
      sectionsWithBlockers,
      0,
      sectionsWithBlockers[0],
      subsections,
    );

    const resultMoveDown = createMove(0, 1);
    expect(resultMoveDown).toEqual({
      fn: moveSubsectionOver,
      args: [sectionsWithBlockers, 0, 0, 3, 0],
      sectionId: 'section4',
    });
  });

  test('should move subsection to previous childAddable section, skipping non-childAddable sections', () => {
    const sectionsWithBlockers = [
      {
        id: 'section1',
        actions: { childAddable: true },
        childInfo: { children: [] },
      },
      {
        id: 'section2',
        actions: { childAddable: false },
        childInfo: { children: [] },
      },
      {
        id: 'section3',
        actions: { childAddable: false },
        childInfo: { children: [] },
      },
      {
        id: 'section4',
        actions: { childAddable: true },
        childInfo: { children: ['existing'] },
      },
    ] as unknown as XBlock[];

    const subsections = [
      { actions: { draggable: true } },
    ] as unknown as XBlock[];

    // Moving from last section (index 4) to the previous available childAddable section
    const createMove = possibleSubsectionMoves(
      sectionsWithBlockers,
      3,
      sectionsWithBlockers[3],
      subsections,
    );

    const resultMoveUp = createMove(0, -1);
    expect(resultMoveUp).toEqual({
      fn: moveSubsectionOver,
      args: [sectionsWithBlockers, 3, 0, 0, sectionsWithBlockers[0].childInfo.children.length + 1],
      sectionId: 'section1',
    });
  });
});

describe('possibleUnitMoves', () => {
  const mockSections = [
    {
      id: 'section1',
      actions: { childAddable: true },
      childInfo: {
        children: [
          {
            id: 'subsection1',
            actions: { childAddable: true },
            childInfo: { children: [] },
          },
          {
            id: 'subsection2',
            actions: { childAddable: true },
            childInfo: { children: [] },
          },
        ],
      },
    },
    {
      id: 'section2',
      actions: { childAddable: true },
      childInfo: {
        children: [
          {
            id: 'subsection3',
            actions: { childAddable: true },
            childInfo: { children: [] },
          },
        ],
      },
    },
  ] as unknown as XBlock[];

  const mockUnits = [
    { actions: { draggable: true } },
    { actions: { draggable: true } },
    { actions: { draggable: true } },
  ] as unknown as XBlock[];

  test('should move unit within same units array', () => {
    const createMove = possibleUnitMoves(
      mockSections,
      0,
      0,
      mockSections[0],
      mockSections[0].childInfo.children[0],
      mockUnits,
    );

    const resultMoveDown = createMove(0, 1);
    expect(resultMoveDown).toEqual({
      fn: moveUnit,
      args: [mockSections, 0, 0, 0, 1],
      sectionId: 'section1',
      subsectionId: 'subsection1',
    });

    const resultMoveUp = createMove(1, -1);
    expect(resultMoveUp).toEqual({
      fn: moveUnit,
      args: [mockSections, 0, 0, 1, 0],
      sectionId: 'section1',
      subsectionId: 'subsection1',
    });
  });

  test('should return empty object for non-draggable units', () => {
    const nonDraggableUnits = [
      { actions: { draggable: false } },
      { actions: { draggable: true } },
    ] as unknown as XBlock[];

    const createMove = possibleUnitMoves(
      mockSections,
      0,
      0,
      mockSections[0],
      mockSections[0].childInfo.children[0],
      nonDraggableUnits,
    );

    const result = createMove(0, 1);
    expect(result).toEqual({});
  });

  test('should move unit to next subsection within same section', () => {
    const createMove = possibleUnitMoves(
      mockSections,
      0,
      0,
      mockSections[0],
      mockSections[0].childInfo.children[0],
      mockUnits,
    );

    const result = createMove(2, 1);
    expect(result).toEqual({
      fn: moveUnitOver,
      args: [mockSections, 0, 0, 2, 0, 1, 0],
      sectionId: 'section1',
      subsectionId: 'subsection2',
    });
  });

  test('should move unit to previous section and subsection', () => {
    const createMove = possibleUnitMoves(
      mockSections,
      1,
      0,
      mockSections[1],
      mockSections[1].childInfo.children[0],
      mockUnits,
    );

    const result = createMove(0, -1);
    expect(result).toEqual({
      fn: moveUnitOver,
      args: [mockSections, 1, 0, 0, 0, 1, 0],
      sectionId: 'section1',
      subsectionId: 'subsection2',
    });
  });

  test('should move unit to next section and first subsection', () => {
    const sectionsWithMultipleSubsections = [
      {
        id: 'section1',
        actions: { childAddable: true },
        childInfo: {
          children: [
            {
              id: 'subsection1',
              actions: { childAddable: true },
              childInfo: { children: [] },
            },
          ],
        },
      },
      {
        id: 'section2',
        actions: { childAddable: true },
        childInfo: {
          children: [
            {
              id: 'subsection2',
              actions: { childAddable: true },
              childInfo: { children: [] },
            },
            {
              id: 'subsection3',
              actions: { childAddable: true },
              childInfo: { children: [] },
            },
          ],
        },
      },
    ] as unknown as XBlock[];

    const createMove = possibleUnitMoves(
      sectionsWithMultipleSubsections,
      0,
      0,
      sectionsWithMultipleSubsections[0],
      sectionsWithMultipleSubsections[0].childInfo.children[0],
      mockUnits,
    );

    const result = createMove(2, 1);
    expect(result).toEqual({
      fn: moveUnitOver,
      args: [sectionsWithMultipleSubsections, 0, 0, 2, 1, 0, 0],
      sectionId: 'section2',
      subsectionId: 'subsection2',
    });
  });

  test('should return empty object when no valid move locations exist', () => {
    const restrictedSections = [
      {
        id: 'section1',
        actions: { childAddable: false },
        childInfo: { children: [] },
      },
      {
        id: 'section2',
        actions: { childAddable: false },
        childInfo: { children: [] },
      },
    ] as unknown as XBlock[];

    const createMove = possibleUnitMoves(
      restrictedSections,
      0,
      0,
      restrictedSections[0],
      { id: 'subsection1', actions: { childAddable: true }, childInfo: { children: [] } } as unknown as XBlock,
      mockUnits,
    );

    const resultMoveDown = createMove(2, 1);
    expect(resultMoveDown).toEqual({});

    const resultMoveUp = createMove(0, -1);
    expect(resultMoveUp).toEqual({});
  });

  test('should handle edge cases with single section and subsection', () => {
    const emptySections = [
      {
        id: 'section1',
        actions: { childAddable: true },
        childInfo: { children: [] },
      },
    ] as unknown as XBlock[];

    const createMove = possibleUnitMoves(
      emptySections,
      0,
      0,
      emptySections[0],
      { id: 'subsection1', actions: { childAddable: true }, childInfo: { children: [] } } as unknown as XBlock,
      mockUnits,
    );

    const result = createMove(0, -1);
    expect(result).toEqual({});
  });

  test('should skip non-childAddable subsections when moving', () => {
    const sectionsWithMixedSubsections = [
      {
        id: 'section1',
        actions: { childAddable: true },
        childInfo: {
          children: [
            {
              id: 'subsection1',
              actions: { childAddable: false },
              childInfo: { children: [] },
            },
            {
              id: 'subsection2',
              actions: { childAddable: true },
              childInfo: { children: [] },
            },
          ],
        },
      },
      {
        id: 'section2',
        actions: { childAddable: true },
        childInfo: {
          children: [
            {
              id: 'subsection3',
              actions: { childAddable: true },
              childInfo: { children: [] },
            },
          ],
        },
      },
    ] as unknown as XBlock[];

    const createMove = possibleUnitMoves(
      sectionsWithMixedSubsections,
      0,
      0,
      sectionsWithMixedSubsections[0],
      sectionsWithMixedSubsections[0].childInfo.children[0],
      mockUnits,
    );

    const result = createMove(2, 1);
    expect(result).toEqual({
      fn: moveUnitOver,
      args: [sectionsWithMixedSubsections, 0, 0, 2, 0, 1, 0],
      sectionId: 'section1',
      subsectionId: 'subsection2',
    });
  });

  test('should move unit to previous section, skipping non-childAddable subsections', () => {
    const sectionsWithMixedSubsections = [
      {
        id: 'section1',
        actions: { childAddable: true },
        childInfo: {
          children: [
            {
              id: 'subsection1',
              actions: { childAddable: true },
              childInfo: { children: [] },
            },
          ],
        },
      },
      {
        id: 'section2',
        actions: { childAddable: true },
        childInfo: {
          children: [
            {
              id: 'subsection2',
              actions: { childAddable: false },
              childInfo: { children: [] },
            },
            {
              id: 'subsection3',
              actions: { childAddable: true },
              childInfo: { children: [] },
            },
          ],
        },
      },
    ] as unknown as XBlock[];

    const createMove = possibleUnitMoves(
      sectionsWithMixedSubsections,
      1,
      1,
      sectionsWithMixedSubsections[1],
      sectionsWithMixedSubsections[1].childInfo.children[1],
      mockUnits,
    );

    const result = createMove(0, -1);
    expect(result).toEqual({
      fn: moveUnitOver,
      args: [sectionsWithMixedSubsections, 1, 1, 0, 0, 0, 0],
      sectionId: 'section1',
      subsectionId: 'subsection1',
    });
  });

  test('should handle scenarios with multiple non-childAddable sections', () => {
    const complexSections = [
      {
        id: 'section1',
        actions: { childAddable: false },
        childInfo: { children: [] },
      },
      {
        id: 'section2',
        actions: { childAddable: true },
        childInfo: {
          children: [
            {
              id: 'subsection1',
              actions: { childAddable: true },
              childInfo: { children: [] },
            },
          ],
        },
      },
      {
        id: 'section3',
        actions: { childAddable: false },
        childInfo: { children: [] },
      },
      {
        id: 'section4',
        actions: { childAddable: true },
        childInfo: {
          children: [
            {
              id: 'subsection2',
              actions: { childAddable: true },
              childInfo: { children: [] },
            },
          ],
        },
      },
    ] as unknown as XBlock[];

    const createMove = possibleUnitMoves(
      complexSections,
      1,
      0,
      complexSections[1],
      complexSections[1].childInfo.children[0],
      mockUnits,
    );

    const resultMoveDown = createMove(2, 1);
    expect(resultMoveDown).toEqual({
      fn: moveUnitOver,
      args: [complexSections, 1, 0, 2, 3, 0, 0],
      sectionId: 'section4',
      subsectionId: 'subsection2',
    });

    const createMoveUp = possibleUnitMoves(
      complexSections,
      3,
      0,
      complexSections[3],
      complexSections[3].childInfo.children[0],
      mockUnits,
    );

    const resultMoveUp = createMoveUp(0, -1);
    expect(resultMoveUp).toEqual({
      fn: moveUnitOver,
      args: [complexSections, 3, 0, 0, 1, 0, 0],
      sectionId: 'section2',
      subsectionId: 'subsection1',
    });
  });

  test('should return empty object when no valid move locations exist in any direction', () => {
    const restrictedSections = [
      {
        id: 'section1',
        actions: { childAddable: false },
        childInfo: { children: [] },
      },
      {
        id: 'section2',
        actions: { childAddable: false },
        childInfo: { children: [] },
      },
    ] as unknown as XBlock[];

    const createMove = possibleUnitMoves(
      restrictedSections,
      0,
      0,
      restrictedSections[0],
      { id: 'subsection1', actions: { childAddable: true }, childInfo: { children: [] } } as unknown as XBlock,
      mockUnits,
    );

    const resultMoveDown = createMove(2, 1);
    expect(resultMoveDown).toEqual({});

    const resultMoveUp = createMove(0, -1);
    expect(resultMoveUp).toEqual({});
  });

  test('should handle scenarios with single unit', () => {
    const singleUnitSections = [
      {
        id: 'section1',
        actions: { childAddable: true },
        childInfo: {
          children: [
            {
              id: 'subsection1',
              actions: { childAddable: true },
              childInfo: { children: [] },
            },
          ],
        },
      },
      {
        id: 'section2',
        actions: { childAddable: true },
        childInfo: {
          children: [
            {
              id: 'subsection2',
              actions: { childAddable: true },
              childInfo: { children: [] },
            },
          ],
        },
      },
    ] as unknown as XBlock[];

    const singleUnit = [{ actions: { draggable: true } }] as unknown as XBlock[];

    const createMove = possibleUnitMoves(
      singleUnitSections,
      0,
      0,
      singleUnitSections[0],
      singleUnitSections[0].childInfo.children[0],
      singleUnit,
    );

    const resultMoveDown = createMove(0, 1);
    expect(resultMoveDown).toEqual({
      fn: moveUnitOver,
      args: [singleUnitSections, 0, 0, 0, 1, 0, 0],
      sectionId: 'section2',
      subsectionId: 'subsection2',
    });
  });
});

describe('possibleUnitMoves - skipping non-childAddable subsections', () => {
  test('should skip non-childAddable subsection when moving within the same section', () => {
    const sectionsWithMixedSubsections = [
      {
        id: 'section1',
        actions: { childAddable: true },
        childInfo: {
          children: [
            {
              id: 'subsection1',
              actions: { childAddable: true },
              childInfo: { children: [] },
            },
            {
              id: 'subsection2',
              actions: { childAddable: false },
              childInfo: { children: [] },
            },
            {
              id: 'subsection3',
              actions: { childAddable: true },
              childInfo: { children: [] },
            },
          ],
        },
      },
    ] as unknown as XBlock[];

    const units = [
      { actions: { draggable: true } },
      { actions: { draggable: true } },
    ] as unknown as XBlock[];

    const createMove = possibleUnitMoves(
      sectionsWithMixedSubsections,
      0,
      0,
      sectionsWithMixedSubsections[0],
      sectionsWithMixedSubsections[0].childInfo.children[0],
      units,
    );

    const resultMoveDown = createMove(1, 1);
    expect(resultMoveDown).toEqual({
      fn: moveUnitOver,
      args: [sectionsWithMixedSubsections, 0, 0, 1, 0, 2, 0],
      sectionId: 'section1',
      subsectionId: 'subsection3',
    });
  });

  test('should skip non-childAddable subsections when moving to next section', () => {
    const sectionsWithMixedSubsections = [
      {
        id: 'section1',
        actions: { childAddable: true },
        childInfo: {
          children: [
            {
              id: 'subsection1',
              actions: { childAddable: true },
              childInfo: { children: [] },
            },
          ],
        },
      },
      {
        id: 'section2',
        actions: { childAddable: true },
        childInfo: {
          children: [
            {
              id: 'subsection2',
              actions: { childAddable: false },
              childInfo: { children: [] },
            },
            {
              id: 'subsection3',
              actions: { childAddable: false },
              childInfo: { children: [] },
            },
            {
              id: 'subsection4',
              actions: { childAddable: true },
              childInfo: { children: [] },
            },
          ],
        },
      },
    ] as unknown as XBlock[];

    const units = [
      { actions: { draggable: true } },
      { actions: { draggable: true } },
    ] as unknown as XBlock[];

    const createMove = possibleUnitMoves(
      sectionsWithMixedSubsections,
      0,
      0,
      sectionsWithMixedSubsections[0],
      sectionsWithMixedSubsections[0].childInfo.children[0],
      units,
    );

    const resultMoveDown = createMove(1, 1);
    expect(resultMoveDown).toEqual({
      fn: moveUnitOver,
      args: [sectionsWithMixedSubsections, 0, 0, 1, 1, 2, 0],
      sectionId: 'section2',
      subsectionId: 'subsection4',
    });
  });

  test('should skip non-childAddable subsections when moving to previous section', () => {
    const sectionsWithMixedSubsections = [
      {
        id: 'section1',
        actions: { childAddable: true },
        childInfo: {
          children: [
            {
              id: 'subsection1',
              actions: { childAddable: false },
              childInfo: { children: [] },
            },
            {
              id: 'subsection2',
              actions: { childAddable: false },
              childInfo: { children: [] },
            },
            {
              id: 'subsection3',
              actions: { childAddable: true },
              childInfo: { children: [] },
            },
          ],
        },
      },
      {
        id: 'section2',
        actions: { childAddable: true },
        childInfo: {
          children: [
            {
              id: 'subsection4',
              actions: { childAddable: true },
              childInfo: { children: [] },
            },
          ],
        },
      },
    ] as unknown as XBlock[];

    const units = [
      { actions: { draggable: true } },
      { actions: { draggable: true } },
    ] as unknown as XBlock[];

    const createMove = possibleUnitMoves(
      sectionsWithMixedSubsections,
      1,
      0,
      sectionsWithMixedSubsections[1],
      sectionsWithMixedSubsections[1].childInfo.children[0],
      units,
    );

    const resultMoveUp = createMove(0, -1);
    expect(resultMoveUp).toEqual({
      fn: moveUnitOver,
      args: [sectionsWithMixedSubsections, 1, 0, 0, 0, 2, 0],
      sectionId: 'section1',
      subsectionId: 'subsection3',
    });
  });

  test('should handle complex scenario with multiple non-childAddable subsections', () => {
    const complexSections = [
      {
        id: 'section1',
        actions: { childAddable: true },
        childInfo: {
          children: [
            {
              id: 'subsection1',
              actions: { childAddable: false },
              childInfo: { children: [] },
            },
            {
              id: 'subsection2',
              actions: { childAddable: false },
              childInfo: { children: [] },
            },
            {
              id: 'subsection3',
              actions: { childAddable: true },
              childInfo: { children: [] },
            },
          ],
        },
      },
      {
        id: 'section2',
        actions: { childAddable: true },
        childInfo: {
          children: [
            {
              id: 'subsection4',
              actions: { childAddable: false },
              childInfo: { children: [] },
            },
            {
              id: 'subsection5',
              actions: { childAddable: true },
              childInfo: { children: [] },
            },
          ],
        },
      },
    ] as unknown as XBlock[];

    const units = [
      { actions: { draggable: true } },
      { actions: { draggable: true } },
    ] as unknown as XBlock[];

    // Moving from first section to second section, skipping non-childAddable subsections
    const createMoveDown = possibleUnitMoves(
      complexSections,
      0,
      2,
      complexSections[0],
      complexSections[0].childInfo.children[2],
      units,
    );

    const resultMoveDown = createMoveDown(1, 1);
    expect(resultMoveDown).toEqual({
      fn: moveUnitOver,
      args: [complexSections, 0, 2, 1, 1, 1, 0],
      sectionId: 'section2',
      subsectionId: 'subsection5',
    });

    // Moving from second section to first section, skipping non-childAddable subsections
    const createMoveUp = possibleUnitMoves(
      complexSections,
      1,
      1,
      complexSections[1],
      complexSections[1].childInfo.children[1],
      units,
    );

    const resultMoveUp = createMoveUp(0, -1);
    expect(resultMoveUp).toEqual({
      fn: moveUnitOver,
      args: [complexSections, 1, 1, 0, 0, 2, 0],
      sectionId: 'section1',
      subsectionId: 'subsection3',
    });
  });

  test('should return empty object when no childAddable subsections exist', () => {
    const sectionsWithNoChildAddable = [
      {
        id: 'section1',
        actions: { childAddable: true },
        childInfo: {
          children: [
            {
              id: 'subsection1',
              actions: { childAddable: false },
              childInfo: { children: [] },
            },
            {
              id: 'subsection2',
              actions: { childAddable: false },
              childInfo: { children: [] },
            },
          ],
        },
      },
      {
        id: 'section2',
        actions: { childAddable: true },
        childInfo: {
          children: [
            {
              id: 'subsection3',
              actions: { childAddable: false },
              childInfo: { children: [] },
            },
            {
              id: 'subsection4',
              actions: { childAddable: false },
              childInfo: { children: [] },
            },
          ],
        },
      },
    ] as unknown as XBlock[];

    const units = [
      { actions: { draggable: true } },
    ] as unknown as XBlock[];

    const createMoveDown = possibleUnitMoves(
      sectionsWithNoChildAddable,
      0,
      0,
      sectionsWithNoChildAddable[0],
      sectionsWithNoChildAddable[0].childInfo.children[0],
      units,
    );

    const resultMoveDown = createMoveDown(0, 1);
    expect(resultMoveDown).toEqual({});

    const createMoveUp = possibleUnitMoves(
      sectionsWithNoChildAddable,
      1,
      0,
      sectionsWithNoChildAddable[1],
      sectionsWithNoChildAddable[1].childInfo.children[0],
      units,
    );

    const resultMoveUp = createMoveUp(0, -1);
    expect(resultMoveUp).toEqual({});
  });

  test('should handle scenarios with multiple sections and mixed childAddable states', () => {
    const multipleSections = [
      {
        id: 'section1',
        actions: { childAddable: true },
        childInfo: {
          children: [
            {
              id: 'subsection1',
              actions: { childAddable: false },
              childInfo: { children: [] },
            },
          ],
        },
      },
      {
        id: 'section2',
        actions: { childAddable: false },
        childInfo: { children: [] },
      },
      {
        id: 'section3',
        actions: { childAddable: true },
        childInfo: {
          children: [
            {
              id: 'subsection2',
              actions: { childAddable: true },
              childInfo: { children: [] },
            },
          ],
        },
      },
    ] as unknown as XBlock[];

    const units = [
      { actions: { draggable: true } },
    ] as unknown as XBlock[];

    const createMoveDown = possibleUnitMoves(
      multipleSections,
      0,
      0,
      multipleSections[0],
      multipleSections[0].childInfo.children[0],
      units,
    );

    const resultMoveDown = createMoveDown(0, 1);
    expect(resultMoveDown).toEqual({
      fn: moveUnitOver,
      args: [multipleSections, 0, 0, 0, 2, 0, 0],
      sectionId: 'section3',
      subsectionId: 'subsection2',
    });
  });
});
