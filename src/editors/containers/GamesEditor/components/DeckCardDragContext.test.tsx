import React from 'react';
import userEvent from '@testing-library/user-event';
import { act, fireEvent, initializeMocks, render, screen, waitFor, within } from '@src/testUtils';
import { SortableItem } from '@src/generic/DraggableList';

import { emptyCard, initialState, moveCard } from '@src/editors/containers/GamesEditor/data/gameTransitions';
import type { Card, Deck } from '@src/editors/containers/GamesEditor/types';
import { stubRects, type StubbedRect } from '../testUtils/stubRects';
import {
  DeckCardDragProvider,
  DeckCardList,
  DeckDragHandle,
  DeckDragList,
  DeckDragRow,
  DeckDropTarget,
  deckRowDroppableId,
  useDeckDragPreview,
  type CardMove,
  type DeckMove,
} from './DeckCardDragContext';

/**
 * The real drag layer, with one seam: DndContext is wrapped (not replaced) so the
 * provider's own handlers, collision gate and announcements can be read. Sensors,
 * droppables, sortables, focus handling and the live region are all real, so the
 * keyboard and pointer journeys below run through dnd-kit's own state machine.
 *
 * The handler-level tests drive the captured handlers directly: a few contracts
 * (the final over being the dragged card, the pointer-outside gate) are dnd-kit
 * artifacts that no sensor can be made to produce on demand.
 */
let mockHandlers: {
  onDragStart?: (event: any) => void;
  onDragOver?: (event: any) => void;
  onDragEnd?: (event: any) => void;
  onDragCancel?: (event: any) => void;
} = {};
// The accessibility announcements the provider registered.
let mockAnnouncements: {
  onDragStart?: (event: any) => string | undefined;
  onDragOver?: (event: any) => string | undefined;
  onDragEnd?: (event: any) => string | undefined;
  onDragCancel?: (event: any) => string | undefined;
} | undefined;
// The collision detector the provider registered, so a test can hand it the
// pointer coordinates the real dnd-kit would.
let mockCollisionDetection: ((args: any) => any[]) | undefined;

jest.mock('@dnd-kit/core', () => {
  const actual = jest.requireActual('@dnd-kit/core');
  const ReactModule = jest.requireActual('react');
  return {
    ...actual,
    DndContext: (props: any) => {
      mockHandlers = {
        onDragStart: props.onDragStart,
        onDragOver: props.onDragOver,
        onDragEnd: props.onDragEnd,
        onDragCancel: props.onDragCancel,
      };
      mockAnnouncements = props.accessibility?.announcements;
      mockCollisionDetection = props.collisionDetection;
      return ReactModule.createElement(actual.DndContext, props);
    },
  };
});

// A failed assertion can leave a drag mid-flight, and the provider's document
// Escape listener would then swallow the next test's Escape: end it here.
afterEach(() => {
  if (document.querySelector('[data-dnd-dragging="true"]')) {
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
  }
});

const card = (id: string, term = id): Card => ({ ...emptyCard(), id, term, card_key: 'key-' + id });
const deck = (id: string, name: string, cards: Card[] = []): Deck => ({ id, name, cards });
const deckOf = (id: string, ids: string[]): Deck => deck(id, id, ids.map((entry) => card(entry)));

let restoreRects: (() => void) | undefined;

const useRects = (rects: Record<string, StubbedRect>) => {
  restoreRects = stubRects(rects);
};

const committed = () => screen.getByTestId('committed').textContent;
const liveRegion = () => screen.getByRole('status');

/** The row wrapper the module renders for a card or deck droppable. */
const row = (id: string): HTMLElement => {
  const found = Array.from(document.querySelectorAll<HTMLElement>('[data-dnd-id]'))
    .find((element) => element.dataset.dndId === id);
  if (!found) { throw new Error('No droppable row for ' + id); }
  return found;
};

const dragHandle = (cardId: string): HTMLElement =>
  within(row(cardId)).getByRole('button', { name: 'Drag to reorder' });

/** A deck row's own handle, named after the deck. */
const deckDragHandle = (deckName: string): HTMLElement => screen.getByRole('button', { name: 'Reorder ' + deckName });

/* ------------------------------------------------------------------ *
 * Sensor-level harness: the outline as the drag layer needs it, with the
 * caller's half of each move applied so the committed tree is visible.
 * ------------------------------------------------------------------ */

const applyMove = (decks: Deck[], move: CardMove): Deck[] => {
  const state = { ...initialState, decks, activeDeckId: decks[0].id, list: decks[0].cards };
  return moveCard(state, move.cardId, { deckId: move.toDeckId, index: move.toIndex }).decks;
};

/** The caller's half of a deck reorder: the stored order is what was dropped. */
const applyDeckMove = (decks: Deck[], move: DeckMove): Deck[] => {
  const from = decks.findIndex((entry) => entry.id === move.deckId);
  if (from < 0) { return decks; }
  const next = [...decks];
  const [moved] = next.splice(from, 1);
  next.splice(move.toIndex, 0, moved);
  return next;
};

const Harness = ({
  initialDecks,
  initiallyOpen,
  onCommit,
  onDeckCommit,
}: {
  initialDecks: Deck[];
  initiallyOpen: string[];
  /** Counts the card moves the provider reports, on top of applying them. */
  onCommit?: (move: CardMove) => void;
  /** Counts the deck reorders the provider reports, on top of applying them. */
  onDeckCommit?: (move: DeckMove) => void;
}) => {
  const [decks, setDecks] = React.useState(initialDecks);
  const [openDeckIds, setOpenDeckIds] = React.useState<ReadonlySet<string>>(() => new Set(initiallyOpen));
  const onCardMove = React.useCallback((move: CardMove) => {
    onCommit?.(move);
    setDecks((current) => applyMove(current, move));
  }, [onCommit]);
  const onDeckMove = React.useCallback((move: DeckMove) => {
    onDeckCommit?.(move);
    setDecks((current) => applyDeckMove(current, move));
  }, [onDeckCommit]);
  const openDeck = React.useCallback((deckId: string) => {
    setOpenDeckIds((previous) => new Set(previous).add(deckId));
  }, []);

  return (
    <>
      <div data-testid="committed">
        {decks.map((entry) => entry.id + ':' + entry.cards.map((item) => item.id).join(',')).join(' | ')}
      </div>
      <DeckCardDragProvider
        decks={decks}
        onCardMove={onCardMove}
        onDeckMove={onDeckMove}
        // These tests are about the drag layer, not the state it reports to.
        onCardDragStart={() => undefined}
      >
        <DeckDragList deckIds={decks.map((entry) => entry.id)}>
          {decks.map((entry, index) => (
            <DeckDragRow key={entry.id} deckId={entry.id}>
              <DeckDragHandle deckName={entry.name} position={index + 1} />
              <DeckDropTarget
                deckId={entry.id}
                isExpanded={openDeckIds.has(entry.id)}
                onRequestExpand={() => openDeck(entry.id)}
              >
                <h3>{entry.name}</h3>
              </DeckDropTarget>
              {openDeckIds.has(entry.id) && (
                <DeckCardList
                  deckId={entry.id}
                  renderCard={(_, item) => (
                    <SortableItem id={item.id} actions={null}>
                      <span>{item.term}</span>
                    </SortableItem>
                  )}
                />
              )}
            </DeckDragRow>
          ))}
        </DeckDragList>
      </DeckCardDragProvider>
    </>
  );
};

