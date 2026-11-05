import React from 'react';
import { flushSync } from 'react-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  DndContext,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DroppableContainers,
  type KeyboardCoordinateGetter,
  type DragCancelEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type ScreenReaderInstructions,
} from '@dnd-kit/core';
import { CSS, isKeyboardEvent, useCombinedRefs } from '@dnd-kit/utilities';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Icon, IconButton, OverlayTrigger, Tooltip } from '@openedx/paragon';
import { DragIndicator } from '@openedx/paragon/icons';

import messages from '@src/editors/containers/GamesEditor/messages';
import { resolveCardDrop, type CardDropOver } from '@src/editors/containers/GamesEditor/data/cardDropTarget';
import {
  findCardLocation,
  isBlankCard,
  moveCardInDecks,
} from '@src/editors/containers/GamesEditor/data/gameTransitions';
import type {
  Card,
  CardDropTarget,
  Deck,
} from '@src/editors/containers/GamesEditor/types';

/**
 * Drag authoring for the deck outline, pointer and keyboard alike: every
 * dnd-kit call in the editor lives here, and callers render rows only. The card
 * that moves is the real one: no separate preview follows the pointer.
 *
 * A drag starts by collapsing the dragged card, in the local tree and through
 * the caller in the state it owns, so the drop leaves it collapsed.
 *
 * The authored decks do not change until the drop: no card content and no deck
 * order is written while dragging, and the one commit goes through the editor's
 * `moveCard` or `moveDeck` transition. The collapse is the only state a drag
 * writes before that, and it is UI-only. A local, immutable `previewDecks` tree
 * is what the outline renders meanwhile; a cancelled drag drops it, so the
 * committed view returns with the move unwritten.
 *
 * A deck is dragged by its own row, which moves as the real thing: the rows
 * between its old and new place shift to make room, and the order changes once,
 * on the drop. Deck rows therefore need no preview tree; they are one sortable
 * list whose items are the decks themselves.
 */

/** One committed card move. */
export interface CardMove {
  cardId: string;
  toDeckId: string;
  /** Insertion index in the target deck, in `moveCard`'s post-removal frame. */
  toIndex: number;
}

/** One committed deck reorder: the position the deck ends up in. */
export interface DeckMove {
  deckId: string;
  toIndex: number;
}

const DECK_ID_PREFIX = 'deck:';
/**
 * Deck rows sort the decks and take deck drops; they are namespaced apart from
 * `deck:` so a row can never be read as a card's deck header.
 */
const DECK_ROW_ID_PREFIX = 'deck-row:';

/** True when the point sits inside the rectangle, its own edges included. */
const isPointWithin = (
  point: { x: number; y: number; },
  rect: { top: number; right: number; bottom: number; left: number; },
) => (
  point.x >= rect.left
  && point.x <= rect.right
  && point.y >= rect.top
  && point.y <= rect.bottom
);

/** Namespaced so a deck droppable id can never be a card id. */
const deckDroppableId = (deckId: string) => DECK_ID_PREFIX + deckId;

/** The sortable row of a deck, the one thing a deck drag moves. */
export const deckRowDroppableId = (deckId: string) => DECK_ROW_ID_PREFIX + deckId;

const isDeckRowId = (id: string) => id.startsWith(DECK_ROW_ID_PREFIX);

/** The deck a row id belongs to. */
const deckIdOfRow = (rowId: string) => rowId.slice(DECK_ROW_ID_PREFIX.length);

/**
 * The droppables one kind of drag may reach: a deck drag sees deck rows only, a
 * card drag sees cards and deck headers only. The pointer and the keyboard are
 * narrowed by the same rule, so an arrow can never reach what the pointer
 * could not, and a card released off the deck list still cancels.
 */
const containersOfKind = (
  containers: DroppableContainers,
  deckDrag: boolean,
  activeId: string,
): DroppableContainers => {
  const onlyKind = (container: { id: string | number; }) => isDeckRowId(String(container.id)) === deckDrag;
  const filtered = new Map(
    [...containers].filter(([id]) => isDeckRowId(String(id)) === deckDrag),
  ) as unknown as DroppableContainers;
  // The stock getter reads the map's own ids and containers, and this list;
  // nothing else on the map is touched. The dragged item is not a destination,
  // so it is left out of the list the arrows aim at.
  filtered.getEnabled = () =>
    containers.getEnabled().filter((container) => (
      onlyKind(container) && String(container.id) !== activeId
    ));
  return filtered;
};

/** `sortableKeyboardCoordinates` over the dragged item's own kind of droppable. */
const kindAwareCoordinates: KeyboardCoordinateGetter = (event, args) =>
  sortableKeyboardCoordinates(event, {
    ...args,
    context: {
      ...args.context,
      droppableContainers: containersOfKind(
        args.context.droppableContainers,
        isDeckRowId(String(args.active)),
        String(args.active),
      ),
    },
  });

