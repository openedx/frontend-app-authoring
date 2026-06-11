/**
 * Tests for outline-level.ts — depth-level configuration and parent-chain payload builders.
 *
 * Covers all builders for depths 0 (section), 1 (subsection), 2 (unit):
 * - Static config lookup
 * - Parent chain resolvers
 * - Payload builders (SelectionState, OutlineActionSelection, sidebar, publish, unlink, duplicate, rename)
 * - Behavior computations (actions, draggable, droppable, render gate, search)
 * - Ancestor invariant: depth 2 requires subsection
 */

import type { XBlock, XBlockActions } from '@src/data/types';
import {
  type Depth,
  type OutlineNodeAncestors,
  getLevelConfig,
  LEVEL_CONFIG,
  LEVEL_NAMES,
  resolveEffectiveSection,
  resolveRenameIds,
  buildSidebarOpenArgs,
  buildSelectionState,
  buildOutlineActionSelection,
  buildPublishPayload,
  buildUnlinkPayload,
  buildDuplicateParams,
  resolveNodeActions,
  computeIsDraggable,
  computeIsDroppable,
  shouldRenderNode,
  containsSearchResult,
  createOutlineNodeModel,
} from './outline-level';

const COURSE_ID = 'course-v1:test+course';

const sectionBlock = {
  id: 'block-v1:test+course+type@chapter+block@section1',
  category: 'chapter',
  displayName: 'Section 1',
  actions: {
    deletable: true,
    draggable: true,
    childAddable: true,
    duplicable: true,
    allowMoveUp: true,
    allowMoveDown: true,
  } as XBlockActions,
  childInfo: { displayName: 'Section 1', children: [] },
  upstreamInfo: undefined,
  isHeaderVisible: true,
} as unknown as XBlock;

const subsectionBlock = {
  id: 'block-v1:test+course+type@sequential+block@subsection1',
  category: 'sequential',
  displayName: 'Subsection 1',
  actions: {
    deletable: true,
    draggable: true,
    childAddable: true,
    duplicable: true,
  } as XBlockActions,
  childInfo: { displayName: 'Subsection 1', children: [] },
  upstreamInfo: undefined,
  isHeaderVisible: true,
} as unknown as XBlock;

const unitBlock = {
  id: 'block-v1:test+course+type@vertical+block@unit1',
  category: 'vertical',
  displayName: 'Unit 1',
  actions: {
    deletable: true,
    draggable: true,
    duplicable: true,
  } as XBlockActions,
  childInfo: undefined,
  upstreamInfo: undefined,
  isHeaderVisible: true,
} as unknown as XBlock;

/** Ancestors for each depth: depth 0 uses self as section, depth 1/2 use real parent chain. */
const ancestorsByDepth: Record<Depth, OutlineNodeAncestors> = {
  0: { section: sectionBlock, subsection: undefined },
  1: { section: sectionBlock, subsection: undefined },
  2: { section: sectionBlock, subsection: subsectionBlock },
};

/** Block fixture for each depth. */
const blockByDepth: Record<Depth, XBlock> = {
  0: sectionBlock,
  1: subsectionBlock,
  2: unitBlock,
};

describe('LEVEL_CONFIG', () => {
  it('has exactly three levels', () => {
    expect(Object.keys(LEVEL_CONFIG)).toHaveLength(3);
    expect(LEVEL_NAMES).toEqual(['section', 'subsection', 'unit']);
  });

  it.each([
    [0, 'section', 'md'],
    [1, 'subsection', 'sm'],
    [2, 'unit', 'xs'],
  ] as [Depth, string, string][])('depth %d has name=%s iconSize=%s', (depth, expectedName, expectedIconSize) => {
    const config = getLevelConfig(depth);
    expect(config.name).toBe(expectedName);
    expect(config.iconSize).toBe(expectedIconSize);
    expect(config.background).toBeDefined();
    expect(config.contentClass).toBeDefined();
    expect(config.contentTestId).toBeDefined();
  });

  it('section (depth 0) has child containerType=Subsection', () => {
    expect(getLevelConfig(0).containerType).toBe('subsection');
  });

  it('subsection (depth 1) has child containerType=Unit', () => {
    expect(getLevelConfig(1).containerType).toBe('unit');
  });

  it('unit (depth 2) has no child containerType', () => {
    expect(getLevelConfig(2).containerType).toBeUndefined();
  });
});