const startDrag = async (user: ReturnType<typeof userEvent.setup>, cardId: string, key = ' ') => {
  dragHandle(cardId).focus();
  await user.keyboard(key);
  await waitFor(() => expect(liveRegion()).toHaveTextContent('Picked up'));
};

describe('DeckCardDragContext keyboard dragging', () => {
  beforeEach(() => {
    initializeMocks();
    restoreRects = undefined;
  });

  afterEach(() => {
    restoreRects?.();
  });

  it('reorders within a deck with the arrow keys, committing once and restoring focus', async () => {
    const user = userEvent.setup();
    const onCommit = jest.fn();
    const decks = [deck('d1', 'Cell Biology', [card('c1', 'Mitochondrion'), card('c2', 'Ribosome')])];
    // Ascending rows: the stock coordinate getter filters by top.
    useRects({ 'deck:d1': [0, 40], c1: [60, 100], c2: [120, 160] });
    render(<Harness initialDecks={decks} initiallyOpen={['d1']} onCommit={onCommit} />);

    await startDrag(user, 'c1');

    expect(liveRegion()).toHaveTextContent('Picked up Mitochondrion in Cell Biology.');
    // Names only: no raw ids (card or deck) reach a screen reader.
    expect(liveRegion()).not.toHaveTextContent(/\bc1\b|\bd1\b/);

    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(liveRegion()).toHaveTextContent('position 2 of Cell Biology'));

    await user.keyboard(' ');
    await waitFor(() => expect(committed()).toEqual('d1:c2,c1'));
    // One drop, one move.
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith({ cardId: 'c1', toDeckId: 'd1', toIndex: 1 });
    expect(liveRegion()).toHaveTextContent('at the end of Cell Biology');
    await waitFor(() => expect(dragHandle('c1')).toHaveFocus());
  });

  // The deck header sits above its own rows, so ArrowUp from the first card
  // reaches it. That must not be read as "move the card to the end".
  it('does not move a card to the end when the arrow reaches its own deck header', async () => {
    const user = userEvent.setup();
    const decks = [deck('d1', 'Cell Biology', [card('c1', 'Mitochondrion'), card('c2', 'Ribosome')])];
    useRects({ 'deck:d1': [0, 40], c1: [60, 100], c2: [120, 160] });
    render(<Harness initialDecks={decks} initiallyOpen={['d1']} />);

    await startDrag(user, 'c1');
    await user.keyboard('{ArrowUp}');
    await user.keyboard(' ');

    await waitFor(() => expect(liveRegion()).toHaveTextContent('Dropped Mitochondrion.'));
    expect(committed()).toEqual('d1:c1,c2');
    await waitFor(() => expect(dragHandle('c1')).toHaveFocus());
  });

  it('moves a card into another deck before the hovered row, focusing its new handle', async () => {
    const user = userEvent.setup();
    const onCommit = jest.fn();
    const decks = [
      deck('d1', 'Cell Biology', [card('c1', 'Mitochondrion')]),
      deck('d2', 'Genetics', [card('c2', 'Allele'), card('c3', 'Genome')]),
    ];
    useRects({
      'deck:d1': [0, 40],
      c1: [60, 100],
      'deck:d2': [120, 160],
      c2: [180, 220],
      c3: [240, 280],
    });
    render(<Harness initialDecks={decks} initiallyOpen={['d1', 'd2']} onCommit={onCommit} />);

    await startDrag(user, 'c1');

    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(liveRegion()).toHaveTextContent('moved over the end of Genetics'));

    // The first row of the later deck: the card lands before it, at position 1.
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(liveRegion()).toHaveTextContent('moved over position 1 of Genetics'));

    await user.keyboard(' ');
    await waitFor(() => expect(committed()).toEqual('d1: | d2:c1,c2,c3'));
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith({ cardId: 'c1', toDeckId: 'd2', toIndex: 0 });
    expect(liveRegion()).toHaveTextContent('Dropped Mitochondrion at position 1 of Genetics.');
    // The drop announcement names the card and decks, never their ids.
    expect(liveRegion()).not.toHaveTextContent(/\bc1\b|\bd1\b|\bd2\b/);

    await waitFor(() => expect(dragHandle('c1')).toHaveFocus());
    expect(row('c1').closest('[data-dnd-id="deck-row:d2"]')).toHaveTextContent('Genetics');
  });

  // The same walk one row further: a middle position in another deck is where
  // the index shifting between decks actually happens.
  it('inserts into the middle of another deck with the arrow keys', async () => {
    const user = userEvent.setup();
    const onCommit = jest.fn();
    const decks = [
      deck('d1', 'Cell Biology', [card('c1', 'Mitochondrion')]),
      deck('d2', 'Genetics', [card('c2', 'Allele'), card('c3', 'Genome')]),
    ];
    useRects({
      'deck:d1': [0, 40],
      c1: [60, 100],
      'deck:d2': [120, 160],
      c2: [180, 220],
      c3: [240, 280],
    });
    render(<Harness initialDecks={decks} initiallyOpen={['d1', 'd2']} onCommit={onCommit} />);

    await startDrag(user, 'c1');

    // Header, then the first row, then the second.
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(liveRegion()).toHaveTextContent('moved over the end of Genetics'));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(liveRegion()).toHaveTextContent('moved over position 1 of Genetics'));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(liveRegion()).toHaveTextContent('moved over position 2 of Genetics'));

    await user.keyboard(' ');

    await waitFor(() => expect(committed()).toEqual('d1: | d2:c2,c1,c3'));
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith({ cardId: 'c1', toDeckId: 'd2', toIndex: 1 });
    expect(liveRegion()).toHaveTextContent('Dropped Mitochondrion at position 2 of Genetics.');
    await waitFor(() => expect(dragHandle('c1')).toHaveFocus());
  });

  // Hovering a collapsed deck's header is what makes its card rows reachable at
  // all; the header itself appends.
  it('opens a collapsed deck on hover and appends the card to it', async () => {
    const user = userEvent.setup();
    const decks = [
      deck('d1', 'Cell Biology', [card('c1', 'Mitochondrion')]),
      deck('d2', 'Genetics', [card('c2', 'Allele'), card('c3', 'Genome')]),
    ];
    useRects({ 'deck:d1': [0, 40], c1: [60, 100], 'deck:d2': [120, 160] });
    render(<Harness initialDecks={decks} initiallyOpen={['d1']} />);

    await startDrag(user, 'c1');

    await user.keyboard('{ArrowDown}');
    // Hovering the header asks the outline to open it.
    await waitFor(() => expect(screen.getByText('Allele')).toBeInTheDocument());
    await waitFor(() => expect(liveRegion()).toHaveTextContent('moved over the end of Genetics'));

    await user.keyboard(' ');
    await waitFor(() => expect(committed()).toEqual('d1: | d2:c2,c3,c1'));
    expect(liveRegion()).toHaveTextContent('at the end of Genetics');
    await waitFor(() => expect(dragHandle('c1')).toHaveFocus());
  });

  it('drops a card into an empty deck through its header', async () => {
    const user = userEvent.setup();
    const decks = [deck('d1', 'Cell Biology', [card('c1', 'Mitochondrion')]), deck('d2', 'Ecology')];
    // The empty deck has no rows: its header is the target.
    useRects({ 'deck:d1': [0, 40], c1: [60, 100], 'deck:d2': [120, 160] });
    render(<Harness initialDecks={decks} initiallyOpen={['d1', 'd2']} />);

    await startDrag(user, 'c1');

    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(liveRegion()).toHaveTextContent('moved over the empty deck Ecology'));

    await user.keyboard(' ');
    await waitFor(() => expect(committed()).toEqual('d1: | d2:c1'));
    expect(liveRegion()).toHaveTextContent('in the empty deck Ecology');
    await waitFor(() => expect(dragHandle('c1')).toHaveFocus());
  });

  it('cancels with Escape, leaving the deck unchanged and focus where it started', async () => {
    const user = userEvent.setup();
    const decks = [deck('d1', 'Cell Biology', [card('c1', 'Mitochondrion'), card('c2', 'Ribosome')])];
    useRects({ 'deck:d1': [0, 40], c1: [60, 100], c2: [120, 160] });
    render(<Harness initialDecks={decks} initiallyOpen={['d1']} />);

    // Enter starts a drag as well as Space.
    await startDrag(user, 'c1', '{Enter}');
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(liveRegion()).toHaveTextContent('position 2 of Cell Biology'));

    await user.keyboard('{Escape}');

    await waitFor(() => expect(liveRegion()).toHaveTextContent('Drag cancelled.'));
    expect(liveRegion()).toHaveTextContent('Mitochondrion stayed in Cell Biology');
    expect(liveRegion()).not.toHaveTextContent(/\bc1\b|\bc2\b|\bd1\b/);
    expect(committed()).toEqual('d1:c1,c2');
    await waitFor(() => expect(dragHandle('c1')).toHaveFocus());
  });

  // The editor's modal listens for Escape on the document. A listener that was
  // registered before dnd-kit's - as the modal's is, on mount - must already see
  // the event as handled, or it closes the whole editor. Only while a drag is
  // active, though: an idle Escape, and one after the drag has ended, belong to
  // the page.
  it('marks Escape handled only while a drag is active, before an earlier listener sees it', async () => {
    const user = userEvent.setup();
    const decks = [deck('d1', 'Cell Biology', [card('c1', 'Mitochondrion')])];
    useRects({ 'deck:d1': [0, 40], c1: [60, 100] });
    render(<Harness initialDecks={decks} initiallyOpen={['d1']} />);

    const seen: boolean[] = [];
    const listener = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { seen.push(event.defaultPrevented); }
    };
    document.addEventListener('keydown', listener);

    // Idle: nothing owns Escape yet.
    await user.keyboard('{Escape}');
    await startDrag(user, 'c1');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(liveRegion()).toHaveTextContent('Drag cancelled.'));
    // The drag is over, so Escape is the page's again.
    await user.keyboard('{Escape}');
    document.removeEventListener('keydown', listener);

    expect(seen).toEqual([false, true, false]);
  });
});