/**
 * The dragged card's own deck header is not a destination while dragging: it
 * means "still here". One helper so the drag, the drop and the announcement
 * cannot disagree. An empty deck has no drop zone of its own: its header is
 * the target, whether it holds no cards or only a blank draft.
 */
const isSourceDeckTarget = (overId: string, sourceDeckId: string | null | undefined) =>
  sourceDeckId != null && overId === deckDroppableId(sourceDeckId);

/** Typed targets: the resolver never parses a droppable id. */
const targetsOf = (decks: Deck[]): Map<string, CardDropOver> => {
  const targets = new Map<string, CardDropOver>();
  decks.forEach((deck) => {
    deck.cards.forEach((card) => {
      targets.set(card.id, { kind: 'card', deckId: deck.id, cardId: card.id });
    });
    targets.set(deckDroppableId(deck.id), { kind: 'deck', deckId: deck.id });
  });
  return targets;
};

/** A human description of one drop target, for the screen-reader announcements. */
type DropLabel =
  | { kind: 'position'; position: number; deckName: string; }
  | { kind: 'end'; deckName: string; }
  | { kind: 'empty'; deckName: string; };

/**
 * Names a droppable by what an author sees. Positions come from the preview
 * tree, which is what is on screen while dragging; deck names come from the
 * committed decks. Ids are never part of the result.
 */
const labelTarget = (overId: string, decks: Deck[], preview: Deck[]): DropLabel | null => {
  for (const deck of decks) {
    const previewDeck = preview.find((candidate) => candidate.id === deck.id);
    const cards = previewDeck?.cards ?? deck.cards;
    if (overId === deckDroppableId(deck.id)) {
      // Emptiness is the committed deck's, as it is for the drop announcement:
      // the preview already holds the card, by which measure no deck is empty.
      return deck.cards.every(isBlankCard)
        ? { kind: 'empty', deckName: deck.name }
        : { kind: 'end', deckName: deck.name };
    }
    const position = cards.findIndex((card) => card.id === overId);
    if (position >= 0) {
      return { kind: 'position', position: position + 1, deckName: deck.name };
    }
  }
  return null;
};

/** What to call a card: its text, never its id. */
const cardLabelOf = (cardId: string, decks: Deck[], fallback: string): string => {
  const at = findCardLocation(decks, cardId);
  return at?.deck.cards[at.index].term.trim() || fallback;
};

/** The deck a card is in, by name. */
const deckLabelOf = (cardId: string, decks: Deck[], fallback: string): string =>
  findCardLocation(decks, cardId)?.deck.name || fallback;

/**
 * What `moveCardInDecks` makes of a drop target: the decks after it, and the
 * card's position among them, which is what an announcement names. That
 * transition owns the clamping and the blank-draft rules, so this adds none of
 * its own. Nothing moved returns the same decks array, which is how callers
 * detect "nothing to render differently", and -1 comes back only for a move
 * that was refused.
 */
const moveResult = (decks: Deck[], cardId: string, target: CardDropTarget) => moveCardInDecks(decks, cardId, target);

interface DragPreview {
  /** The decks to render: the preview while dragging, the committed ones after. */
  previewDecks: Deck[];
  /** The row being dragged - a card id or a deck row id - so it can be marked. */
  activeDragId: string | null;
}

const DeckDragContext = React.createContext<DragPreview>({
  previewDecks: [],
  activeDragId: null,
});

/** The decks to render and the card being dragged, for rows inside the provider. */
export const useDeckDragPreview = () => React.useContext(DeckDragContext);

interface DeckCardDragProviderProps {
  /** Committed decks. Not mutated, and never written to during a drag. */
  decks: Deck[];
  /** Called once, on a valid drop. The caller applies `moveCard`. */
  onCardMove: (move: CardMove) => void;
  /** Called once, when a deck is dropped in another position. */
  onDeckMove: (move: DeckMove) => void;
  /**
   * Called when a drag starts on an open card. Required: the caller collapses
   * that card in the state it owns, which is what keeps it collapsed after the
   * drop. Called at most once per drag.
   */
  onCardDragStart: (cardId: string) => void;
  children: React.ReactNode;
}

/**
 * The one dnd-kit context for the whole deck outline: every deck body is a
 * `SortableContext` inside it, and every deck header is a droppable.
 */