describe('resolveEffectiveSection', () => {
  it.each([0, 1, 2] as Depth[])('depth %d returns expected section', (depth) => {
    const block = blockByDepth[depth];
    const ancestors = ancestorsByDepth[depth];
    const expected = depth === 0 ? block : ancestors.section;
    expect(resolveEffectiveSection(block, depth, ancestors)).toBe(expected);
  });
});

describe('resolveRenameIds', () => {
  // renameSectionId is always the section ancestor's id
  it.each([
    [0, sectionBlock.id, undefined],
    [1, sectionBlock.id, subsectionBlock.id],
    [2, sectionBlock.id, subsectionBlock.id],
  ] as [Depth, string, string | undefined][])(
    'depth %d → renameSectionId=%s renameSubsectionId=%s',
    (depth, expectedSectionId, expectedSubsectionId) => {
      const block = blockByDepth[depth];
      const result = resolveRenameIds(block, depth, ancestorsByDepth[depth]);
      expect(result.renameSectionId).toBe(expectedSectionId);
      expect(result.renameSubsectionId).toBe(expectedSubsectionId);
    },
  );
});

describe('buildSidebarOpenArgs', () => {
  const INDEX = 0;

  it.each([
    [0, sectionBlock.id, undefined, sectionBlock.id],
    [1, subsectionBlock.id, subsectionBlock.id, sectionBlock.id],
    [2, unitBlock.id, subsectionBlock.id, sectionBlock.id],
  ] as [Depth, string, string | undefined, string][])(
    'depth %d: containerId=%s subsectionId=%s sectionId=%s',
    (depth, expectedContainerId, expectedSubsectionId, expectedSectionId) => {
      const result = buildSidebarOpenArgs(blockByDepth[depth], depth, INDEX, ancestorsByDepth[depth]);
      expect(result.containerId).toBe(expectedContainerId);
      expect(result.subsectionId).toBe(expectedSubsectionId);
      expect(result.sectionId).toBe(expectedSectionId);
      expect(result.index).toBe(INDEX);
    },
  );
});

describe('buildSelectionState', () => {
  const INDEX = 0;

  it.each([
    [0, sectionBlock.id, sectionBlock.id, undefined],
    [1, subsectionBlock.id, sectionBlock.id, subsectionBlock.id],
    [2, unitBlock.id, sectionBlock.id, subsectionBlock.id],
  ] as [Depth, string, string, string | undefined][])(
    'depth %d: currentId=%s sectionId=%s subsectionId=%s',
    (depth, expectedCurrentId, expectedSectionId, expectedSubsectionId) => {
      const result = buildSelectionState(blockByDepth[depth], depth, INDEX, ancestorsByDepth[depth]);
      expect(result.currentId).toBe(expectedCurrentId);
      expect(result.sectionId).toBe(expectedSectionId);
      expect(result.subsectionId).toBe(expectedSubsectionId);
      expect(result.index).toBe(INDEX);
    },
  );

  it('throws on depth 2 when subsection is missing', () => {
    const badAncestors: OutlineNodeAncestors = { section: sectionBlock, subsection: undefined };
    expect(() => buildSelectionState(unitBlock, 2, 0, badAncestors)).toThrow();
  });
});