// The Escape listener is the provider's, not the keyboard sensor's: a pointer
// drag started by the real PointerSensor has to cancel on it too, or the
// editor's modal closes over a drag still in flight. jsdom has no PointerEvent
// of its own, but user-event supplies one and stubRects the layout.
describe('DeckCardDragContext pointer dragging', () => {
  beforeEach(() => {
    initializeMocks();
    restoreRects = undefined;
  });

  afterEach(() => {
    restoreRects?.();
  });

  it('cancels a pointer drag with Escape, leaving the deck unchanged', async () => {
    const user = userEvent.setup();
    const onCommit = jest.fn();
    const decks = [deck('d1', 'Cell Biology', [card('c1', 'Mitochondrion'), card('c2', 'Ribosome')])];
    useRects({ 'deck:d1': [0, 40], c1: [60, 100], c2: [120, 160] });
    render(<Harness initialDecks={decks} initiallyOpen={['d1']} onCommit={onCommit} />);

    const handle = dragHandle('c1');
    // Press on the handle, then move past the sensor's 8px activation distance.
    await user.pointer([
      { target: handle, keys: '[MouseLeft>]' },
      { target: handle, coords: { x: 400, y: 95 } },
    ]);
    await waitFor(() => expect(liveRegion()).toHaveTextContent('Picked up Mitochondrion in Cell Biology.'));

    await user.keyboard('{Escape}');

    await waitFor(() => expect(liveRegion()).toHaveTextContent('Drag cancelled.'));
    expect(liveRegion()).toHaveTextContent('Mitochondrion stayed in Cell Biology');
    expect(committed()).toEqual('d1:c1,c2');
    expect(onCommit).not.toHaveBeenCalled();

    // Let go of a button the cancelled sensor no longer listens for.
    await user.pointer({ keys: '[/MouseLeft]' });
  });
});

