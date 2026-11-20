import React from 'react';
import { act, render, screen } from '@testing-library/react';
import type { CollisionDetection, DroppableContainer } from '@dnd-kit/core';

// Capture DndContext handlers so we can invoke them directly in tests.
type DndHandlers = {
  onDragStart: (e: any) => void;
  onDragOver: (e: any) => void;
  onDragEnd: (e: any) => void;
  onDragCancel: () => void;
  collisionDetection: CollisionDetection;
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
        collisionDetection,
        children,
      }: any) => {
        mockDndHandlers.current = { onDragStart, onDragOver, onDragEnd, onDragCancel, collisionDetection };
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
import { DragContext } from './DragContextProvider';

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
  overId: string | null,
) {
  const handlers = mockDndHandlers.current!;
  handlers.onDragEnd({
    active: { id: activeId },
    over: overId ? { id: overId } : null,
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
  children: React.ReactNode = <div data-testid="children" />,
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
      {children}
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

describe('DraggableList — drop target', () => {
  const OverId = () => <span data-testid="over-id">{React.useContext(DragContext).overId}</span>;

  const unitA = makeUnit('unit-A');
  const subsectionA = makeSubsection('sub-A', [unitA]);
  const subsectionB = makeSubsection('sub-B');
  const items = [makeSection('sec-1', [subsectionA]), makeSection('sec-2', [subsectionB])];

  const renderWithOverId = () => renderList(items, undefined, <OverId />);

  const dragUnitOverSubsectionB = () => {
    act(() => {
      fireDragStart('unit-A', 'Unit A', 'vertical');
      fireDragOver('unit-A', 'sub-B', { category: 'vertical' }, { category: 'sequential' });
    });
  };

  const container = (id: string, category: string) => ({
    id,
    key: id,
    disabled: false,
    data: { current: { category, childAddable: true } },
    node: { current: null },
    rect: { current: null },
  } as DroppableContainer);

  beforeEach(() => {
    mockDndHandlers.current = null;
  });

  it('does not offer sections to a dragged unit once its card unmounts', () => {
    renderWithOverId();
    const rect = { width: 10, height: 10, top: 0, left: 0, right: 10, bottom: 10 };

    // dnd-kit passes empty data when the dragged unit has moved into a collapsed subsection.
    const collisions = mockDndHandlers.current!.collisionDetection({
      active: { id: 'unit-A', data: { current: {} }, rect: { current: { initial: null, translated: null } } },
      collisionRect: rect,
      droppableRects: new Map([['sec-2', rect], ['sub-B', rect], ['unit-B', rect]]),
      droppableContainers: [
        container('sec-2', 'chapter'),
        container('sub-B', 'sequential'),
        container('unit-B', 'vertical'),
      ],
      pointerCoordinates: null,
    });

    expect(new Set(collisions.map(({ id }) => id))).toEqual(new Set(['sub-B', 'unit-B']));
  });

  it('clears the drop target when a drag is cancelled', () => {
    renderWithOverId();
    dragUnitOverSubsectionB();
    expect(screen.getByTestId('over-id')).toHaveTextContent('sub-B');

    act(() => mockDndHandlers.current!.onDragCancel());

    expect(screen.getByTestId('over-id')).toBeEmptyDOMElement();
  });

  it('clears the drop target when a drag ends outside any target', () => {
    renderWithOverId();
    dragUnitOverSubsectionB();

    act(() => fireDragEnd('unit-A', null));

    expect(screen.getByTestId('over-id')).toBeEmptyDOMElement();
  });
});