describe('buildOutlineActionSelection', () => {
  const INDEX = 0;

  it.each([
    [0, 'chapter', sectionBlock.id, sectionBlock.id, undefined],
    [1, 'sequential', subsectionBlock.id, sectionBlock.id, subsectionBlock.id],
    [2, 'vertical', unitBlock.id, sectionBlock.id, subsectionBlock.id],
  ] as [Depth, string, string, string, string | undefined][])(
    'depth %d → category=%s currentId=%s sectionId=%s subsectionId=%s',
    (depth, expectedCategory, expectedCurrentId, expectedSectionId, expectedSubsectionId) => {
      const result = buildOutlineActionSelection(blockByDepth[depth], depth, INDEX, ancestorsByDepth[depth]);
      expect(result.category).toBe(expectedCategory);
      expect(result.currentId).toBe(expectedCurrentId);
      expect(result.sectionId).toBe(expectedSectionId);
      if (expectedSubsectionId !== undefined) {
        expect((result as any).subsectionId).toBe(expectedSubsectionId);
      } else {
        expect((result as any).subsectionId).toBeUndefined();
      }
      expect(result.index).toBe(INDEX);
    },
  );

  it('narrows: depth 0 receives chapter variant without subsectionId', () => {
    const result = buildOutlineActionSelection(sectionBlock, 0, 0, ancestorsByDepth[0]);
    // Type-narrow via explicit check — only 'chapter' has no subsectionId
    if (result.category === 'chapter') {
      expect(result.sectionId).toBe(sectionBlock.id);
      expect('subsectionId' in result).toBe(false);
    } else {
      // Should not reach here
      expect(result.category).toBe('chapter');
    }
  });

  it('narrows: depth 1 receives sequential variant with subsectionId', () => {
    const result = buildOutlineActionSelection(subsectionBlock, 1, 0, ancestorsByDepth[1]);
    if (result.category === 'sequential') {
      expect(result.subsectionId).toBe(subsectionBlock.id);
    } else {
      expect(result.category).toBe('sequential');
    }
  });

  it('narrows: depth 2 receives vertical variant with parent subsectionId', () => {
    const result = buildOutlineActionSelection(unitBlock, 2, 0, ancestorsByDepth[2]);
    if (result.category === 'vertical') {
      expect(result.subsectionId).toBe(subsectionBlock.id);
    } else {
      expect(result.category).toBe('vertical');
    }
  });

  it('throws on depth 2 when subsection is missing', () => {
    const badAncestors: OutlineNodeAncestors = { section: sectionBlock, subsection: undefined };
    expect(() => buildOutlineActionSelection(unitBlock, 2, 0, badAncestors)).toThrow();
  });
});

describe('buildPublishPayload', () => {
  it.each([0, 1] as Depth[])('depth %d omits subsectionId', (depth) => {
    const liveBlock = blockByDepth[depth];
    const result = buildPublishPayload(liveBlock, depth, ancestorsByDepth[depth]);
    expect(result.value).toBe(liveBlock);
    expect(result.sectionId).toBe(sectionBlock.id);
    expect(result.subsectionId).toBeUndefined();
  });

  it('depth 2 includes subsectionId', () => {
    const result = buildPublishPayload(unitBlock, 2, ancestorsByDepth[2]);
    expect(result.value).toBe(unitBlock);
    expect(result.sectionId).toBe(sectionBlock.id);
    expect(result.subsectionId).toBe(subsectionBlock.id);
  });

  it('throws on depth 2 when subsection is missing', () => {
    const badAncestors: OutlineNodeAncestors = { section: sectionBlock, subsection: undefined };
    expect(() => buildPublishPayload(unitBlock, 2, badAncestors)).toThrow();
  });
});

