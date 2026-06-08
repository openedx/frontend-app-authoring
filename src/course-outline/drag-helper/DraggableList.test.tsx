import React from 'react';
import { render } from '@testing-library/react';

// --- Mocks ---

// Capture DndContext handlers so we can invoke them directly in tests.
type DndHandlers = {
  onDragStart: (e: any) => void;
  onDragOver: (e: any) => void;
  onDragEnd: (e: any) => void;
  onDragCancel: () => void;
};
const mockDndHandlers: { current: DndHandlers | null; } = { current: null };

jest.mock('@dnd-kit/core', () => {
  const actual = jest.requireActual('@dnd-kit/core');
  return {
    ...actual,
    DndContext: jest.fn(
      ({
        onDragStart,
        onDragOver,
        onDragEnd,
        onDragCancel,
        children,
      }: any) => {
        mockDndHandlers.current = { onDragStart, onDragOver, onDragEnd, onDragCancel };
        return <div data-testid="dnd-context-mock">{children}</div>;
      },
    ),
  };
});

jest.mock('@dnd-kit/sortable', () => {
  const actual = jest.requireActual('@dnd-kit/sortable');
  return {
    ...actual,
  };
});

jest.mock('react-dom', () => {
  const actual = jest.requireActual('react-dom');
  return {
    ...actual,
    createPortal: (node: any) => node,
  };
});

import DraggableList from './DraggableList';

// --- Helpers ---

const makeSection = (id: string, subsections: any[] = []) => ({
  id,
  displayName: `Section ${id}`,
  category: 'chapter',
  actions: { deletable: true, draggable: true, childAddable: true, duplicable: true },
  childInfo: { children: subsections },
});

const makeSubsection = (id: string, units: any[] = []) => ({
  id,
  displayName: `Subsection ${id}`,
  category: 'sequential',
  actions: { deletable: true, draggable: true, childAddable: true, duplicable: true },
  childInfo: { children: units },
});

const makeUnit = (id: string) => ({
  id,
  displayName: `Unit ${id}`,
  category: 'vertical',
  actions: { deletable: true, draggable: true, childAddable: true, duplicable: true },
  childInfo: { children: [] },
});

function fireDragStart(
  id: string,
  displayName = 'Item',
  category = 'sequential',
) {
  const handlers = mockDndHandlers.current!;
  handlers.onDragStart({
    active: {
      id,
      data: { current: { displayName, category, status: '' } },
      rect: { current: { translated: null } },
    },
    over: null,
    activatorEvent: new Event('pointerdown'),
  });
}

function fireDragOver(
  activeId: string,
  overId: string,
  activeData?: Record<string, any>,
  overData?: Record<string, any>,
) {
  const handlers = mockDndHandlers.current!;
  handlers.onDragOver({
    active: {
      id: activeId,
      data: { current: { category: activeData?.category || 'sequential', ...activeData } },
      rect: { current: { translated: { top: 100 } } },
    },
    over: {
      id: overId,
      data: { current: { category: overData?.category || 'sequential', ...overData } },
      rect: { top: 200, height: 40 },
    },
  });
}

function fireDragEnd(
  activeId: string,
  overId: string,
) {
  const handlers = mockDndHandlers.current!;
  handlers.onDragEnd({
    active: { id: activeId },
    over: { id: overId },
  });
}

function renderList(
  items: any[],
  overrides?: Partial<{
    onPreviewTreeChange: jest.Mock;
    onCancelDrag: jest.Mock;
    onSectionDrop: jest.Mock;
    onSubsectionDrop: jest.Mock;
    onUnitDrop: jest.Mock;
  }>,
) {
  const callbacks = {
    onPreviewTreeChange: jest.fn(),
    onCancelDrag: jest.fn(),
    onSectionDrop: jest.fn(),
    onSubsectionDrop: jest.fn(),
    onUnitDrop: jest.fn(),
    ...overrides,
  };
  render(
    <DraggableList items={items} {...callbacks}>
      <div data-testid="children" />
    </DraggableList>,
  );
  return callbacks;
}

// --- Tests ---

