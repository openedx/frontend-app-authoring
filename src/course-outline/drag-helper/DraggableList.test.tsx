import React from 'react';
import { render } from '@testing-library/react';

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

describe('DraggableList — drag-local tree ref', () => {
  beforeEach(() => {
    mockDndHandlers.current = null;
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
});