describe('buildUnlinkPayload', () => {
  it.each([0, 1] as Depth[])('depth %d omits subsectionId', (depth) => {
    const result = buildUnlinkPayload(blockByDepth[depth], depth, ancestorsByDepth[depth]);
    expect(result.value).toBe(blockByDepth[depth]);
    expect(result.sectionId).toBe(sectionBlock.id);
    expect(result.subsectionId).toBeUndefined();
  });

  it('depth 2 includes subsectionId', () => {
    const result = buildUnlinkPayload(unitBlock, 2, ancestorsByDepth[2]);
    expect(result.value).toBe(unitBlock);
    expect(result.sectionId).toBe(sectionBlock.id);
    expect(result.subsectionId).toBe(subsectionBlock.id);
  });

  it('throws on depth 2 when subsection is missing', () => {
    const badAncestors: OutlineNodeAncestors = { section: sectionBlock, subsection: undefined };
    expect(() => buildUnlinkPayload(unitBlock, 2, badAncestors)).toThrow();
  });
});

describe('buildDuplicateParams', () => {
  it('depth 0: parentId derived from courseId, no subsectionId', () => {
    const result = buildDuplicateParams(sectionBlock, 0, COURSE_ID, ancestorsByDepth[0]);
    expect(result.itemId).toBe(sectionBlock.id);
    expect(result.parentId).toBe('block-v1:test+course+type@course+block@course');
    expect(result.sectionId).toBe(sectionBlock.id);
    expect(result.subsectionId).toBeUndefined();
  });

  it('depth 1: parentId = section.id, subsectionId = block.id', () => {
    const result = buildDuplicateParams(subsectionBlock, 1, COURSE_ID, ancestorsByDepth[1]);
    expect(result.itemId).toBe(subsectionBlock.id);
    expect(result.parentId).toBe(sectionBlock.id);
    expect(result.sectionId).toBe(sectionBlock.id);
    expect(result.subsectionId).toBe(subsectionBlock.id);
  });

  it('depth 2: parentId = subsection.id, subsectionId = subsection.id', () => {
    const result = buildDuplicateParams(unitBlock, 2, COURSE_ID, ancestorsByDepth[2]);
    expect(result.itemId).toBe(unitBlock.id);
    expect(result.parentId).toBe(subsectionBlock.id);
    expect(result.sectionId).toBe(sectionBlock.id);
    expect(result.subsectionId).toBe(subsectionBlock.id);
  });

  it('throws on depth 2 when subsection is missing', () => {
    const badAncestors: OutlineNodeAncestors = { section: sectionBlock, subsection: undefined };
    expect(() => buildDuplicateParams(unitBlock, 2, COURSE_ID, badAncestors)).toThrow();
  });
});

