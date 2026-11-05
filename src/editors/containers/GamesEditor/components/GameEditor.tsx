import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Alert,
  Button as PgnButton,
  Icon,
  OverlayTrigger,
  Spinner,
  Stack,
  Tooltip,
} from '@openedx/paragon';
import { Info, InfoOutline, Plus } from '@openedx/paragon/icons';

import EditorContainer from '@src/editors/containers/EditorContainer';
import DraggableList from '@src/generic/DraggableList';
import { findCardLocation, isBlankCard } from '@src/editors/containers/GamesEditor/data/gameTransitions';
import type { GameActions } from '@src/editors/containers/GamesEditor/data/useGameState';
import type { SaveOutcome } from '@src/editors/containers/GamesEditor/data/saveGame';
import type { EditorSaveOverrideResult } from '@src/editors/hooks';
import {
  cardIdOf,
  fieldKey,
  getContent,
  imageDisplayUrl,
  type TextField,
  validateCards,
  type ValidationErrors,
} from '@src/editors/containers/GamesEditor/gameContent';
import messages from '@src/editors/containers/GamesEditor/messages';
import type {
  BlockEditorProps,
  Card,
  CardDropTarget,
  Deck,
  GameSettings,
  GameType,
  ImageData,
  ImageType,
  RequestError,
} from '@src/editors/containers/GamesEditor/types';
import DeckOutline from './DeckOutline';
import { DeckCardDragProvider, DeckCardList, type DeckMove } from './DeckCardDragContext';
import GameCard from './GameCard';
import GameImageSettingsModal from './GameImageSettingsModal';
import SettingsSidebar from './SettingsSidebar';

/** Which image the settings modal is editing. */
type ImageSettingsTarget = { imageData: ImageData; cardId: string; imageType: ImageType; };

/** Which way the card menu's Move up / Move down sends a card. */
type MenuMoveDirection = 'up' | 'down';

// The card and setting actions come straight from useGameState, so reuse its
// contract. `getLatestState`, `waitForPendingRequests` and `save` are consumed
// by the block wrapper (GamesEditorForBlock), not by the view.
type ViewActions = Omit<
  GameActions,
  'getLatestState' | 'waitForPendingRequests' | 'save' | 'reload' | 'clearError'
>;

export interface GameEditorProps extends ViewActions {
  onClose: (() => void) | null;
  /** The save seam. Its outcome is mapped to the container's contract below. */
  onSave: () => Promise<SaveOutcome>;
  returnFunction?: BlockEditorProps['returnFunction'];
  blockFinished: boolean;
  /** The block's Studio, which its relative image URLs are shown from. */
  studioEndpointUrl: string;
  settings: GameSettings;
  type: GameType;
  /** The active deck's cards, for the single-list (Matching) view. */
  list: Card[];
  /** Every deck, in stored order; the first is the block's primary deck. */
  decks: Deck[];
  activeDeckId: string;
  /** True when the block stores decks and the game type can author them. */
  supportsDecks: boolean;
  isDirty: () => boolean;
  error: RequestError | null;
  loadFailed: boolean;
  reload: () => void;
  clearError: () => void;
}

/**
 * The Games editor itself: the deck outline (or the flat card list for a game
 * that has one), the settings sidebar and the alerts, inside the shared
 * EditorContainer. Holds only view state (validation messages, the open image
 * settings, whether a save is out); the game content comes in through props.
 */
