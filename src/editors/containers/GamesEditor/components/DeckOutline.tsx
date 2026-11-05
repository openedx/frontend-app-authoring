import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Collapsible,
  Form,
  Icon,
  IconButton,
  Stack,
} from '@openedx/paragon';
import {
  Add,
  DeleteOutline,
  ExpandLess,
  ExpandMore,
} from '@openedx/paragon/icons';

import BaseModal from '@src/editors/sharedComponents/BaseModal';
import { DeckDragHandle, DeckDragList, DeckDragRow, DeckDropTarget } from './DeckCardDragContext';
import type { DeckNameError } from '@src/editors/containers/GamesEditor/types';
import messages from '@src/editors/containers/GamesEditor/messages';

/** One deck as the outline shows it: its name, and the count its delete prompt uses. */
export interface DeckOutlineSummary {
  id: string;
  name: string;
  cardCount: number;
}

interface DeckOutlineProps {
  /** The authored decks, in stored order. */
  decks: DeckOutlineSummary[];
  activeDeckId: string;
  /** Deck ids whose name is invalid, with the reason. */
  nameErrors: Record<string, DeckNameError | undefined>;
  /** Decks holding a card with a validation error; their rows open. */
  cardErrorDeckIds?: string[];
  /**
   * A one-shot request: the editor bumps this when a save (or validate) found
   * invalid deck names. Live errors never move the caret, or it would jump out
   * of the field being typed in.
   */
  focusRequest?: number;
  /** True while a save is out: the form is a disabled fieldset, where focus() is a no-op. */
  isSaving?: boolean;
  onSelect: (deckId: string) => void;
  /** Called on every keystroke, with what the author typed. */
  onRename: (deckId: string, name: string) => void;
  onDelete: (deckId: string) => void;
  onAdd: () => void;
  /** The deck's card rows, shown inside its collapsible body. */
  renderDeck: (deckId: string) => React.ReactNode;
}

const nameInputId = (deckId: string) => 'deck-outline-name-' + deckId;
const nameErrorId = (deckId: string) => 'deck-outline-name-error-' + deckId;
const bodyId = (deckId: string) => 'deck-outline-body-' + deckId;

const focusNameInput = (deckId: string) => document.getElementById(nameInputId(deckId))?.focus();

/**
 * Decks as a list of independently collapsible rows, course-outline style:
 * the name is editable in place, the header carries the delete action, and the
 * deck's cards render inside the row. A deck with an invalid name or cards opens
 * its row; a save request also focuses the first invalid name.
 */