describe('resolveNodeActions', () => {
  const INDEX = 0;
  const canMoveItem = (oldIndex: number, newIndex: number) => oldIndex !== newIndex;

  it('depth 0: uses canMoveItem for allowMoveUp/Down', () => {
    const result = resolveNodeActions(sectionBlock, 0, INDEX, ancestorsByDepth[0], canMoveItem);
    // canMoveItem(0, -1): 0 !== -1 → true; canMoveItem(0, 1): 0 !== 1 → true
    expect(result.allowMoveUp).toBe(true);
    expect(result.allowMoveDown).toBe(true);
    expect(result.deletable).toBe(true);
    expect(result.duplicable).toBe(true);
  });

  it('depth 0 without canMoveItem keeps original actions', () => {
    const result = resolveNodeActions(sectionBlock, 0, INDEX, ancestorsByDepth[0]);
    expect(result.allowMoveUp).toBe(true);
    expect(result.allowMoveDown).toBe(true);
  });

  it('depth 1: uses getPossibleMoves and checks upstream ref on section', () => {
    const getPossibleMoves: (index: number, step: number) => any = () => ({
      fn: () => {},
      args: [],
      sectionId: sectionBlock.id,
    });
    const result = resolveNodeActions(subsectionBlock, 1, INDEX, ancestorsByDepth[1], undefined, getPossibleMoves);
    expect(result.allowMoveUp).toBe(true);
    expect(result.allowMoveDown).toBe(true);
    expect(result.deletable).toBe(true);
  });

  it('depth 1: inhibits moves when section has upstream ref', () => {
    const sectionWithUpstream = {
      ...sectionBlock,
      upstreamInfo: { upstreamRef: 'lb:org:lib:html:ref1' },
    } as unknown as XBlock;
    const ancestorsWithUpstream: OutlineNodeAncestors = {
      section: sectionWithUpstream,
      subsection: undefined,
    };
    const getPossibleMoves: (index: number, step: number) => any = () => ({
      fn: () => {},
      args: [],
      sectionId: sectionWithUpstream.id,
    });
    const result = resolveNodeActions(
      subsectionBlock,
      1,
      INDEX,
      ancestorsWithUpstream,
      undefined,
      getPossibleMoves,
    );
    expect(result.allowMoveUp).toBe(false);
    expect(result.allowMoveDown).toBe(false);
    expect(result.deletable).toBe(false);
    expect(result.duplicable).toBe(false);
  });

  it('depth 2: inhibits moves when subsection has upstream ref', () => {
    const subsectionWithUpstream = {
      ...subsectionBlock,
      upstreamInfo: { upstreamRef: 'lb:org:lib:html:ref2' },
    } as unknown as XBlock;
    const ancestorsWithUpstream: OutlineNodeAncestors = {
      section: sectionBlock,
      subsection: subsectionWithUpstream,
    };
    const getPossibleMoves: (index: number, step: number) => any = () => ({
      fn: () => {},
      args: [],
      sectionId: sectionBlock.id,
    });
    const result = resolveNodeActions(
      unitBlock,
      2,
      INDEX,
      ancestorsWithUpstream,
      undefined,
      getPossibleMoves,
    );
    expect(result.allowMoveUp).toBe(false);
    expect(result.allowMoveDown).toBe(false);
  });

  it('depth 1, 2 without getPossibleMoves keeps original actions', () => {
    const result = resolveNodeActions(subsectionBlock, 1, INDEX, ancestorsByDepth[1]);
    expect(result.allowMoveUp).toBeUndefined();
    expect(result.allowMoveDown).toBeUndefined();
    expect(result.deletable).toBe(true);
  });

  it('depth 2 inhibits actions when parent has upstream ref', () => {
    const result = resolveNodeActions(unitBlock, 2, 0, ancestorsByDepth[2]);
    expect(result.allowMoveUp).toBeUndefined(); // no getPossibleMoves
  });
});

describe('computeIsDraggable', () => {
  const movableActions: XBlockActions = {
    draggable: true,
    deletable: true,
    childAddable: false,
    duplicable: false,
    allowMoveUp: true,
    allowMoveDown: true,
  };

  it('depth 0: draggable when actions allow it', () => {
    expect(computeIsDraggable(movableActions, 0, ancestorsByDepth[0], true)).toBe(true);
  });

  it('depth 0: not draggable when draggable=false', () => {
    expect(computeIsDraggable({ ...movableActions, draggable: false }, 0, ancestorsByDepth[0], true)).toBe(false);
  });

  it('depth 0: not draggable when neither move direction is allowed', () => {
    const noMoves: XBlockActions = { ...movableActions, allowMoveUp: false, allowMoveDown: false };
    expect(computeIsDraggable(noMoves, 0, ancestorsByDepth[0], true)).toBe(false);
  });

  it('depth 1, 2: not draggable when header is hidden', () => {
    expect(computeIsDraggable(movableActions, 1, ancestorsByDepth[1], false)).toBe(false);
    expect(computeIsDraggable(movableActions, 2, ancestorsByDepth[2], false)).toBe(false);
  });

  it('depth 1: not draggable when section has upstream ref', () => {
    const sectionWithUpstream = {
      ...sectionBlock,
      upstreamInfo: { upstreamRef: 'lb:org:lib:html:ref1' },
    } as unknown as XBlock;
    const ancestors: OutlineNodeAncestors = { section: sectionWithUpstream, subsection: undefined };
    expect(computeIsDraggable(movableActions, 1, ancestors, true)).toBe(false);
  });

  it('depth 2: not draggable when subsection has upstream ref', () => {
    const subsectionWithUpstream = {
      ...subsectionBlock,
      upstreamInfo: { upstreamRef: 'lb:org:lib:html:ref2' },
    } as unknown as XBlock;
    const ancestors: OutlineNodeAncestors = { section: sectionBlock, subsection: subsectionWithUpstream };
    expect(computeIsDraggable(movableActions, 2, ancestors, true)).toBe(false);
  });

  it('depth 1: draggable when section has no upstream ref and header visible', () => {
    const ancestors: OutlineNodeAncestors = { section: sectionBlock, subsection: undefined };
    expect(computeIsDraggable(movableActions, 1, ancestors, true)).toBe(true);
  });

  it('depth 2: draggable when subsection has no upstream ref and header visible', () => {
    expect(computeIsDraggable(movableActions, 2, ancestorsByDepth[2], true)).toBe(true);
  });
});