/* ------------------------------------------------------------------ *
 * Handler-level harness: the provider's own handlers, called directly.
 * ------------------------------------------------------------------ */

const pointerEvent = () => new MouseEvent('pointerdown');
const keyboardEvent = () => new KeyboardEvent('keydown', { code: 'Space' });

/**
 * A seam the provider did not register. Called rather than optional-chained: a
 * renamed prop would otherwise turn every negative assertion here into a vacuous
 * pass.
 */
function seam<T>(value: T | undefined, name: string): T {
  if (!value) { throw new Error('The provider registered no ' + name); }
  return value;
}

/** One of the provider's announcements, by name. */
const announce = (name: keyof NonNullable<typeof mockAnnouncements>) =>
  seam(mockAnnouncements?.[name], name + ' announcement');

/** The provider's collision gate, which the pointer-outside tests hand coordinates. */
const detect = () => seam(mockCollisionDetection, 'collisionDetection');

const dragStart = (cardId: string, activatorEvent: Event = pointerEvent()) =>
  act(() => {
    seam(mockHandlers.onDragStart, 'onDragStart')({ active: { id: cardId }, activatorEvent });
  });
const dragOver = (cardId: string, overId: string, activatorEvent: Event = pointerEvent()) =>
  act(() => {
    seam(mockHandlers.onDragOver, 'onDragOver')({ active: { id: cardId }, over: { id: overId }, activatorEvent });
  });
const dragEnd = (cardId: string, overId: string | null, activatorEvent: Event = pointerEvent()) =>
  act(() => {
    seam(mockHandlers.onDragEnd, 'onDragEnd')({
      active: { id: cardId },
      over: overId ? { id: overId } : null,
      activatorEvent,
    });
  });
const dragCancel = (activatorEvent: Event = pointerEvent()) =>
  act(() => seam(mockHandlers.onDragCancel, 'onDragCancel')({ activatorEvent }));

/** The over dnd-kit hands a handler for a deck row: its id, and nothing else. */
const overRow = (deckId: string) => ({ id: deckRowDroppableId(deckId) });

const dragEndDeck = (rowId: string, deckId: string | null, activatorEvent: Event = pointerEvent()) =>
  act(() => {
    seam(mockHandlers.onDragEnd, 'onDragEnd')({
      active: { id: rowId },
      over: deckId ? overRow(deckId) : null,
      activatorEvent,
    });
  });

/**
 * Let the focus attempts run. The retry chain is three animation frames deep, so
 * waiting on frames rather than a fixed delay keeps a late attempt from landing
 * in the next test when the machine is loaded.
 */
const settle = () =>
  act(async () => {
    await new Promise((resolve) => {
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            setTimeout(resolve, 50);
          })
        )
      );
    });
  });

const Preview = () => {
  const { previewDecks } = useDeckDragPreview();
  return (
    <div data-testid="preview">
      {previewDecks.map((entry) => entry.id + ':' + entry.cards.map((c) => c.id).join(',')).join(' | ')}
    </div>
  );
};
const preview = () => screen.getByTestId('preview').textContent;

/** The dragged card's own open state, wherever the preview put it. */
const OpenState = () => {
  const { previewDecks } = useDeckDragPreview();
  const dragged = previewDecks.flatMap((entry) => entry.cards).find((entry) => entry.id === 'A');
  return <div data-testid="open-state">{dragged ? String(dragged.editorOpen) : 'none'}</div>;
};
const openState = () => screen.getByTestId('open-state').textContent;

const renderDrag = (
  decks: Deck[],
  onCardMove = jest.fn<void, [CardMove]>(),
  extra?: React.ReactNode,
  // The provider requires the caller to own the collapse; most tests only care
  // about the local preview, so the default asks for nothing.
  onCardDragStart: (cardId: string) => void = () => undefined,
  onDeckMove = jest.fn<void, [DeckMove]>(),
) => {
  render(
    <DeckCardDragProvider
      decks={decks}
      onCardMove={onCardMove}
      onDeckMove={onDeckMove}
      onCardDragStart={onCardDragStart}
    >
      <Preview />
      {decks.map((entry) => (
        <DeckDropTarget
          key={entry.id}
          deckId={entry.id}
          isExpanded
          onRequestExpand={() => undefined}
        >
          {entry.id + ' header'}
        </DeckDropTarget>
      ))}
      {extra}
    </DeckCardDragProvider>,
  );
  return onCardMove;
};

/** The outline as the drag layer needs it: one sortable row per deck. */
const renderDeckDrag = (decks: Deck[]) => {
  const onCardMove = jest.fn<void, [CardMove]>();
  const onDeckMove = jest.fn<void, [DeckMove]>();
  render(
    <DeckCardDragProvider
      decks={decks}
      onCardMove={onCardMove}
      onDeckMove={onDeckMove}
      onCardDragStart={() => undefined}
    >
      <Preview />
      <DeckDragList deckIds={decks.map((entry) => entry.id)}>
        {decks.map((entry) => (
          <DeckDragRow key={entry.id} deckId={entry.id}>
            <DeckDragHandle deckName={entry.name} position={1} />
            <DeckDropTarget deckId={entry.id} isExpanded onRequestExpand={() => undefined}>
              {entry.name + ' header'}
            </DeckDropTarget>
          </DeckDragRow>
        ))}
      </DeckDragList>
    </DeckCardDragProvider>,
  );
  return { onCardMove, onDeckMove };
};