const DeckOutline = ({
  decks,
  activeDeckId,
  nameErrors,
  cardErrorDeckIds = [],
  focusRequest = 0,
  isSaving = false,
  onSelect,
  onRename,
  onDelete,
  onAdd,
  renderDeck,
}: DeckOutlineProps) => {
  const intl = useIntl();
  // Local: the rows the author has open. Several may be open at once, and none
  // starts open: the outline is a list to scan, and opening a row is the
  // author's move - or an explicit one, such as adding a deck.
  const [openDeckIds, setOpenDeckIds] = React.useState<ReadonlySet<string>>(() => new Set<string>());
  // Local: only this list cares which deletion is waiting for confirmation.
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(null);
  const pendingDelete = decks.find((deck) => deck.id === pendingDeleteId);

  const previousDeckIds = React.useRef(decks.map((deck) => deck.id));
  const [focusDeckId, setFocusDeckId] = React.useState<string | null>(null);
  // The last save request acted on: 0 is "none yet", so a request already made
  // before this list mounts (a save in Matching, repaired in Flashcards) counts.
  const handledFocusRequest = React.useRef(0);
  // Set when the removed deck was the active one: its replacement must open and
  // take focus once the props no longer contain it.
  const removedActiveDeckId = React.useRef<string | null>(null);

  const setDeckOpen = (deckId: string, isOpen: boolean) => {
    setOpenDeckIds((previous) => {
      if (previous.has(deckId) === isOpen) { return previous; }
      const next = new Set(previous);
      if (isOpen) { next.add(deckId); }
      else { next.delete(deckId); }
      return next;
    });
  };

  const toggleDeck = (deckId: string, isOpen: boolean) => {
    // The trigger is a role="button" div, so the disabled fieldset never reaches
    // it; a toggle now would change state the save in flight cannot carry.
    if (isSaving) { return; }
    setDeckOpen(deckId, isOpen);
    // Working in a deck makes it the active one; the cards below need it.
    if (isOpen) { onSelect(deckId); }
  };

  /** A name error lives in whichever row holds it, opened or not. */
  const errorIds = decks.filter((deck) => nameErrors[deck.id]).map((deck) => deck.id);

  React.useEffect(() => {
    // A deck added by the author since the last render opens and takes focus.
    const knownIds = new Set(previousDeckIds.current);
    const addedIds = decks.filter((deck) => !knownIds.has(deck.id)).map((deck) => deck.id);
    previousDeckIds.current = decks.map((deck) => deck.id);
    if (addedIds.length > 0) {
      setOpenDeckIds((previous) => new Set([...previous, ...addedIds]));
      setFocusDeckId(addedIds[0]);
    }
  }, [decks]);

  const errorKey = errorIds.join(' ');
  // Live validation opens the rows so the message is never hidden, but it must
  // not move the caret: a name that is briefly a duplicate is still being typed.
  React.useEffect(() => {
    if (errorIds.length === 0) { return; }
    setOpenDeckIds((previous) => new Set([...previous, ...errorIds]));
  }, [errorKey]);

  // A requested focus (a save found bad names) opens every affected row and
  // puts the caret in the first one.
  React.useEffect(() => {
    // A save in flight wraps the form in a disabled fieldset, where focus() is
    // swallowed: leave the request unhandled so it lands once the save settles.
    if (isSaving) { return; }
    if (focusRequest <= handledFocusRequest.current) { return; }
    handledFocusRequest.current = focusRequest;
    if (errorIds.length === 0) { return; }
    setOpenDeckIds((previous) => new Set([...previous, ...errorIds]));
    focusNameInput(errorIds[0]);
  }, [focusRequest, errorKey, isSaving]);

  const cardErrorKey = cardErrorDeckIds.join(' ');
  // A card error inside a collapsed deck would otherwise have no visible cause.
  React.useEffect(() => {
    if (cardErrorDeckIds.length === 0) { return; }
    setOpenDeckIds((previous) => new Set([...previous, ...cardErrorDeckIds]));
  }, [cardErrorKey]);

  React.useEffect(() => {
    if (!focusDeckId) { return; }
    focusNameInput(focusDeckId);
    setFocusDeckId(null);
  }, [focusDeckId, openDeckIds]);

  React.useEffect(() => {
    const removedId = removedActiveDeckId.current;
    if (!removedId || decks.some((deck) => deck.id === removedId)) { return; }
    removedActiveDeckId.current = null;
    // The parent has picked the neighbouring deck as active: show it, and put
    // the caret where the deleted row's control was.
    setDeckOpen(activeDeckId, true);
    focusNameInput(activeDeckId);
  }, [decks, activeDeckId]);

  const deleteDeck = (deckId: string) => {
    if (deckId === activeDeckId) { removedActiveDeckId.current = deckId; }
    setDeckOpen(deckId, false);
    onDelete(deckId);
  };

  const requestDelete = (deck: DeckOutlineSummary) => {
    if (deck.cardCount > 0) {
      setPendingDeleteId(deck.id);
    } else {
      deleteDeck(deck.id);
    }
  };

  const confirmDelete = () => {
    if (pendingDelete) { deleteDeck(pendingDelete.id); }
    setPendingDeleteId(null);
  };

  return (
    <>
      <section
        aria-label={intl.formatMessage(messages.deckListLabel)}
        className="w-100"
        // Programmatically focusable: the drag layer puts focus here when a
        // keyboard drag ends and the moved card's handle is gone.
        data-deck-outline="true"
        tabIndex={-1}
      >
        <Stack direction="vertical" gap={2}>
          <DeckDragList deckIds={decks.map((deck) => deck.id)}>
            {decks.map((deck, index) => {
              const isOpen = openDeckIds.has(deck.id);
              const error = nameErrors[deck.id];
              const errorId = nameErrorId(deck.id);
              return (
                <DeckDragRow
                  key={deck.id}
                  deckId={deck.id}
                  // One deck has no order to change, and a save in flight is a
                  // disabled fieldset: neither offers a drag.
                  disabled={decks.length < 2 || isSaving}
                  className="deck-outline-row border border-light-700 rounded mb-2"
                >
                  <Collapsible.Advanced open={isOpen} onToggle={(open) => toggleDeck(deck.id, open)}>
                    <DeckDropTarget
                      deckId={deck.id}
                      isExpanded={isOpen}
                      onRequestExpand={() => toggleDeck(deck.id, true)}
                    >
                      <Stack direction="horizontal" gap={2} className="p-2">
                        <DeckDragHandle
                          deckName={deck.name}
                          position={index + 1}
                          // The handle reports the intent before dnd-kit starts:
                          // the deck is compact when the sensor measures it.
                          onDragIntent={() => setDeckOpen(deck.id, false)}
                        />
                        <Collapsible.Trigger
                          className="deck-outline-toggle d-flex align-items-center px-1 mr-2"
                          aria-label={intl.formatMessage(
                            isOpen ? messages.collapseDeckLabel : messages.expandDeckLabel,
                            { deckName: deck.name },
                          )}
                          // The body unmounts when the row closes, so only point at it while it exists.
                          aria-controls={isOpen ? bodyId(deck.id) : undefined}
                          aria-disabled={isSaving}
                          onKeyDown={(event) => {
                            // Paragon's Trigger only answers Enter; a role="button"
                            // must also toggle on Space.
                            if (event.key === ' ') {
                              event.preventDefault();
                              toggleDeck(deck.id, !isOpen);
                            }
                          }}
                        >
                          <Icon src={isOpen ? ExpandLess : ExpandMore} />
                        </Collapsible.Trigger>
                        <div className="deck-outline-name flex-grow-1">
                          <label className="sr-only" htmlFor={nameInputId(deck.id)}>
                            {intl.formatMessage(messages.deckNameInputLabel, { number: index + 1 })}
                          </label>
                          <Form.Control
                            id={nameInputId(deck.id)}
                            type="text"
                            value={deck.name}
                            onChange={(event) => onRename(deck.id, event.target.value)}
                            onFocus={() => onSelect(deck.id)}
                            isInvalid={!!error}
                            // The message is the field's description, not just nearby text.
                            aria-invalid={!!error}
                            aria-describedby={error ? errorId : undefined}
                          />
                          {error && (
                            <Form.Control.Feedback type="invalid" hasIcon={false}>
                              <span id={errorId}>
                                {intl.formatMessage(
                                  error === 'duplicate' ? messages.deckNameDuplicate : messages.deckNameRequired,
                                )}
                              </span>
                            </Form.Control.Feedback>
                          )}
                        </div>
                        <IconButton
                          src={DeleteOutline}
                          iconAs={Icon}
                          alt={intl.formatMessage(messages.deleteDeckLabel, { deckName: deck.name })}
                          variant="primary"
                          className="deck-outline-delete ml-2"
                          // The block always stores at least one deck.
                          disabled={decks.length === 1}
                          onClick={() => requestDelete(deck)}
                        />
                      </Stack>
                    </DeckDropTarget>
                    {
                      /* Only the open row has a body. Closing it removes the body in
                      this same commit, so a drag intent collapses the deck before
                      dnd-kit measures its row, with no exit transition to wait for. */
                    }
                    {isOpen && (
                      <Collapsible.Body id={bodyId(deck.id)} className="deck-outline-body px-2 pb-2">
                        {renderDeck(deck.id)}
                      </Collapsible.Body>
                    )}
                  </Collapsible.Advanced>
                </DeckDragRow>
              );
            })}
          </DeckDragList>
          <Button variant="outline-primary" className="align-self-start" onClick={onAdd}>
            <Icon src={Add} className="mr-2" />
            {intl.formatMessage(messages.newDeckLabel)}
          </Button>
        </Stack>
      </section>
      {pendingDelete && (
        <BaseModal
          isOpen
          close={() => setPendingDeleteId(null)}
          title={intl.formatMessage(messages.deleteDeckConfirmTitle)}
          size="sm"
          className="deck-delete-modal"
          confirmAction={
            <Button variant="danger" onClick={confirmDelete}>
              {intl.formatMessage(messages.deleteDeckConfirmButton)}
            </Button>
          }
        >
          <p>
            {intl.formatMessage(messages.deleteDeckConfirmBody, {
              deckName: pendingDelete.name,
              cardCount: pendingDelete.cardCount,
            })}
          </p>
        </BaseModal>
      )}
    </>
  );
};

export default DeckOutline;