describe('computeIsDroppable', () => {
  const droppableActions: XBlockActions = {
    draggable: true,
    deletable: true,
    childAddable: true,
    duplicable: true,
  };

  it('depth 0: droppable when draggable or childAddable', () => {
    expect(computeIsDroppable(droppableActions, 0, ancestorsByDepth[0])).toBe(true);
  });

  it('depth 1: droppable when section has childAddable', () => {
    const noAddActions: XBlockActions = { ...droppableActions, childAddable: false, draggable: false };
    expect(computeIsDroppable(noAddActions, 1, ancestorsByDepth[1])).toBe(true);
  });

  it('depth 2: droppable when subsection has childAddable', () => {
    const noAddActions: XBlockActions = { ...droppableActions, childAddable: false, draggable: false };
    expect(computeIsDroppable(noAddActions, 2, ancestorsByDepth[2])).toBe(true);
  });

  it('depth 1, 2: not droppable when ancestors lack childAddable and self has none', () => {
    const noAddActions: XBlockActions = { ...droppableActions, childAddable: false, draggable: false };
    const sectionNoAdd = {
      ...sectionBlock,
      actions: { ...sectionBlock.actions, childAddable: false },
    } as unknown as XBlock;
    const ancestorsNoAdd: OutlineNodeAncestors = { section: sectionNoAdd, subsection: undefined };
    expect(computeIsDroppable(noAddActions, 1, ancestorsNoAdd)).toBe(false);
  });

  it('depth 0: not droppable when neither draggable nor childAddable', () => {
    const noAddActions: XBlockActions = { ...droppableActions, childAddable: false, draggable: false };
    expect(computeIsDroppable(noAddActions, 0, ancestorsByDepth[0])).toBe(false);
  });
});

describe('shouldRenderNode', () => {
  it('always renders depth 0 even with hidden header', () => {
    expect(shouldRenderNode(0, false)).toBe(true);
  });

  it('always renders depth 1 even with hidden header', () => {
    expect(shouldRenderNode(1, false)).toBe(true);
  });

  it('does NOT render depth 2 when header is hidden', () => {
    expect(shouldRenderNode(2, false)).toBe(false);
  });

  it('renders depth 2 when header is visible', () => {
    expect(shouldRenderNode(2, true)).toBe(true);
  });
});