export const DeckCardDragProvider = ({
  decks,
  onCardMove,
  onDeckMove,
  onCardDragStart,
  children,
}: DeckCardDragProviderProps) => {
  const intl = useIntl();
  const [previewDecks, setPreviewDecks] = React.useState<Deck[] | null>(null);
  // The droppable id being dragged: a card id or a `deck-row:` id.
  const [activeDragId, setActiveDragId] = React.useState<string | null>(null);
  // The latest preview, read by handlers: several drag-over events can arrive
  // before React commits the state, and each must build on the last.
  const previewRef = React.useRef<Deck[] | null>(null);
  // The tree the drag started from: the committed decks with the dragged card
  // collapsed. Restoring it is what a no-move drag looks like on screen.
  const dragStartDecksRef = React.useRef<Deck[] | null>(null);
  // The latest committed decks, for the announcement callbacks. Reading the prop
  // directly would rebuild the announcements - and re-register the live-region
  // listener - on every keystroke in the editor.
  const decksRef = React.useRef(decks);
  React.useEffect(() => {
    decksRef.current = decks;
  }, [decks]);
  // The row being dragged, for the cancel handler, which runs after the state
  // is gone. The drop announcement is built before the preview is dropped,
  // because the live region reads it after this handler returns.
  const activeDragIdRef = React.useRef<string | null>(null);
  const dropAnnouncementRef = React.useRef<string | null>(null);
  // The hovered target and the 1-based position it will put the card in. The
  // live region is read after this handler has run, by which time the preview
  // already holds the card, so the hovered row's own index is a position past
  // the gap: the announcement has to come from the drop, not from the row.
  const hoverRef = React.useRef<{ overId: string; position: number; } | null>(null);
  // Set by the collision gate below: the pointer left the deck list, so the
  // release is a cancellation rather than a drop with nothing to do.
  const pointerOutsideRef = React.useRef(false);

  // Pointer events cover mouse, pen and touch; a small distance keeps a click
  // on the handle from starting a drag. A separate TouchSensor would compete
  // with this one for the same touch gesture.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    // Arrows move to the next droppable of the dragged item's own kind, in that
    // direction: a card walks cards and deck headers, a deck walks deck rows.
    useSensor(KeyboardSensor, { coordinateGetter: kindAwareCoordinates }),
  );

  const reset = React.useCallback(() => {
    previewRef.current = null;
    dragStartDecksRef.current = null;
    hoverRef.current = null;
    pointerOutsideRef.current = false;
    activeDragIdRef.current = null;
    setPreviewDecks(null);
    setActiveDragId(null);
  }, []);

  // Focus follows the row after a commit or a cancel. A moved card is rendered
  // again (possibly in another deck) and a reordered deck row moves, so the old
  // activator node is gone: look the new row up by its data attribute and wait
  // for React to have rendered it.
  const focusDragHandle = React.useCallback((dragId: string) => {
    const attempt = (remaining: number) => {
      const row = Array.from(document.querySelectorAll<HTMLElement>('[data-dnd-id]'))
        .find((element) => element.dataset.dndId === dragId);
      const handle = row?.querySelector<HTMLElement>('[data-drag-handle]');
      if (handle) {
        handle.focus();
        return;
      }
      if (remaining > 0) {
        requestAnimationFrame(() => attempt(remaining - 1));
        return;
      }
      // The handle is gone (a target that never opened, or a slower update):
      // keep keyboard users inside the outline instead of on `<body>`.
      document.querySelector<HTMLElement>('[data-deck-outline]')?.focus();
    };
    requestAnimationFrame(() => attempt(2));
  }, []);

  // Escape belongs to the drag while one is active. The editor's modal also
  // listens for Escape on the document and would close the whole editor,
  // whichever order the two listeners were registered in. A capture listener
  // runs before every bubble listener on the document, and marking the event
  // handled is all the modal checks. preventDefault only: the event still has
  // to reach dnd-kit, which cancels the drag and announces it.
  React.useEffect(() => {
    if (!activeDragId) { return undefined; }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [activeDragId]);

  // dnd-kit's closestCorners always answers with the nearest droppable, however
  // far away it is, so a pointer released off the deck list would still commit
  // a move. Only the pointer is gated: a keyboard drag has no pointer
  // coordinates, and every hover inside the list is left to closestCorners, so
  // hovering a deck header keeps behaving exactly as it did.
  const detectCollision = React.useCallback<CollisionDetection>((args) => {
    const pointer = args.pointerCoordinates;
    if (pointer) {
      const outline = document.querySelector<HTMLElement>('[data-deck-outline]');
      if (outline && !isPointWithin(pointer, outline.getBoundingClientRect())) {
        pointerOutsideRef.current = true;
        return [];
      }
    }
    pointerOutsideRef.current = false;
    // A deck drag only ever lands on a deck row, a card drag never does: the
    // two id spaces share one context, so the nearest droppable of the wrong
    // kind is not a target at all.
    return closestCorners({
      ...args,
      droppableContainers: args.droppableContainers.filter(
        (container) => isDeckRowId(String(container.id)) === isDeckRowId(String(args.active.id)),
      ),
    });
  }, []);

  /** What every drag writes before it moves: the row being dragged, nothing else. */
  const beginDrag = (dragId: string) => {
    dropAnnouncementRef.current = null;
    activeDragIdRef.current = dragId;
    hoverRef.current = null;
    setActiveDragId(dragId);
  };

  const handleDragStart = ({ active }: DragStartEvent) => {
    const dragId = String(active.id);
    if (isDeckRowId(dragId)) {
      // A deck drag writes nothing before the drop: the real row is what moves,
      // and the order is the caller's to change once.
      if (decks.some((deck) => deckRowDroppableId(deck.id) === dragId)) { beginDrag(dragId); }
      return;
    }
    const at = findCardLocation(decks, dragId);
    if (!at) { return; }
    const card = at.deck.cards[at.index];
    beginDrag(dragId);
    // An open card would drag as a tall form; collapsed, it is the compact card
    // the author picked up. The caller persists the same collapse, so the drop
    // leaves it closed.
    const startDecks = card.editorOpen
      ? decks.map((deck) => ({
        ...deck,
        cards: deck.cards.map((entry) => (entry.id === dragId ? { ...entry, editorOpen: false } : entry)),
      }))
      : decks;
    dragStartDecksRef.current = startDecks;
    previewRef.current = startDecks;
    setPreviewDecks(startDecks);
    if (card.editorOpen) { onCardDragStart(dragId); }
  };

  /**
   * A preview index in the committed frame `moveCard` takes. A card entering a
   * deck drops that deck's blank draft from the preview, so every preview index
   * at or past the draft's committed place moves up one. A deck whose draft is
   * still drawn - matched by id, not by any blank - needs no conversion.
   */
  const committedIndexOf = (deckId: string, index: number): number => {
    const committedDeck = decks.find((deck) => deck.id === deckId);
    const previewDeck = previewRef.current?.find((deck) => deck.id === deckId);
    if (!committedDeck || !previewDeck) { return index; }
    const draft = committedDeck.cards.findIndex(isBlankCard);
    if (draft < 0) { return index; }
    const draftId = committedDeck.cards[draft].id;
    if (previewDeck.cards.some((card) => card.id === draftId)) { return index; }
    return draft <= index ? index + 1 : index;
  };

  /**
   * The move the preview itself draws the card in: the slot it holds there. With
   * no row under the drag no gap is drawn, so that slot is the drop.
   */
  const drawnSlotMove = (cardId: string): CardMove | null => {
    const committedAt = findCardLocation(decks, cardId);
    const drawnAt = previewRef.current ? findCardLocation(previewRef.current, cardId) : undefined;
    if (!committedAt || !drawnAt) { return null; }
    if (drawnAt.deck.id === committedAt.deck.id && drawnAt.index === committedAt.index) { return null; }
    return {
      cardId,
      toDeckId: drawnAt.deck.id,
      toIndex: committedIndexOf(drawnAt.deck.id, drawnAt.index),
    };
  };

  /**
   * The move a drop on `overId` really makes, in the committed frame `moveCard`
   * takes. The preview is the tree on screen, so its rows are the ones hovered;
   * a move it draws is converted from its frame. A move it refuses - the card's
   * own header, a header append within the card's deck - falls back to the
   * committed decks, which is already that frame.
   */
  const resolveDrawnMove = (cardId: string, overId: string): CardMove | null => {
    if (overId === cardId) { return drawnSlotMove(cardId); }
    const preview = previewRef.current;
    const previewTarget = preview ? targetsOf(preview).get(overId) : undefined;
    const drawn = preview && previewTarget ? resolveCardDrop(preview, cardId, previewTarget) : null;
    if (drawn) {
      return { cardId, toDeckId: drawn.deckId, toIndex: committedIndexOf(drawn.deckId, drawn.index) };
    }
    const committedTarget = targetsOf(decks).get(overId);
    const committed = committedTarget ? resolveCardDrop(decks, cardId, committedTarget) : null;
    return committed ? { cardId, toDeckId: committed.deckId, toIndex: committed.index } : null;
  };

  const handleDragOver = ({ active, over, activatorEvent }: DragOverEvent) => {
    if (!over) { return; }
    // A deck's rows are drawn in committed order and moved by their own
    // transforms, so there is no preview to build: the drop computes the move.
    if (isDeckRowId(String(active.id))) { return; }
    const cardId = String(active.id);
    const overId = String(over.id);
    const sourceDeckId = findCardLocation(decks, cardId)?.deck.id;
    // Keyboard arrows reach the header above the first row. For a keyboard drag
    // that is not a destination: moving the card to the end for an ArrowUp that
    // never left the deck would be a trap. A pointer drop there still appends,
    // which is the resolver's own header behaviour.
    if (isKeyboardEvent(activatorEvent) && isSourceDeckTarget(overId, sourceDeckId)) {
      // A cross-deck preview may still be on screen when the arrow comes back:
      // show the tree the drag started from and drop the stale target, so the
      // screen agrees with the no-op the drop will be.
      const startDecks = dragStartDecksRef.current ?? decks;
      if (previewRef.current && previewRef.current !== startDecks) {
        previewRef.current = startDecks;
        setPreviewDecks(startDecks);
      }
      hoverRef.current = null;
      return;
    }
    // The hovered position is the landing the drop will report.
    const drawnMove = resolveDrawnMove(cardId, overId);
    hoverRef.current = drawnMove
      ? {
        overId,
        position: moveResult(decks, cardId, { deckId: drawnMove.toDeckId, index: drawnMove.toIndex }).index + 1,
      }
      : null;
    const preview = previewRef.current;
    if (!preview) { return; }
    const target = targetsOf(preview).get(overId);
    const move = target ? resolveCardDrop(preview, cardId, target) : null;
    if (!move) { return; }
    // Only a cross-deck move changes the preview: within one deck the card
    // stays in place and the sorting strategy draws the gap. Reordering the
    // preview there would double the displacement.
    if (findCardLocation(preview, cardId)?.deck.id === move.deckId) { return; }
    const next = moveResult(preview, cardId, move).decks;
    if (next === preview) { return; }
    previewRef.current = next;
    setPreviewDecks(next);
  };

  const handleDragEnd = ({ active, over, activatorEvent }: DragEndEvent) => {
    const dragId = String(active.id);
    const keyboardDrag = isKeyboardEvent(activatorEvent);
    if (isDeckRowId(dragId)) {
      const deck = decks.find((entry) => deckRowDroppableId(entry.id) === dragId);
      if (!deck) {
        reset();
        return;
      }
      // Only a deck row is a destination: the id says so on its own, without
      // trusting whatever data a droppable happens to carry.
      const overId = over ? String(over.id) : '';
      const targetDeckId = isDeckRowId(overId) ? deckIdOfRow(overId) : null;
      const from = decks.findIndex((entry) => entry.id === deck.id);
      const to = targetDeckId ? decks.findIndex((entry) => entry.id === targetDeckId) : -1;
      // A drop on the row the deck already has is no move: the order only
      // changes when the row lands somewhere else.
      const deckMove: DeckMove | null = to >= 0 && to !== from ? { deckId: deck.id, toIndex: to } : null;
      const deckName = deck.name.trim() || intl.formatMessage(messages.dragUnknownDeck);
      // The live region reads this after this handler returns.
      dropAnnouncementRef.current = !deckMove && pointerOutsideRef.current
        ? intl.formatMessage(messages.dragDeckCancelled, { deckName, position: from + 1 })
        : deckMove
        ? intl.formatMessage(messages.dragDeckDroppedAtPosition, { deckName, position: deckMove.toIndex + 1 })
        : intl.formatMessage(messages.dragDeckDroppedNowhere, { deckName });
      reset();
      if (deckMove) { onDeckMove(deckMove); }
      if (keyboardDrag) { focusDragHandle(deckRowDroppableId(deck.id)); }
      return;
    }
    const cardId = dragId;
    const overId = over ? String(over.id) : null;
    // A keyboard drop on the card's own header is no move; a pointer drop there
    // is still the append. Every other target, the active card included, goes
    // through the same resolver.
    const ownHeader = overId != null && keyboardDrag
      && isSourceDeckTarget(overId, findCardLocation(decks, cardId)?.deck.id);
    const move = overId && !ownHeader ? resolveDrawnMove(cardId, overId) : null;
    // The live region reads this after this handler returns, so name the drop
    // while the preview is still here.
    const landing = move ? moveResult(decks, cardId, { deckId: move.toDeckId, index: move.toIndex }).index : -1;
    // A pointer that left the deck list cancels: say what a cancel says, not
    // what a drop that found nothing to do says.
    dropAnnouncementRef.current = !move && pointerOutsideRef.current
      ? intl.formatMessage(messages.dragCancelled, {
        cardName: cardNameOf(cardId),
        deckName: deckLabelOf(cardId, decksRef.current, intl.formatMessage(messages.dragUnknownDeck)),
      })
      : dropMessage(cardNameOf(cardId), move, landing, previewRef.current ?? decks);
    // A null/outside over cancels: nothing to commit.
    reset();
    if (move) { onCardMove(move); }
    // Only a keyboard drag had focus on the handle to begin with; a pointer or
    // touch drop must not move focus (or pop the handle's tooltip).
    if (keyboardDrag) { focusDragHandle(dragId); }
  };

  const handleDragCancel = ({ activatorEvent }: DragCancelEvent) => {
    const dragId = activeDragIdRef.current;
    reset();
    if (dragId && isKeyboardEvent(activatorEvent)) { focusDragHandle(dragId); }
  };

  // Every announcement uses visible names and positions, never ids: dnd-kit's
  // defaults announce raw usage keys, which mean nothing to an author.
  // These read the latest decks through a ref, so the announcements object
  // stays the same while the author types and the live-region listener is not
  // re-registered. A locale change still rebuilds them (the `intl` dep).
  const cardNameOf = React.useCallback(
    (cardId: string) => cardLabelOf(cardId, decksRef.current, intl.formatMessage(messages.dragUnknownCard)),
    [intl],
  );
  const deckNameOf = React.useCallback(
    (cardId: string) => deckLabelOf(cardId, decksRef.current, intl.formatMessage(messages.dragUnknownDeck)),
    [intl],
  );
  // A deck row is named by its own deck, not by a card in it, and its position
  // is its place in the outline: the two things a deck announcement may say.
  const deckRowName = React.useCallback(
    (rowId: string) =>
      decksRef.current.find((deck) => deck.id === deckIdOfRow(rowId))?.name.trim()
      || intl.formatMessage(messages.dragUnknownDeck),
    [intl],
  );
  const deckRowPosition = React.useCallback(
    (rowId: string) => decksRef.current.findIndex((deck) => deck.id === deckIdOfRow(rowId)) + 1,
    [],
  );
  const overMessage = React.useCallback((cardId: string, overId: string | null) => {
    const cardName = cardNameOf(cardId);
    const decksNow = decksRef.current;
    const sourceDeckId = findCardLocation(decksNow, cardId)?.deck.id;
    if (overId && isSourceDeckTarget(overId, sourceDeckId)) {
      // Not a destination: the card is still in this deck.
      return undefined;
    }
    const label = overId ? labelTarget(overId, decksNow, previewRef.current ?? decksNow) : null;
    if (!label) { return intl.formatMessage(messages.dragOverNothing, { cardName }); }
    if (label.kind === 'position') {
      const hovered = hoverRef.current;
      return intl.formatMessage(messages.dragOverPosition, {
        cardName,
        // Where the drop will put it; the row's own index is only a fallback.
        position: hovered?.overId === overId ? hovered.position : label.position,
        deckName: label.deckName,
      });
    }
    if (label.kind === 'end') {
      return intl.formatMessage(messages.dragOverEnd, { cardName, deckName: label.deckName });
    }
    return intl.formatMessage(messages.dragOverEmptyDeck, { cardName, deckName: label.deckName });
  }, [cardNameOf, intl]);

  const dropMessage = React.useCallback((
    cardName: string,
    move: CardMove | null,
    landing: number,
    preview: Deck[],
  ) => {
    if (!move) { return intl.formatMessage(messages.dragDroppedNowhere, { cardName }); }
    const deck = decksRef.current.find((entry) => entry.id === move.toDeckId);
    const deckName = deck?.name || intl.formatMessage(messages.dragUnknownDeck);
    if (!deck || deck.cards.every(isBlankCard)) {
      return intl.formatMessage(messages.dragDroppedInEmptyDeck, { cardName, deckName });
    }
    const cards = preview.find((entry) => entry.id === move.toDeckId)?.cards ?? deck.cards;
    // `landing` is where the card now sits, so the last real position is the end.
    if (landing + 1 >= cards.length) {
      return intl.formatMessage(messages.dragDroppedAtEnd, { cardName, deckName });
    }
    return intl.formatMessage(messages.dragDroppedAtPosition, {
      cardName,
      position: landing + 1,
      deckName,
    });
  }, [intl]);

  const announcements = React.useMemo<Announcements>(() => ({
    onDragStart: ({ active }) => {
      const dragId = String(active.id);
      if (isDeckRowId(dragId)) {
        return intl.formatMessage(messages.dragDeckPickedUp, {
          deckName: deckRowName(dragId),
          position: deckRowPosition(dragId),
        });
      }
      return intl.formatMessage(messages.dragPickedUp, {
        cardName: cardNameOf(dragId),
        deckName: deckNameOf(dragId),
      });
    },
    onDragOver: ({ active, over }) => {
      const dragId = String(active.id);
      if (isDeckRowId(dragId)) {
        // The dragged row is its own first target, and it is not a destination:
        // say nothing and leave the pick-up announcement in place.
        const overId = over ? String(over.id) : '';
        if (!isDeckRowId(overId) || overId === dragId) { return undefined; }
        // The hovered row's own place is where the deck lands: no preview moves
        // the rows, so nothing is measured past a gap.
        const position = decksRef.current.findIndex((deck) => deck.id === deckIdOfRow(overId)) + 1;
        if (position < 1) { return undefined; }
        return intl.formatMessage(messages.dragDeckOverPosition, { deckName: deckRowName(dragId), position });
      }
      // Hovering the dragged card itself is not a destination: say nothing and
      // leave the pick-up announcement in place.
      return over && String(over.id) === dragId
        ? undefined
        : overMessage(dragId, over ? String(over.id) : null);
    },
    // Built in handleDragEnd, before the preview is dropped.
    onDragEnd: ({ active }) => {
      const dragId = String(active.id);
      if (dropAnnouncementRef.current) { return dropAnnouncementRef.current; }
      return isDeckRowId(dragId)
        ? intl.formatMessage(messages.dragDeckDroppedAtPosition, {
          deckName: deckRowName(dragId),
          position: deckRowPosition(dragId),
        })
        : intl.formatMessage(messages.dragDroppedNowhere, { cardName: cardNameOf(dragId) });
    },
    onDragCancel: ({ active }) => {
      const dragId = String(active.id);
      if (isDeckRowId(dragId)) {
        return intl.formatMessage(messages.dragDeckCancelled, {
          deckName: deckRowName(dragId),
          position: deckRowPosition(dragId),
        });
      }
      return intl.formatMessage(messages.dragCancelled, {
        cardName: cardNameOf(dragId),
        deckName: deckNameOf(dragId),
      });
    },
  }), [cardNameOf, deckNameOf, deckRowName, deckRowPosition, intl, overMessage]);

  const screenReaderInstructions = React.useMemo<ScreenReaderInstructions>(() => ({
    draggable: intl.formatMessage(messages.dragScreenReaderInstructions),
  }), [intl]);

  const value = React.useMemo<DragPreview>(
    () => ({ previewDecks: previewDecks ?? decks, activeDragId }),
    [previewDecks, decks, activeDragId],
  );

  return (
    <DeckDragContext.Provider value={value}>
      <DndContext
        sensors={sensors}
        // The rows and headers are the only droppables, so stock corners works.
        collisionDetection={detectCollision}
        modifiers={[restrictToVerticalAxis]}
        // A collapsed deck expanded mid-drag must be measured for arrows and
        // for the pointer to reach its rows.
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        // Our own announcements name cards and decks; our own focus handling puts
        // the caret back on the moved card's handle, which dnd-kit cannot do
        // once the row has been re-rendered in another deck.
        accessibility={{ announcements, screenReaderInstructions, restoreFocus: false }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        {children}
      </DndContext>
    </DeckDragContext.Provider>
  );
};

/**
 * What a deck row hands its parts: the handle that starts the drag, and the
 * header element the row's droppable is measured on.
 */
type SortableResult = ReturnType<typeof useSortable>;

interface DeckRowDrag {
  disabled: boolean;
  /** Attached to the row's header, so a deck aims by its header, not its body. */
  droppableRef: (node: HTMLElement | null) => void;
  handleRef: SortableResult['setActivatorNodeRef'];
  handleAttributes: SortableResult['attributes'];
  handleListeners: SortableResult['listeners'];
}

const DeckRowDragContext = React.createContext<DeckRowDrag | null>(null);

/** A ref that ignores its node, for a header no DeckDragRow wraps. */
const ignoreNode = () => undefined;

/**
 * A deck header as a drop target: the deck's only target when it has no card
 * rows. Hovering a collapsed deck asks the outline to open it; the request is
 * made once per hover so it cannot loop.
 *
 * The header also carries the deck row's own droppable box: a row can be far
 * taller than the viewport once its cards are open, and a droppable that tall
 * would answer as its own target for the whole gesture, so one modest move
 * would never reach the deck below. The row still drags as one.
 */
export const DeckDropTarget = ({
  deckId,
  isExpanded,
  onRequestExpand,
  children,
}: {
  deckId: string;
  isExpanded: boolean;
  onRequestExpand: () => void;
  children: React.ReactNode;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: deckDroppableId(deckId),
    data: { kind: 'deck', deckId },
  });
  // Two droppables over one box: this deck's, for a dropped card, and the
  // row's, for a dragged deck.
  const row = React.useContext(DeckRowDragContext);
  const headerRef = useCombinedRefs<HTMLElement | null>(setNodeRef, row?.droppableRef ?? ignoreNode);
  const requestedRef = React.useRef(false);

  React.useEffect(() => {
    if (!isOver) {
      requestedRef.current = false;
      return;
    }
    if (isExpanded || requestedRef.current) { return; }
    requestedRef.current = true;
    onRequestExpand();
  }, [isOver, isExpanded, onRequestExpand]);

  return (
    <div
      ref={headerRef}
      data-dnd-id={deckDroppableId(deckId)}
      className={isOver ? 'deck-outline-drop-active' : undefined}
    >
      {children}
    </div>
  );
};