describe('DraggableList — drag-local tree ref', () => {
  beforeEach(() => {
    mockDndHandlers.current = null;
  });

  describe('cross-parent subsection drop', () => {
    it('uses drag-local tree for dragEnd math even when items prop is stale', () => {
      // Setup: two sections, each with one subsection.
      const subsectionA = makeSubsection('sub-A');
      const subsectionB = makeSubsection('sub-B');
      const section1 = makeSection('sec-1', [subsectionA]);
      const section2 = makeSection('sec-2', [subsectionB]);
      const items = [section1, section2];

      const callbacks = renderList(items);

      // Verify the DndContext mock received the handlers.
      expect(mockDndHandlers.current).not.toBeNull();

      // Phase 1: start drag of subsection A.
      fireDragStart('sub-A', 'Subsection A', 'sequential');

      // Phase 2: dragOver — move subsection A into section 2 (cross-parent).
      // This triggers onPreviewTreeChange via the drag-over handler.
      fireDragOver(
        'sub-A',
        'sec-2',
        { category: 'sequential', parentIndex: 0 },
        { category: 'chapter', childAddable: true, index: 1 },
      );

      // After dragOver, preview should have been called.
      expect(callbacks.onPreviewTreeChange).toHaveBeenCalled();

      // Force items prop to be stale: pretend parent never re-rendered.
      // This simulates the bug: items still has the original tree,
      // but the drag-local ref has the preview tree.
      // We trigger dragEnd WITHOUT re-rendering the component.
      fireDragEnd('sub-A', 'sub-B');

      // The drop callback should have been called — subsection moved.
      // Since the original items had sub-A under sec-1 and sub-B under sec-2,
      // after the cross-parent move, sub-A should be in sec-2's children.
      // The commit call indicates the move was computed from the preview tree.
      expect(callbacks.onSubsectionDrop).toHaveBeenCalledTimes(1);

      const [sectionId, prevSectionId, subsectionListIds] = callbacks.onSubsectionDrop.mock.calls[0];
      // sectionId should be sec-2 (the target section).
      expect(sectionId).toBe('sec-2');
      // prevSectionId should be sec-1 (the source section).
      expect(prevSectionId).toBe('sec-1');
      // subsectionListIds should contain both sub-A and sub-B.
      expect(subsectionListIds).toContain('sub-A');
      expect(subsectionListIds).toContain('sub-B');
    });
  });

  describe('cross-parent unit drop', () => {
    it('uses drag-local tree for unit dragEnd after cross-parent dragOver', () => {
      // Setup: two sections, each with one subsection containing one unit.
      const unitA = makeUnit('unit-A');
      const unitB = makeUnit('unit-B');
      const subsectionA = makeSubsection('sub-A', [unitA]);
      const subsectionB = makeSubsection('sub-B', [unitB]);
      const section1 = makeSection('sec-1', [subsectionA]);
      const section2 = makeSection('sec-2', [subsectionB]);
      const items = [section1, section2];

      const callbacks = renderList(items);

      // DragUnit A cross-section.
      // 1. Start drag on unit-A.
      fireDragStart('unit-A', 'Unit A', 'vertical');

      // 2. DragOver — move unit-A into section2's subsection.
      fireDragOver(
        'unit-A',
        'sub-B',
        {
          category: 'vertical',
          grandParentIndex: 0,
          parentIndex: 0,
          childAddable: true,
        },
        {
          category: 'sequential',
          childAddable: true,
          parentIndex: 1,
          index: 0,
        },
      );

      expect(callbacks.onPreviewTreeChange).toHaveBeenCalled();

      // 3. DragEnd without re-render (stale items prop).
      fireDragEnd('unit-A', 'unit-B');

      expect(callbacks.onUnitDrop).toHaveBeenCalledTimes(1);
      const [sectionId, prevSectionId, subsectionId, unitListIds] = callbacks.onUnitDrop.mock.calls[0];

      // unit-A should have moved to section2's subsection.
      expect(sectionId).toBe('sec-2');
      expect(prevSectionId).toBe('sec-1');
      expect(subsectionId).toBe('sub-B');
      expect(unitListIds).toContain('unit-A');
      expect(unitListIds).toContain('unit-B');
    });
  });

  describe('unit drag over non-childAddable subsection via contained-unit collision', () => {
    it('must not preview or commit when over unit inside childAddable=false subsection', () => {
      // sub-B has childAddable=false (e.g. library subsection) but draggable=true
      const unitA = makeUnit('unit-A');
      const unitB = makeUnit('unit-B');
      const subsectionA = makeSubsection('sub-A', [unitA]);
      const subsectionB = makeSubsection('sub-B', [unitB]);
      subsectionB.actions.childAddable = false;
      const section1 = makeSection('sec-1', [subsectionA]);
      const section2 = makeSection('sec-2', [subsectionB]);
      const items = [section1, section2];

      const callbacks = renderList(items);

      expect(mockDndHandlers.current).not.toBeNull();

      // Start dragging unit-A from sub-A.
      fireDragStart('unit-A', 'Unit A', 'vertical');

      // Drag over unit-B inside sub-B (childAddable=false).
      fireDragOver(
        'unit-A',
        'unit-B',
        { category: 'vertical' },
        { category: 'vertical' },
      );

      // unitDragOver guard should fire — no preview.
      expect(callbacks.onPreviewTreeChange).not.toHaveBeenCalled();

      // Drag end — no commit.
      fireDragEnd('unit-A', 'unit-B');

      expect(callbacks.onUnitDrop).not.toHaveBeenCalled();
    });
  });

  describe('drag cancellations reset ref', () => {
    it('resets drag-local state on cancel', () => {
      const section1 = makeSection('sec-1', [makeSubsection('sub-A')]);
      const section2 = makeSection('sec-2', [makeSubsection('sub-B')]);
      const items = [section1, section2];

      const callbacks = renderList(items);

      fireDragStart('sub-A', 'Sub A', 'sequential');
      expect(callbacks.onPreviewTreeChange).not.toHaveBeenCalled();

      // Cancel the drag.
      mockDndHandlers.current!.onDragCancel();

      expect(callbacks.onCancelDrag).toHaveBeenCalled();
    });
  });
});