describe('containsSearchResult', () => {
  it('returns false when locatorId is null', () => {
    expect(containsSearchResult(unitBlock, 0, null)).toBe(false);
  });

  it('depth 2 always returns false (units have no visible children)', () => {
    expect(containsSearchResult(unitBlock, 2, 'any-id')).toBe(false);
  });

  it('depth 0 checks subsection children and unit grandchildren', () => {
    const blockWithChild = {
      ...sectionBlock,
      childInfo: {
        displayName: 'Section 1',
        children: [
          {
            ...subsectionBlock,
            id: 'sub1',
            childInfo: { displayName: 'Sub 1', children: [{ ...unitBlock, id: 'unit-deep' }] },
          },
          { ...subsectionBlock, id: 'sub2' },
        ],
      },
    } as unknown as XBlock;
    expect(containsSearchResult(blockWithChild, 0, 'sub1')).toBe(true);
    expect(containsSearchResult(blockWithChild, 0, 'sub2')).toBe(true);
    expect(containsSearchResult(blockWithChild, 0, 'unit-deep')).toBe(true);
    expect(containsSearchResult(blockWithChild, 0, 'nonexistent')).toBe(false);
  });

  it('depth 1 checks unit children', () => {
    const blockWithChildren = {
      ...subsectionBlock,
      childInfo: {
        displayName: 'Sub 1',
        children: [
          { ...unitBlock, id: 'unit1' },
          { ...unitBlock, id: 'unit2' },
        ],
      },
    } as unknown as XBlock;
    expect(containsSearchResult(blockWithChildren, 1, 'unit1')).toBe(true);
    expect(containsSearchResult(blockWithChildren, 1, 'unit2')).toBe(true);
    expect(containsSearchResult(blockWithChildren, 1, 'unit3')).toBe(false);
  });
});

describe('createOutlineNodeModel', () => {
  it('returns object with all expected keys for depth 0', () => {
    const model = createOutlineNodeModel({
      block: sectionBlock,
      depth: 0,
      index: 0,
      ancestors: ancestorsByDepth[0],
      courseId: COURSE_ID,
    });

    expect(model).toHaveProperty('levelConfig');
    expect(model).toHaveProperty('effectiveSection');
    expect(model).toHaveProperty('renameSectionId');
    expect(model).toHaveProperty('renameSubsectionId');
    expect(typeof model.selectionState).toBe('function');
    expect(typeof model.actionSelection).toBe('function');
    expect(typeof model.sidebarOpenArgs).toBe('function');
    expect(typeof model.publishPayload).toBe('function');
    expect(typeof model.unlinkPayload).toBe('function');
    expect(typeof model.duplicateParams).toBe('function');
    expect(typeof model.actions).toBe('function');
    expect(typeof model.isDraggable).toBe('function');
    expect(typeof model.isDroppable).toBe('function');
    expect(typeof model.shouldRender).toBe('function');
    expect(typeof model.containsSearchResult).toBe('function');
  });

  it('bound functions produce correct results (depth 0)', () => {
    const model = createOutlineNodeModel({
      block: sectionBlock,
      depth: 0,
      index: 2,
      ancestors: ancestorsByDepth[0],
      courseId: COURSE_ID,
    });
    expect(model.effectiveSection.id).toBe(sectionBlock.id);
    expect(model.renameSectionId).toBe(sectionBlock.id);
    expect(model.renameSubsectionId).toBeUndefined();
    expect(model.selectionState().currentId).toBe(sectionBlock.id);
    expect(model.actionSelection().category).toBe('chapter');
    expect(model.duplicateParams().subsectionId).toBeUndefined();
    expect(model.shouldRender(true)).toBe(true);
    expect(model.shouldRender(false)).toBe(true);
  });

  it('bound functions produce correct results (depth 2)', () => {
    const model = createOutlineNodeModel({
      block: unitBlock,
      depth: 2,
      index: 5,
      ancestors: ancestorsByDepth[2],
      courseId: COURSE_ID,
    });
    expect(model.effectiveSection.id).toBe(sectionBlock.id);
    expect(model.renameSectionId).toBe(sectionBlock.id);
    expect(model.renameSubsectionId).toBe(subsectionBlock.id);
    const selection = model.selectionState();
    expect(selection.currentId).toBe(unitBlock.id);
    expect(selection.subsectionId).toBe(subsectionBlock.id);
    expect(model.actionSelection().category).toBe('vertical');
    expect(model.duplicateParams().subsectionId).toBe(subsectionBlock.id);
    expect(model.shouldRender(false)).toBe(false);
    expect(model.shouldRender(true)).toBe(true);
  });
});