/**
 * The card rows of one deck: a `SortableContext` whose items come from the
 * preview tree, so a card moved here by a drag-over renders in this body.
 * The dragged row is the real card, collapsed and moved by `useSortable`; it
 * carries `data-dnd-dragging`, the one marker a drag in flight leaves behind.
 */
export const DeckCardList = ({
  deckId,
  renderCard,
}: {
  deckId: string;
  renderCard: (deck: Deck, card: Card, index: number) => React.ReactNode;
}) => {
  const { previewDecks, activeDragId } = useDeckDragPreview();
  const deck = previewDecks.find((candidate) => candidate.id === deckId);
  if (!deck) { return null; }
  return (
    <SortableContext
      id={deckId}
      items={deck.cards.map((card) => card.id)}
      strategy={verticalListSortingStrategy}
    >
      {deck.cards.map((card, index) => (
        <div
          key={card.id}
          data-dnd-id={card.id}
          // The only marker a drag in flight leaves behind, for tests and cleanup.
          data-dnd-dragging={activeDragId === card.id ? 'true' : undefined}
        >
          {renderCard(deck, card, index)}
        </div>
      ))}
    </SortableContext>
  );
};

/**
 * The deck rows as one sortable list. Each row is the real deck - header and
 * cards together - so a drag moves the row itself and the rows between its old
 * and new place shift to make room. Nothing is reordered until the drop.
 */