const GameEditor = ({
  onClose,
  onSave,
  returnFunction = null,
  blockFinished,
  studioEndpointUrl,

  settings,
  setShuffleStatus,
  setTimerStatus,
  type,
  updateType,

  list,
  decks,
  activeDeckId,
  supportsDecks,
  updateTerm,
  updateDefinition,
  updateTermImageAlt,
  updateDefinitionImageAlt,
  toggleOpen,
  setList,
  addCard,
  removeCard,
  selectDeck,
  addDeck,
  renameDeck,
  deleteDeck,
  moveCard,
  moveDeck,

  uploadGameImage,
  deleteGameImage,

  isDirty,
  error,
  loadFailed,
  reload,
  clearError,
}: GameEditorProps) => {
  const intl = useIntl();
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isAlertVisible, setIsAlertVisible] = useState(true);
  // Set when a Save click found deck names that block it, so the failure stays
  // visible even after the author dismisses the alert.
  const [deckAlertVisible, setDeckAlertVisible] = useState(false);
  // Bumped on every save/validate that found bad deck names: the outline opens
  // those rows and focuses the first one. Live typing never does.
  const [deckFocusRequest, setDeckFocusRequest] = useState(0);
  // True from the Save click until the save has settled. The form is disabled
  // meanwhile: the response closes the editor, so anything typed during the
  // wait would be lost without a word.
  const [isSaving, setIsSaving] = useState(false);
  // Which image the settings modal is editing; null while it is closed.
  const [imageSettings, setImageSettings] = useState<ImageSettingsTarget | null>(null);
  const closeImageSettings = useCallback(() => setImageSettings(null), []);

  // Writes one text field of a card straight into the game state and clears
  // that field's validation error, so the message goes away as the author types.
  // The card is named by id: several deck bodies render at once.
  const handleInputChange = useCallback((cardId: string, field: TextField, value: string) => {
    if (field === 'term') {
      updateTerm({ cardId, term: value });
    } else {
      updateDefinition({ cardId, definition: value });
    }
    const key = fieldKey(cardId, field);
    setValidationErrors((prev) => {
      if (!prev[key]) { return prev; }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, [updateTerm, updateDefinition]);

  // Deck authoring exists only where the block stores decks and the game type
  // authors them: matching renders one deck and offers no rename or move.
  const deckAuthoring = supportsDecks && type === 'flashcards';

  // One place decides what a save would carry, so the count a deck's delete
  // prompt states is the count that will be saved (blank drafts excluded).
  const contents = useMemo(() => getContent({ type, settings, decks, list }), [type, settings, decks, list]);
  const deckSummaries = useMemo(() =>
    decks.map((deck, index) => ({
      id: deck.id,
      name: deck.name,
      cardCount: contents.decks[index].cards.length,
    })), [decks, contents]);
  // Deck names are checked from the decks on screen, so a duplicate or an
  // empty name is flagged while the author types. This is also what a save
  // blocks on: validateCards is the one implementation of the rule.
  const deckNameErrors = useMemo(
    () => validateCards({ decks, list, type, supportsDecks }).deckErrors,
    [decks, list, type, supportsDecks],
  );
  const hasDeckNameErrors = Object.keys(deckNameErrors).length > 0;
  // Show alert when new validation errors appear
  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      setIsAlertVisible(true);
    }
  }, [validationErrors]);

  const cardsWithErrors = useMemo(() => new Set(Object.keys(validationErrors).map(cardIdOf)), [validationErrors]);

  // The decks holding a card with an error: their rows must open, or the message
  // stays behind a collapsed row. The card itself is opened below.
  const cardErrorDeckIds = useMemo(
    () =>
      decks
        .filter((deck) => deck.cards.some((card) => cardsWithErrors.has(card.id)))
        .map((deck) => deck.id),
    [decks, cardsWithErrors],
  );

  // Matching renders one deck and no deck rows, so an error in another deck has
  // no row to open: the author has to be told which deck to repair, and where.
  const hiddenErrorDeckNames = useMemo(() => {
    if (deckAuthoring) { return []; }
    const decksWithErrors = new Set(cardErrorDeckIds);
    return decks.filter((deck) => deck.id !== activeDeckId && decksWithErrors.has(deck.id)).map((deck) => deck.name);
  }, [deckAuthoring, decks, activeDeckId, cardErrorDeckIds]);

  // Opens every card that has an error, in whichever deck it lives, so the
  // author can see the message.
  useEffect(() => {
    decks.forEach((deck) =>
      deck.cards.forEach((card) => {
        if (cardsWithErrors.has(card.id) && !card.editorOpen) {
          toggleOpen({ cardId: card.id, isOpen: true });
        }
      })
    );
  }, [cardsWithErrors, decks, toggleOpen]);

  // The seam reports its outcome: an invalid save shows the same inline errors
  // a click used to raise, and an alert when deck names are the cause.
  const handleSave = useCallback((): Promise<EditorSaveOverrideResult> => {
    setIsSaving(true);
    return onSave()
      .then((outcome): EditorSaveOverrideResult => {
        if (outcome.status === 'invalid') {
          setValidationErrors(outcome.validationErrors);
          if (Object.keys(outcome.deckErrors).length > 0) {
            setDeckAlertVisible(true);
            setDeckFocusRequest((request) => request + 1);
          }
        }
        // The container owns the leave-page warning, so it has to know whether
        // anything was written.
        if (outcome.status === 'saved') { return { persisted: true }; }
        return { persisted: false, error: outcome.status === 'failed' ? outcome.error : undefined };
      })
      .finally(() => setIsSaving(false));
  }, [onSave]);

  // Where a card menu's Move up / Move down sends the card, read from the decks
  // on screen: one position within its own deck, or, at that deck's edge - a
  // real card with a deck boundary or a blank draft beside it - into the
  // deck beside it in the outline: the previous deck's end going up, the next
  // deck's start going down. The transition does the rest: clamping, the
  // target's blank draft and the no-op that must not dirty the state.
  const menuMoveTarget = useCallback((cardId: string, direction: MenuMoveDirection): CardDropTarget | null => {
    const at = findCardLocation(decks, cardId);
    if (!at) { return null; }
    const { deckIndex, deck, index } = at;
    // A blank draft is not a card to move.
    if (isBlankCard(deck.cards[index])) { return null; }
    const step = direction === 'up' ? index - 1 : index + 1;
    const adjacent = deck.cards[step];
    // A blank draft row is never saved, so stepping onto it is no move:
    // the card sits at that edge of its deck instead.
    if (adjacent && !isBlankCard(adjacent)) {
      return { deckId: deck.id, index: step };
    }
    // The flat view renders the primary deck alone, so the decks beside it are
    // not destinations its menu can name.
    if (!deckAuthoring) { return null; }
    const neighbour = decks[deckIndex + (direction === 'up' ? -1 : 1)];
    if (!neighbour) { return null; }
    return { deckId: neighbour.id, index: direction === 'up' ? neighbour.cards.length : 0 };
  }, [deckAuthoring, decks]);

  // A cross-deck move re-renders the row in another deck body, so the control
  // that had focus is gone: focus follows the card, or the outline when the
  // target deck is collapsed and the row never appears.
  const focusMovedCard = useCallback((cardId: string) => {
    const attempt = (remaining: number) => {
      const row = Array.from(document.querySelectorAll<HTMLElement>('[data-dnd-id]'))
        .find((element) => element.dataset.dndId === cardId);
      const handle = row?.querySelector<HTMLElement>('[data-drag-handle]');
      if (handle) {
        handle.focus();
        return;
      }
      if (remaining > 0) {
        requestAnimationFrame(() => attempt(remaining - 1));
        return;
      }
      document.querySelector<HTMLElement>('[data-deck-outline]')?.focus();
    };
    requestAnimationFrame(() => attempt(2));
  }, []);

  // Every menu move goes through the same `moveCard` a drop does.
  const moveCardFromMenu = useCallback((cardId: string, direction: MenuMoveDirection) => {
    const target = menuMoveTarget(cardId, direction);
    if (!target) { return; }
    const sourceDeckId = findCardLocation(decks, cardId)?.deck.id;
    moveCard({ cardId, toDeckId: target.deckId, toIndex: target.index });
    // Within one deck the row stays where it was, focus and all.
    if (target.deckId !== sourceDeckId) { focusMovedCard(cardId); }
  }, [menuMoveTarget, moveCard, decks, focusMovedCard]);

  // DraggableList keeps its own mirror through `setState` and reports the final
  // order through `updateOrder`. Here both are the same store, so the mirror
  // setter is the persist and `updateOrder` has nothing left to do.
  const replaceDeckCards = useCallback((
    deckId: string,
    cards: Card[],
    next: React.SetStateAction<Card[]>,
  ) => {
    setList({ deckId, cards: typeof next === 'function' ? next(cards) : next });
  }, [setList]);

  // A drag reports one move; the transition is the only thing that writes it.
  const handleCardMove = useCallback((move: { cardId: string; toDeckId: string; toIndex: number; }) => {
    moveCard(move);
  }, [moveCard]);

  // Same for a deck: the stored order is what was dropped, and the first deck is
  // the block's primary one.
  const handleDeckMove = useCallback((move: DeckMove) => {
    moveDeck(move);
  }, [moveDeck]);

  // The card that follows the pointer is the real one, so a drag collapses an
  // open card first. Checking `editorOpen` here is what keeps a drag of an
  // already collapsed card from writing to the store for nothing.
  const handleCardDragStart = useCallback((cardId: string) => {
    const at = findCardLocation(decks, cardId);
    if (at?.deck.cards[at.index].editorOpen) { toggleOpen({ cardId, isOpen: false }); }
  }, [decks, toggleOpen]);

  const openImageSettings = useCallback((card: Card, imageType: ImageType) => {
    setImageSettings({
      imageData: {
        url: imageDisplayUrl(card[`${imageType}_image`], studioEndpointUrl),
        altText: card[`${imageType}_image_alt`] || '',
      },
      cardId: card.id,
      imageType,
    });
  }, [studioEndpointUrl]);

  const handleImageSettingsSave = useCallback(({ altText }: { altText: string; }) => {
    // A modal that was already open when Save was clicked must not write
    // into a save that has already gone out.
    if (isSaving || !imageSettings) { return; }
    const { cardId, imageType } = imageSettings;
    if (imageType === 'term') {
      updateTermImageAlt({ cardId, termImageAlt: altText });
    } else {
      updateDefinitionImageAlt({ cardId, definitionImageAlt: altText });
    }
    closeImageSettings();
  }, [imageSettings, updateTermImageAlt, updateDefinitionImageAlt, isSaving, closeImageSettings]);

  const loadError = (
    <Alert
      variant="danger"
      icon={Info}
      actions={[
        <PgnButton key="retry" variant="outline-primary" onClick={reload}>
          {intl.formatMessage(messages.retryButton)}
        </PgnButton>,
      ]}
    >
      <Alert.Heading>
        {intl.formatMessage(messages.loadErrorHeading)}
      </Alert.Heading>
      {error?.message && <p className="mb-0">{error.message}</p>}
    </Alert>
  );

  const loading = loadFailed ? loadError : (
    <div className="text-center p-6">
      <Spinner
        animation="border"
        className="m-3"
        screenReaderText={intl.formatMessage(messages.loadingSpinner)}
      />
    </div>
  );

  // One card row. Every action names the card and its deck, so several decks
  // can render their cards at the same time. Both moves are read from the decks
  // on screen, so a menu never offers a destination that is not there.
  const renderCard = (card: Card, index: number) => (
    <GameCard
      key={card.id}
      card={card}
      index={index}
      draggable={!isBlankCard(card)}
      canMoveUp={menuMoveTarget(card.id, 'up') !== null}
      canMoveDown={menuMoveTarget(card.id, 'down') !== null}
      type={type}
      studioEndpointUrl={studioEndpointUrl}
      errors={{
        term: validationErrors[fieldKey(card.id, 'term')],
        definition: validationErrors[fieldKey(card.id, 'definition')],
      }}
      isSaving={isSaving}
      onToggle={(isOpen) => toggleOpen({ cardId: card.id, isOpen })}
      onChange={(field, value) => handleInputChange(card.id, field, value)}
      onMoveUp={() => moveCardFromMenu(card.id, 'up')}
      onMoveDown={() => moveCardFromMenu(card.id, 'down')}
      onDelete={() => removeCard({ cardId: card.id })}
      // Fire and forget: the hook tracks the request and reports its failure.
      onImagePicked={(imageType, file) => {
        void uploadGameImage({ cardId: card.id, imageFile: file, imageType });
      }}
      onImageRemoved={(imageType) => deleteGameImage({ cardId: card.id, imageType })}
      onOpenImageSettings={(imageType) => openImageSettings(card, imageType)}
    />
  );

  const addCardButton = (deckId?: string) => {
    const deck = deckId == null ? null : decks.find((candidate) => candidate.id === deckId);
    return (
      <PgnButton
        className="text-primary-500 py-2 pr-3 pl-0 align-self-start"
        variant="tertiary"
        onClick={() => addCard(deckId)}
        iconBefore={Plus}
        // Several decks may be open at once, so each names the deck it adds to.
        // The single-list view keeps the plain label.
        aria-label={deck ? intl.formatMessage(messages.addCardToDeckLabel, { deckName: deck.name }) : undefined}
      >
        {intl.formatMessage(messages.addLabel)}
      </PgnButton>
    );
  };

  // The cards of one deck, as its outline row shows them. The drag layer
  // supplies the preview decks, so a card moved here by a drag-over appears.
  const renderDeck = (deckId: string) => (
    <Stack gap={3}>
      <DeckCardList
        deckId={deckId}
        renderCard={(_deck, card, index) => renderCard(card, index)}
      />
      {addCardButton(deckId)}
    </Stack>
  );

  const page = (
    <Stack direction="horizontal" gap={4} className="align-items-start w-100 py-2">
      <Stack gap={3} className="terms align-items-start">
        <Stack direction="horizontal" gap={1} className="align-items-start mb-2">
          <div className="description-header text-primary-500 font-weight-bold">
            {intl.formatMessage(
              type === 'matching' ? messages.descriptionHeaderMatching : messages.descriptionHeaderFlashcard,
            )}
          </div>
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip id="description-tooltip">
                {intl.formatMessage(type === 'matching' ? messages.descriptionMatching : messages.descriptionFlashcard)}
              </Tooltip>
            }
          >
            <Icon src={InfoOutline} />
          </OverlayTrigger>
        </Stack>
        {deckAuthoring ?
          (
            <DeckCardDragProvider
              decks={decks}
              onCardMove={handleCardMove}
              onDeckMove={handleDeckMove}
              onCardDragStart={handleCardDragStart}
            >
              <DeckOutline
                decks={deckSummaries}
                activeDeckId={activeDeckId}
                nameErrors={deckNameErrors}
                cardErrorDeckIds={cardErrorDeckIds}
                focusRequest={deckFocusRequest}
                isSaving={isSaving}
                onSelect={selectDeck}
                onRename={(deckId, name) => renameDeck({ deckId, name })}
                onDelete={(deckId) => deleteDeck({ deckId })}
                onAdd={() => addDeck()}
                renderDeck={renderDeck}
              />
            </DeckCardDragProvider>
          ) :
          (
            <>
              <DraggableList
                itemList={list}
                setState={(next) => replaceDeckCards(activeDeckId, list, next)}
                updateOrder={() => () => undefined}
                // The flat list has no preview tree, so the same collapse goes
                // straight to the state. Null means no drag, not a card.
                setActiveId={(cardId) => {
                  if (cardId) { handleCardDragStart(cardId); }
                }}
              >
                {list.map((card, index) => renderCard(card, index))}
              </DraggableList>
              {addCardButton()}
            </>
          )}
      </Stack>
      <SettingsSidebar
        type={type}
        settings={settings}
        updateType={updateType}
        setShuffleStatus={setShuffleStatus}
        setTimerStatus={setTimerStatus}
        isSaving={isSaving}
      />
    </Stack>
  );

  return (
    <EditorContainer
      getContent={() => contents}
      onClose={onClose}
      // For the container's cancel and discard flows; the save path honours
      // it itself.
      returnFunction={returnFunction}
      // Saves through the block's own handler. Without this the shared
      // saveBlock thunk takes over, and its payload builder drops the
      // *_image_path storage keys, losing the link from a card to its file.
      onSave={handleSave}
      isDirty={isDirty}
      // A click before the settings arrive could only fail, so it is not offered.
      saveDisabled={!blockFinished}
    >
      <div className="xblock-games-editor">
        <div>
          {deckAlertVisible && hasDeckNameErrors && (
            <Alert
              variant="danger"
              className="mt-2"
              icon={Info}
              dismissible
              onClose={() => setDeckAlertVisible(false)}
            >
              <Alert.Heading>
                {intl.formatMessage(messages.deckNameErrorHeading)}
              </Alert.Heading>
              <p>{intl.formatMessage(messages.deckNameErrorAlert)}</p>
            </Alert>
          )}
          {Object.keys(validationErrors).length > 0 && isAlertVisible && (
            <Alert
              variant="danger"
              className="mt-2"
              icon={Info}
              dismissible
              onClose={() => setIsAlertVisible(false)}
            >
              <Alert.Heading>
                {intl.formatMessage(messages.validationErrorHeading)}
              </Alert.Heading>
              <p>{intl.formatMessage(messages.validationErrorAlert)}</p>
              {hiddenErrorDeckNames.length > 0 && (
                <p className="mb-0">
                  {intl.formatMessage(
                    messages.validationErrorHiddenDecks,
                    { deckNames: hiddenErrorDeckNames.join(', ') },
                  )}
                </p>
              )}
            </Alert>
          )}
          {error && !loadFailed && (
            <Alert
              variant="danger"
              className="mt-2"
              icon={Info}
              dismissible
              onClose={clearError}
            >
              <Alert.Heading>
                {intl.formatMessage(
                  error.code === 'saveFailed' ? messages.saveErrorHeading : messages.requestErrorHeading,
                )}
              </Alert.Heading>
              {error.message && <p className="mb-0">{error.message}</p>}
            </Alert>
          )}
          {!blockFinished ? loading : (
            // A disabled fieldset disables every control inside it.
            <fieldset disabled={isSaving} className="game-editor-form">
              {page}
            </fieldset>
          )}
        </div>
      </div>
      {imageSettings && (
        <GameImageSettingsModal
          key={`${imageSettings.cardId}-${imageSettings.imageType}-${imageSettings.imageData.url}`}
          imageData={imageSettings.imageData}
          close={closeImageSettings}
          onSave={handleImageSettingsSave}
          isSaveDisabled={isSaving}
        />
      )}
    </EditorContainer>
  );
};

export default GameEditor;