describe('the card drag handler', () => {
  beforeEach(() => {
    initializeMocks();
  });

  // After a cross-deck preview has re-parented the card, dnd-kit can report the
  // card itself as the target. The last real target is the drop; a same-deck
  // drag ending over itself has not moved, whatever it last hovered.
  it('commits the last real target once, even when the final over is the active card', () => {
    const decks = [deckOf('d1', ['A', 'B', 'C']), deckOf('d2', ['X', 'Y'])];
    const onCardMove = renderDrag(decks);

    dragStart('A');
    dragOver('A', 'Y');
    dragOver('A', 'A');
    dragEnd('A', 'A');

    expect(onCardMove).toHaveBeenCalledTimes(1);
    expect(onCardMove).toHaveBeenCalledWith({ cardId: 'A', toDeckId: 'd2', toIndex: 1 });

    onCardMove.mockClear();

    dragStart('A');
    dragOver('A', 'B');
    dragOver('A', 'C');
    dragOver('A', 'B');
    dragEnd('A', 'A');

    expect(onCardMove).not.toHaveBeenCalled();
    expect(preview()).toEqual('d1:A,B,C | d2:X,Y');
  });

  // The journey the browser takes when the pointer enters the deck by its
  // header: the first hover re-parents the card past the last row, the next
  // hovers walk the rows X and Y, and dnd-kit ends the drag over the active card
  // itself. The card is drawn in the slot past Y, so that slot is the drop; the
  // gap the rows recorded on the way there is not where the pointer ended.
  it('commits the end slot when a drag that entered by the header ends over the active card', () => {
    const decks = [deckOf('d1', ['A']), deckOf('d2', ['X', 'Y'])];
    const onCardMove = renderDrag(decks);

    dragStart('A');
    dragOver('A', 'deck:d2');
    expect(preview()).toEqual('d1: | d2:X,Y,A');

    dragOver('A', 'X');
    dragOver('A', 'Y');
    dragOver('A', 'A');
    dragEnd('A', 'A');

    expect(onCardMove).toHaveBeenCalledTimes(1);
    expect(onCardMove).toHaveBeenCalledWith({ cardId: 'A', toDeckId: 'd2', toIndex: 2 });
  });

  // The same end slot with a blank draft trailing the committed target deck: the
  // preview consumes the draft, but the drop's index counts the committed target
  // frame before the draft is removed, so 3 is past Y. Applying it lands A after Y.
  it('counts the end slot past a trailing blank draft in the committed target frame', () => {
    const draft = emptyCard();
    const decks = [deckOf('d1', ['A']), deck('d2', 'd2', [card('X'), card('Y'), draft])];
    const onCardMove = renderDrag(decks);

    dragStart('A');
    dragOver('A', 'deck:d2');
    expect(preview()).toEqual('d1: | d2:X,Y,A');

    dragOver('A', 'X');
    dragOver('A', 'Y');
    dragOver('A', 'A');
    dragEnd('A', 'A');

    expect(onCardMove).toHaveBeenCalledTimes(1);
    expect(onCardMove).toHaveBeenCalledWith({ cardId: 'A', toDeckId: 'd2', toIndex: 3 });
    // The committed deck kept its draft: only the preview copy lost it.
    expect(preview()).toEqual('d1:A | d2:X,Y,' + draft.id);
  });

  // The mirror journey: entering by the first row draws the card at the top, so
  // the rows walked afterwards record the end slot past Y - the deeper place,
  // not the drawn one. Ending over the active card lands in the slot the active
  // card is drawn in, which is first.
  it('commits the drawn first slot, not the last end slot, when a drag entered by the first row ends over the active card', () => {
    const decks = [deckOf('d1', ['A']), deckOf('d2', ['X', 'Y'])];
    const onCardMove = renderDrag(decks);

    dragStart('A');
    dragOver('A', 'X');
    expect(preview()).toEqual('d1: | d2:A,X,Y');

    dragOver('A', 'Y');
    dragOver('A', 'A');
    dragEnd('A', 'A');

    expect(onCardMove).toHaveBeenCalledTimes(1);
    expect(onCardMove).toHaveBeenCalledWith({ cardId: 'A', toDeckId: 'd2', toIndex: 0 });
  });

  // A pointer drop on the card's own deck header appends; for a keyboard drag
  // that header is not a destination at all, and the preview goes back to the
  // tree the drag started from.
  it('treats the card\'s own deck header as an append for a pointer and no move for a keyboard', async () => {
    const decks = [deckOf('d1', ['A', 'B', 'C']), deckOf('d2', ['X'])];
    const onCardMove = renderDrag(decks);

    dragStart('A');
    dragOver('A', 'deck:d1');
    dragEnd('A', 'deck:d1');
    expect(onCardMove).toHaveBeenCalledTimes(1);
    expect(onCardMove).toHaveBeenCalledWith({ cardId: 'A', toDeckId: 'd1', toIndex: 2 });

    onCardMove.mockClear();

    dragStart('A', keyboardEvent());
    dragOver('A', 'X', keyboardEvent());
    expect(preview()).toEqual('d1:B,C | d2:A,X');

    dragOver('A', 'deck:d1', keyboardEvent());
    expect(preview()).toEqual('d1:A,B,C | d2:X');
    dragEnd('A', 'deck:d1', keyboardEvent());
    expect(onCardMove).not.toHaveBeenCalled();
    expect(preview()).toEqual('d1:A,B,C | d2:X');

    // The keyboard drop ends with a focus attempt: let it land here, not in the
    // next test's DOM, where the same card row exists again.
    await settle();
  });

  // A pointer drag never had focus on the handle, so it must not take it (and
  // pop the handle's tooltip) when it ends or is cancelled.
  it('leaves focus alone when a pointer drag ends or is cancelled', async () => {
    const decks = [deckOf('d1', ['A'])];
    renderDrag(
      decks,
      jest.fn<void, [CardMove]>(),
      (
        <>
          <div data-dnd-id="A">
            <button type="button" data-drag-handle>handle</button>
          </div>
          <button type="button" data-testid="elsewhere">elsewhere</button>
        </>
      ),
    );
    const elsewhere = screen.getByTestId('elsewhere');
    const handle = screen.getByRole('button', { name: 'handle' });

    elsewhere.focus();
    dragStart('A');
    dragEnd('A', 'deck:d1');
    await settle();
    expect(elsewhere).toHaveFocus();
    expect(handle).not.toHaveFocus();

    elsewhere.focus();
    dragStart('A');
    dragCancel();
    await settle();
    expect(elsewhere).toHaveFocus();
    expect(handle).not.toHaveFocus();
  });

  // The card that moves is the real one, so an open card is collapsed into the
  // preview at drag start and the caller is told to collapse it in its state:
  // the row that travels is compact, and the drop leaves it collapsed.
  it('collapses an open card into the preview and asks the editor once', () => {
    const onCardDragStart = jest.fn<void, [string]>();
    renderDrag([deckOf('d1', ['A']), deckOf('d2', ['X', 'Y'])], undefined, <OpenState />, onCardDragStart);
    expect(openState()).toEqual('true');

    dragStart('A');

    expect(openState()).toEqual('false');
    expect(onCardDragStart).toHaveBeenCalledTimes(1);
    expect(onCardDragStart).toHaveBeenCalledWith('A');

    // The collapse follows the card into another deck, and hovering does not
    // ask the editor again.
    dragOver('A', 'Y');
    expect(preview()).toEqual('d1: | d2:X,A,Y');
    expect(openState()).toEqual('false');

    dragEnd('A', 'Y');
    expect(onCardDragStart).toHaveBeenCalledTimes(1);
  });

  // An already collapsed card is not the editor's to collapse again: a drag of
  // it must not write anything, and a cancel must leave it collapsed.
  it('leaves an already collapsed card alone and stays collapsed when cancelled', () => {
    const onCardDragStart = jest.fn<void, [string]>();
    const decks: Deck[] = [{ id: 'd1', name: 'd1', cards: [{ ...card('A'), editorOpen: false }] }];
    renderDrag(decks, undefined, <OpenState />, onCardDragStart);

    dragStart('A');
    expect(openState()).toEqual('false');
    expect(onCardDragStart).not.toHaveBeenCalled();

    dragCancel();
    expect(openState()).toEqual('false');
    expect(onCardDragStart).not.toHaveBeenCalled();
  });

  // A blank draft is a placeholder, not content: dragging one writes nothing and
  // the preview never takes it.
  it('refuses to drag the blank draft card', () => {
    const draft = emptyCard();
    const onCardMove = renderDrag([deckOf('d1', ['A']), { id: 'd2', name: 'd2', cards: [draft] }]);

    dragStart(draft.id);
    dragOver(draft.id, 'A');
    expect(preview()).toEqual('d1:A | d2:' + draft.id);

    dragEnd(draft.id, 'A');
    expect(onCardMove).not.toHaveBeenCalled();
  });

  // A deck holding only a draft is an empty deck with a placeholder: the card
  // lands at 0, the live region calls the deck empty rather than naming a
  // position the draft would shift, and the caller's draft survives.
  it('drops into a draft-only deck at index 0, announcing the empty deck', () => {
    const draft = emptyCard();
    const onCardMove = jest.fn<void, [CardMove]>();
    renderDrag(
      [deckOf('d1', ['A']), { id: 'd2', name: 'd2', cards: [draft] }],
      onCardMove,
      <DeckCardList deckId="d2" renderCard={() => null} />,
    );

    dragStart('A');
    dragOver('A', 'deck:d2');
    // The draft is dropped from the preview, not counted as a position.
    expect(preview()).toEqual('d1: | d2:A');
    expect(announce('onDragOver')({ active: { id: 'A' }, over: { id: 'deck:d2' } }))
      .toEqual('A moved over the empty deck d2.');

    dragEnd('A', 'deck:d2');

    expect(onCardMove).toHaveBeenCalledTimes(1);
    expect(onCardMove).toHaveBeenCalledWith({ cardId: 'A', toDeckId: 'd2', toIndex: 0 });
    expect(announce('onDragEnd')({ active: { id: 'A' } })).toEqual('Dropped A in the empty deck d2.');
    // Committed decks are never mutated: only the preview copy lost the draft.
    expect(preview()).toEqual('d1:A | d2:' + draft.id);
  });
});