export const DeckDragList = ({
  deckIds,
  children,
}: {
  deckIds: string[];
  children: React.ReactNode;
}) => (
  <SortableContext items={deckIds.map(deckRowDroppableId)} strategy={verticalListSortingStrategy}>
    {children}
  </SortableContext>
);

/**
 * One deck row as a sortable item. Its `deck-row:` id and data are its own: the
 * `deck:` header droppable inside it stays the target that appends a card, so a
 * card released on a deck keeps meaning what it did. `data-dnd-dragging` marks
 * the row a drag in flight is moving.
 */
export const DeckDragRow = ({
  deckId,
  disabled = false,
  className,
  children,
}: {
  deckId: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) => {
  const {
    // The whole row is what moves; its droppable box is the header, inside
    // DeckDropTarget, so the row's own height never becomes the aim.
    setDraggableNodeRef,
    setDroppableNodeRef,
    setActivatorNodeRef,
    listeners,
    attributes,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: deckRowDroppableId(deckId),
    data: { kind: 'deck-row', deckId },
    // The caller redraws the list in its new order on the drop; animating that
    // change on top of the row's own movement would show it twice.
    animateLayoutChanges: () => false,
    disabled: { draggable: disabled },
  });
  const value = React.useMemo<DeckRowDrag>(() => ({
    disabled,
    droppableRef: setDroppableNodeRef,
    handleRef: setActivatorNodeRef,
    handleAttributes: attributes,
    handleListeners: disabled ? undefined : listeners,
  }), [disabled, setDroppableNodeRef, setActivatorNodeRef, attributes, listeners]);

  return (
    <DeckRowDragContext.Provider value={value}>
      <div
        ref={setDraggableNodeRef}
        className={className}
        data-dnd-id={deckRowDroppableId(deckId)}
        data-dnd-dragging={isDragging ? 'true' : undefined}
        style={{
          transform: CSS.Translate.toString(transform),
          transition,
          zIndex: isDragging ? 200 : undefined,
          position: isDragging ? 'relative' : undefined,
        }}
      >
        {children}
      </div>
    </DeckRowDragContext.Provider>
  );
};

