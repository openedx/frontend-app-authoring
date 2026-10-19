import { act, render } from '@testing-library/react';
import type { DragEndEvent } from '@dnd-kit/core';

import DraggableList from './DraggableList';

// DndContext is replaced so the test can end a drag directly: jsdom cannot
// drive dnd-kit's pointer sensors.
let endDrag: ((event: DragEndEvent) => void) | undefined;
jest.mock('@dnd-kit/core', () => ({
  ...jest.requireActual('@dnd-kit/core'),
  DndContext: ({ onDragEnd, children }: { onDragEnd: (event: DragEndEvent) => void; children: React.ReactNode; }) => {
    endDrag = onDragEnd;
    return children;
  },
}));

const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
const drop = (activeId: string, overId: string | null) =>
  act(() => {
    endDrag!({ active: { id: activeId }, over: overId ? { id: overId } : null } as unknown as DragEndEvent);
  });

describe('DraggableList', () => {
  // React runs a state updater later, during render, whenever the component
  // already has an update queued. The new order must not depend on the
  // updater having run by the time it is reported.
  it('reports the new order even when setState defers its updater', () => {
    const persist = jest.fn();
    const deferringSetState = jest.fn(); // never calls the updater
    render(
      <DraggableList itemList={items} setState={deferringSetState} updateOrder={() => persist}>
        <div />
      </DraggableList>,
    );
    drop('a', 'c');
    expect(persist).toHaveBeenCalledWith([{ id: 'b' }, { id: 'c' }, { id: 'a' }]);
    expect(deferringSetState).toHaveBeenCalledWith([{ id: 'b' }, { id: 'c' }, { id: 'a' }]);
  });

  it('does nothing when the item is dropped outside the list', () => {
    const persist = jest.fn();
    const setState = jest.fn();
    render(
      <DraggableList itemList={items} setState={setState} updateOrder={() => persist}>
        <div />
      </DraggableList>,
    );
    drop('a', null);
    expect(persist).not.toHaveBeenCalled();
    expect(setState).not.toHaveBeenCalled();
  });
});