// closestCorners has no distance limit, so without a gate a pointer released
// off the deck list still commits to the nearest row.
describe('releasing a pointer outside the deck list', () => {
  const outlineRect = {
    top: 0,
    right: 300,
    bottom: 100,
    left: 0,
    x: 0,
    y: 0,
    width: 300,
    height: 100,
    toJSON: () => ({}),
  } as DOMRect;

  // The gate measures the deck list, which the outline itself renders.
  const Outline = () => {
    const ref = React.useRef<HTMLElement>(null);
    React.useEffect(() => {
      if (ref.current) { ref.current.getBoundingClientRect = () => outlineRect; }
    }, []);
    return <section ref={ref} data-deck-outline="true" />;
  };

  const collisionArgs = (pointerCoordinates: { x: number; y: number; } | null) => ({
    active: { id: 'A' },
    collisionRect: outlineRect,
    droppableRects: new Map([['deck:d2', outlineRect]]),
    droppableContainers: [{ id: 'deck:d2' }],
    pointerCoordinates,
  });

  const nearest = [expect.objectContaining({ id: 'deck:d2' })];

  it('answers with no target outside the list, and counts its exact edges as inside', () => {
    renderDrag([deckOf('d1', ['A']), deckOf('d2', ['X'])], undefined, <Outline />);

    // The outline's own rect is the whole gate, with no margin: its edges are
    // inside, and a point past one is not - ten pixels is well inside the old slop.
    expect(detect()(collisionArgs({ x: 0, y: 0 }))).toEqual(nearest);
    expect(detect()(collisionArgs({ x: 300, y: 100 }))).toEqual(nearest);
    expect(detect()(collisionArgs({ x: 301, y: 50 }))).toEqual([]);
    expect(detect()(collisionArgs({ x: 310, y: 50 }))).toEqual([]);
    expect(detect()(collisionArgs({ x: 100, y: 101 }))).toEqual([]);
    expect(detect()(collisionArgs({ x: -1, y: 50 }))).toEqual([]);
    expect(detect()(collisionArgs({ x: 400, y: 400 }))).toEqual([]);
    // No pointer coordinates: the nearest droppable still wins, as it always did.
    expect(detect()(collisionArgs(null))).toEqual(nearest);
  });

  // Leaving and coming back is not a cancel: the last collision is the one that
  // counts, so a drop made after the pointer returns commits and announces the
  // drop it made.
  it('commits a drop made after the pointer leaves and comes back', () => {
    const onCardMove = renderDrag([deckOf('d1', ['A']), deckOf('d2', ['X'])], undefined, <Outline />);

    dragStart('A');
    expect(detect()(collisionArgs({ x: 400, y: 400 }))).toEqual([]);
    // Back inside: the nearest droppable is the target again.
    expect(detect()(collisionArgs({ x: 100, y: 50 }))).toEqual(nearest);
    dragOver('A', 'deck:d2');
    dragEnd('A', 'deck:d2');

    expect(onCardMove).toHaveBeenCalledTimes(1);
    expect(onCardMove).toHaveBeenCalledWith({ cardId: 'A', toDeckId: 'd2', toIndex: 1 });
    expect(announce('onDragEnd')({ active: { id: 'A' } })).toEqual('Dropped A at the end of d2.');
  });

  // A live cross-deck preview is not a commitment: a release off the list and a
  // cancel both put the tree back, commit nothing, and neither may fall back to
  // the last row the drag hovered.
  it('drops a live preview and commits nothing when the release lands outside or cancels', () => {
    const onCardMove = renderDrag([deckOf('d1', ['A', 'B']), deckOf('d2', ['X'])], undefined, <Outline />);

    dragStart('A');
    dragOver('A', 'X');
    expect(preview()).toEqual('d1:B | d2:A,X');

    // Released off the deck list: the hovered row is not the drop.
    detect()(collisionArgs({ x: 400, y: 400 }));
    dragEnd('A', null);

    expect(onCardMove).not.toHaveBeenCalled();
    expect(preview()).toEqual('d1:A,B | d2:X');
    expect(announce('onDragEnd')({ active: { id: 'A' } })).toEqual('Drag cancelled. A stayed in d1.');

    // Cancelled outright with the same preview live: same outcome.
    dragStart('A');
    dragOver('A', 'X');
    expect(preview()).toEqual('d1:B | d2:A,X');

    dragCancel();

    expect(onCardMove).not.toHaveBeenCalled();
    expect(preview()).toEqual('d1:A,B | d2:X');
  });
});