/**
 * The handle a deck row is dragged by, and the only part of the row that starts
 * a drag: Space typed in the deck's name is a space. It is named after the deck,
 * or after the deck's position while the name is empty.
 */
export const DeckDragHandle = ({
  deckName,
  position,
  onDragIntent,
}: {
  deckName: string;
  position: number;
  /**
   * Called synchronously before dnd-kit's sensor starts, so the caller can
   * collapse the deck before the row is measured. A plain state update is not
   * enough for the keyboard: the sensor starts in this same key event.
   */
  onDragIntent?: () => void;
}) => {
  const intl = useIntl();
  const row = React.useContext(DeckRowDragContext);
  if (!row) { return null; }

  const handleDragIntent = () => {
    if (row.disabled || !onDragIntent) { return; }
    flushSync(onDragIntent);
  };
  const label = deckName.trim()
    ? intl.formatMessage(messages.dragDeckHandleLabel, { deckName })
    : intl.formatMessage(messages.dragDeckHandleLabelNoName, { position });

  // The tooltip wraps the button rather than being built into it: the activator
  // node has to be the button itself, which only a forwarded ref can reach.
  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id={'deck-drag-handle-' + position}>{label}</Tooltip>}
    >
      <IconButton
        ref={row.handleRef}
        src={DragIndicator}
        iconAs={Icon}
        variant="light"
        alt={label}
        disabled={row.disabled}
        // Only the handle refuses touch scrolling, so a pointer drag on a touch
        // screen is not cancelled by the browser's scroll gesture.
        style={{ touchAction: 'none' }}
        data-drag-handle="true"
        // Capture runs before dnd-kit's activator listeners on the button.
        // Neither handler consumes the event: the sensor must still see it.
        onPointerDownCapture={(event) => {
          if (event.button === 0) { handleDragIntent(); }
        }}
        onKeyDownCapture={(event) => {
          if (event.key === ' ' || event.key === 'Enter') { handleDragIntent(); }
        }}
        {...row.handleAttributes}
        {...row.handleListeners}
      />
    </OverlayTrigger>
  );
};