// A deck drag is the same machinery as a card drag, one kind over: the real row
// is what moves, and the stored order is what was dropped.
/**
 * A deck row's two boxes live on different elements: the wrapper is what moves,
 * while the row's droppable - and a card's deck target - is the header inside
 * it. The wrapper contains its header and cards, as the real row does; only
 * the heights are short.
 */
const deckRects = (withCards: boolean): Record<string, StubbedRect> => ({
  'deck-row:d1': [0, withCards ? 200 : 40],
  'deck:d1': [0, 40],
  ...(withCards ? { c1: [60, 100] } : {}),
  'deck-row:d2': [withCards ? 220 : 60, withCards ? 420 : 100],
  'deck:d2': [withCards ? 220 : 60, withCards ? 260 : 100],
  ...(withCards ? { c2: [280, 320] } : {}),
});

const deckDragDecks = () => [
  deck('d1', 'Cell Biology', [card('c1', 'Mitochondrion')]),
  deck('d2', 'Genetics', [card('c2', 'Allele')]),
];

describe('moving a deck', () => {
  beforeEach(() => {
    initializeMocks();
    restoreRects = undefined;
  });

  afterEach(() => {
    restoreRects?.();
  });

  it('reorders the decks with the keyboard and focuses the moved handle', async () => {
    const user = userEvent.setup();
    const onDeckCommit = jest.fn();
    useRects(deckRects(true));
    render(<Harness initialDecks={deckDragDecks()} initiallyOpen={['d1', 'd2']} onDeckCommit={onDeckCommit} />);

    // Enter starts a drag as well as Space.
    deckDragHandle('Cell Biology').focus();
    await user.keyboard('{Enter}');
    await waitFor(() =>
      expect(liveRegion()).toHaveTextContent('Picked up Cell Biology at position 1 of the deck list.')
    );

    // Arrows walk deck rows only: no card row is ever a step.
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(liveRegion()).toHaveTextContent('Cell Biology moved over position 2 of the deck list.'));

    await user.keyboard(' ');
    await waitFor(() => expect(committed()).toEqual('d2:c2 | d1:c1'));
    expect(onDeckCommit).toHaveBeenCalledTimes(1);
    expect(onDeckCommit).toHaveBeenCalledWith({ deckId: 'd1', toIndex: 1 });
    expect(liveRegion()).toHaveTextContent('Dropped Cell Biology at position 2 of the deck list.');
    // Names and positions only: no deck or card ids reach a screen reader.
    expect(liveRegion()).not.toHaveTextContent(/\bd1\b|\bd2\b|c1|c2/);
    await waitFor(() => expect(deckDragHandle('Cell Biology')).toHaveFocus());
  });

  // Only the handle starts a deck drag: a press on the row itself, name and
  // cards included, leaves the order alone.
  it('does not start a deck drag from the row itself', async () => {
    const user = userEvent.setup();
    const onDeckCommit = jest.fn();
    useRects(deckRects(true));
    render(<Harness initialDecks={deckDragDecks()} initiallyOpen={['d1', 'd2']} onDeckCommit={onDeckCommit} />);

    await user.pointer([
      { target: screen.getByText('Cell Biology'), keys: '[MouseLeft>]' },
      { target: screen.getByText('Cell Biology'), coords: { x: 400, y: 200 } },
    ]);
    expect(liveRegion()).not.toHaveTextContent('Picked up');
    await user.pointer({ keys: '[/MouseLeft]' });

    expect(onDeckCommit).not.toHaveBeenCalled();
    expect(committed()).toEqual('d1:c1 | d2:c2');
  });

  it('reorders the decks with the pointer, from the handle', async () => {
    const user = userEvent.setup();
    const onDeckCommit = jest.fn();
    useRects(deckRects(true));
    render(<Harness initialDecks={deckDragDecks()} initiallyOpen={['d1', 'd2']} onDeckCommit={onDeckCommit} />);

    const handle = deckDragHandle('Cell Biology');
    // Press on the handle and move past the sensor's 8px activation distance: the
    // first move only picks the row up.
    await user.pointer([
      { target: handle, keys: '[MouseLeft>]' },
      { target: handle, coords: { x: 400, y: 100 } },
    ]);
    await waitFor(() =>
      expect(liveRegion()).toHaveTextContent('Picked up Cell Biology at position 1 of the deck list.')
    );

    // The next move carries the real row onto the second one.
    await user.pointer([{ target: handle, coords: { x: 400, y: 200 } }]);
    await waitFor(() => expect(liveRegion()).toHaveTextContent('Cell Biology moved over position 2 of the deck list.'));
    // The real row is what travels, not a copy: it is marked and translated.
    expect(row('deck-row:d1')).toHaveAttribute('data-dnd-dragging', 'true');

    await user.pointer([{ keys: '[/MouseLeft]' }]);

    await waitFor(() => expect(committed()).toEqual('d2:c2 | d1:c1'));
    expect(onDeckCommit).toHaveBeenCalledTimes(1);
    expect(onDeckCommit).toHaveBeenCalledWith({ deckId: 'd1', toIndex: 1 });
  });

  // A deck with its cards open is a tall row - far taller than the gap it moves
  // to. It is aimed by its header, so one modest drag reaches the deck below,
  // instead of having to drag past the row's own height.
  it('reorders an expanded deck with a modest pointer move', async () => {
    const user = userEvent.setup();
    const onDeckCommit = jest.fn();
    // Deck 1 open: its row is 300px tall, its header and cards inside it.
    useRects({
      'deck-row:d1': [0, 300],
      'deck:d1': [10, 50],
      c1: [70, 110],
      c2: [130, 170],
      'deck-row:d2': [320, 620],
      'deck:d2': [330, 370],
    });
    render(
      <Harness
        initialDecks={[
          deck('d1', 'Cell Biology', [card('c1', 'Mitochondrion'), card('c2', 'Ribosome')]),
          deck('d2', 'Genetics'),
        ]}
        initiallyOpen={['d1', 'd2']}
        onDeckCommit={onDeckCommit}
      />,
    );
    expect(screen.getByText('Mitochondrion')).toBeInTheDocument();

    const handle = deckDragHandle('Cell Biology');
    await user.pointer([
      { target: handle, keys: '[MouseLeft>]' },
      { target: handle, coords: { x: 400, y: 100 } },
    ]);
    await waitFor(() =>
      expect(liveRegion()).toHaveTextContent('Picked up Cell Biology at position 1 of the deck list.')
    );

    // The header is 50px tall inside a 300px row: 130px of travel is well inside
    // the row, and already over Genetics.
    await user.pointer([{ target: handle, coords: { x: 400, y: 160 } }]);
    await waitFor(() => expect(liveRegion()).toHaveTextContent('Cell Biology moved over position 2 of the deck list.'));

    await user.pointer({ keys: '[/MouseLeft]' });

    await waitFor(() => expect(committed()).toEqual('d2: | d1:c1,c2'));
    expect(onDeckCommit).toHaveBeenCalledTimes(1);
    expect(onDeckCommit).toHaveBeenCalledWith({ deckId: 'd1', toIndex: 1 });
    // Only the deck order was written: no card content and no card order moved.
    expect(screen.getByText('Mitochondrion')).toBeInTheDocument();
    expect(screen.getByText('Ribosome')).toBeInTheDocument();
  });

  // Escape cancels a deck drag the way it cancels a card: nothing moves, the
  // order is untouched, the live region names the deck and the position it kept,
  // and the handle that started the drag gets focus back.
  it('cancels a deck drag, keeping the order, the announcement and the focus', async () => {
    const user = userEvent.setup();
    const onDeckCommit = jest.fn();
    useRects(deckRects(true));
    render(<Harness initialDecks={deckDragDecks()} initiallyOpen={['d1', 'd2']} onDeckCommit={onDeckCommit} />);

    act(() => deckDragHandle('Cell Biology').focus());
    await user.keyboard(' ');
    await waitFor(() =>
      expect(liveRegion()).toHaveTextContent('Picked up Cell Biology at position 1 of the deck list.')
    );
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(liveRegion()).toHaveTextContent('Cell Biology moved over position 2 of the deck list.'));

    await user.keyboard('{Escape}');

    await waitFor(() =>
      expect(liveRegion()).toHaveTextContent('Drag cancelled. Cell Biology stayed at position 1 of the deck list.')
    );
    expect(onDeckCommit).not.toHaveBeenCalled();
    expect(committed()).toEqual('d1:c1 | d2:c2');
    await waitFor(() => expect(deckDragHandle('Cell Biology')).toHaveFocus());
  });

  // A drop that changed nothing is announced as a plain drop: saying a position
  // would claim the deck moved. A release outside every row and a cancel write
  // nothing either, and a pointer cancel must not take focus for a drag that
  // never had it.
  it('reports no deck move for its own row, a release outside, or a cancel', async () => {
    const { onDeckMove } = renderDeckDrag([deckOf('d1', ['A']), deckOf('d2', ['X'])]);

    dragStart('deck-row:d2');
    dragEndDeck('deck-row:d2', 'd2');
    expect(announce('onDragEnd')({ active: { id: 'deck-row:d2' } })).toEqual('Dropped d2.');

    // Released with no row under it.
    dragStart('deck-row:d2');
    dragEndDeck('deck-row:d2', null);

    // Cancelled, from a pointer drag that never focused the handle.
    act(() => deckDragHandle('d1').focus());
    dragStart('deck-row:d2');
    dragCancel();

    expect(onDeckMove).not.toHaveBeenCalled();
    expect(preview()).toEqual('d1:A | d2:X');
    await settle();
    expect(deckDragHandle('d1')).toHaveFocus();
  });

  // Both kinds share one context, so the nearest droppable of the wrong kind is
  // not a target at all: a deck walks rows, a card walks cards and headers.
  it('filters collision candidates by the dragged kind', () => {
    renderDeckDrag([deckOf('d1', ['A']), deckOf('d2', ['X'])]);
    const rect = { top: 0, right: 300, bottom: 100, left: 0 };
    const containers = [
      { id: 'A', data: { current: { sortable: {} } } },
      { id: 'deck:d2', data: { current: { kind: 'deck', deckId: 'd2' } } },
      { id: deckRowDroppableId('d2'), data: { current: { kind: 'deck-row', deckId: 'd2' } } },
    ];
    const args = (activeId: string) => ({
      active: { id: activeId },
      collisionRect: rect,
      droppableRects: new Map(containers.map((container) => [container.id, rect])),
      droppableContainers: containers,
      pointerCoordinates: { x: 100, y: 50 },
    });

    expect(detect()(args('deck-row:d1')).map((collision: any) => collision.id))
      .toEqual([deckRowDroppableId('d2')]);
    expect(detect()(args('A')).map((collision: any) => collision.id))
      .toEqual(['A', 'deck:d2']);
  });

  // A deck row is not a card target, whatever the pointer says.
  it('refuses a card dropped on a deck row', () => {
    const onCardMove = jest.fn<void, [CardMove]>();
    renderDrag([deckOf('d1', ['A']), deckOf('d2', ['X'])], onCardMove);

    dragStart('A');
    dragEnd('A', deckRowDroppableId('d2'));

    expect(onCardMove).not.toHaveBeenCalled();
  });
});
