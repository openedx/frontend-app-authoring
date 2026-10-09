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
  Tooltip,
} from '@openedx/paragon';
import { Info, InfoOutline, Plus } from '@openedx/paragon/icons';

import EditorContainer from '@src/editors/containers/EditorContainer';
import Button from '@src/editors/sharedComponents/Button';
import DraggableList from '@src/generic/DraggableList';
import type { GameActions } from '@src/editors/containers/GamesEditor/data/useGameState';
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
  GameSettings,
  GameType,
  ImageData,
  ImageType,
  RequestError,
} from '@src/editors/containers/GamesEditor/types';
import GameCard from './GameCard';
import GameImageSettingsModal from './GameImageSettingsModal';
import SettingsSidebar from './SettingsSidebar';

/** Which image the settings modal is editing. */
type ImageSettingsTarget = { imageData: ImageData; cardIndex: number; imageType: ImageType; };

// The card and setting actions come straight from useGameState, so reuse its
// contract. `getLatestState`, `waitForPendingRequests` and `save` are consumed
// by the block wrapper (GamesEditorForBlock), not by the view.
type ViewActions = Omit<
  GameActions,
  'getLatestState' | 'waitForPendingRequests' | 'save' | 'reload' | 'clearError'
>;

export interface GameEditorProps extends ViewActions {
  onClose: (() => void) | null;
  onSave: () => Promise<unknown>;
  returnFunction?: BlockEditorProps['returnFunction'];
  blockFinished: boolean;
  /** The block's Studio, which its relative image URLs are shown from. */
  studioEndpointUrl: string;
  settings: GameSettings;
  type: GameType;
  list: Card[];
  isDirty: () => boolean;
  error: RequestError | null;
  loadFailed: boolean;
  reload: () => void;
  clearError: () => void;
}

/**
 * The Games editor itself: the card list, the settings sidebar and the alerts,
 * inside the shared EditorContainer. Holds only view state (validation
 * messages, the open image settings, whether a save is out); the game content
 * comes in through props.
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
  updateTerm,
  updateDefinition,
  updateTermImageAlt,
  updateDefinitionImageAlt,
  toggleOpen,
  setList,
  addCard,
  removeCard,

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
  // True from the Save click until the save has settled. The form is disabled
  // meanwhile: the response closes the editor, so anything typed during the
  // wait would be lost without a word.
  const [isSaving, setIsSaving] = useState(false);
  // Which image the settings modal is editing; null while it is closed.
  const [imageSettings, setImageSettings] = useState<ImageSettingsTarget | null>(null);
  const closeImageSettings = useCallback(() => setImageSettings(null), []);

  // Writes one text field of a card straight into the game state and clears
  // that field's validation error, so the message goes away as the author types.
  const handleInputChange = useCallback((index: number, field: TextField, value: string) => {
    if (field === 'term') {
      updateTerm({ index, term: value });
    } else {
      updateDefinition({ index, definition: value });
    }
    const card = list[index];
    if (!card) { return; }
    const key = fieldKey(card.id, field);
    setValidationErrors((prev) => {
      if (!prev[key]) { return prev; }
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, [list, updateTerm, updateDefinition]);

  // Validates the cards as they are in the game state, which is what the
  // author sees: there is no unsaved text outside it.
  const validateAllCards = useCallback(() => {
    const { errors, isValid } = validateCards({ list, type });
    setValidationErrors(errors);
    return isValid;
  }, [list, type]);

  // Show alert when new validation errors appear
  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      setIsAlertVisible(true);
    }
  }, [validationErrors]);

  const cardsWithErrors = useMemo(() => new Set(Object.keys(validationErrors).map(cardIdOf)), [validationErrors]);

  // Opens every card that has an error, so the author can see the message.
  useEffect(() => {
    list.forEach((card, index) => {
      if (cardsWithErrors.has(card.id) && !card.editorOpen) {
        toggleOpen({ index, isOpen: true });
      }
    });
  }, [cardsWithErrors, list, toggleOpen]);

  // The save revalidates after waiting on image requests, by which point this
  // component's own check (validateEntry, run at the click) is out of date.
  // Show what it found the same way.
  const handleSave = useCallback(() => {
    setIsSaving(true);
    return onSave()
      .catch((saveError) => {
        if (saveError?.validationErrors) {
          setValidationErrors(saveError.validationErrors);
        }
        throw saveError;
      })
      .finally(() => setIsSaving(false));
  }, [onSave]);

  const moveCard = useCallback((from: number, to: number) => {
    if (to < 0 || to >= list.length) { return; }
    const next = list.slice();
    [next[from], next[to]] = [next[to], next[from]];
    setList(next);
  }, [list, setList]);

  // DraggableList keeps its own mirror through `setState` and reports the final
  // order through `updateOrder`. Here both are the same store, so the mirror
  // setter is the persist and `updateOrder` has nothing left to do.
  const applyListUpdate: React.Dispatch<React.SetStateAction<Card[]>> = useCallback((next) => {
    setList(typeof next === 'function' ? next(list) : next);
  }, [list, setList]);

  const openImageSettings = useCallback((card: Card, index: number, imageType: ImageType) => {
    setImageSettings({
      imageData: {
        url: imageDisplayUrl(card[`${imageType}_image`], studioEndpointUrl),
        altText: card[`${imageType}_image_alt`] || '',
      },
      cardIndex: index,
      imageType,
    });
  }, [studioEndpointUrl]);

  const handleImageSettingsSave = useCallback(({ altText }: { altText: string; }) => {
    // A modal that was already open when Save was clicked must not write
    // into a save that has already gone out.
    if (isSaving || !imageSettings) { return; }
    const { cardIndex, imageType } = imageSettings;
    if (imageType === 'term') {
      updateTermImageAlt({ index: cardIndex, termImageAlt: altText });
    } else {
      updateDefinitionImageAlt({ index: cardIndex, definitionImageAlt: altText });
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

  const page = (
    <div className="page-body d-flex align-items-start w-100 py-2">
      <div className="terms d-flex flex-column align-items-start align-self-stretch">
        <div className="description d-flex flex-row align-items-start align-self-stretch mb-2">
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
        </div>
        <DraggableList
          itemList={list}
          setState={applyListUpdate}
          updateOrder={() => () => undefined}
        >
          {list.map((card, index) => (
            <GameCard
              key={card.id}
              card={card}
              index={index}
              type={type}
              studioEndpointUrl={studioEndpointUrl}
              errors={{
                term: validationErrors[fieldKey(card.id, 'term')],
                definition: validationErrors[fieldKey(card.id, 'definition')],
              }}
              isSaving={isSaving}
              onToggle={(isOpen) => toggleOpen({ index, isOpen })}
              onChange={(field, value) => handleInputChange(index, field, value)}
              onMoveUp={() => moveCard(index, index - 1)}
              onMoveDown={() => moveCard(index, index + 1)}
              onDelete={() => removeCard({ index })}
              // Fire and forget: the hook tracks the request and reports its failure.
              onImagePicked={(imageType, file) => {
                void uploadGameImage({ cardId: card.id, imageFile: file, imageType });
              }}
              onImageRemoved={(imageType) => deleteGameImage({ cardId: card.id, imageType })}
              onOpenImageSettings={(imageType) => openImageSettings(card, index, imageType)}
            />
          ))}
        </DraggableList>
        <Button
          className="add-button text-primary-500 py-3 pr-3 pl-0"
          onClick={() => addCard()}
          iconBefore={Plus}
          variant="link"
          size="inline"
        >
          {intl.formatMessage(messages.addLabel)}
        </Button>
      </div>
      <SettingsSidebar
        type={type}
        settings={settings}
        updateType={updateType}
        setShuffleStatus={setShuffleStatus}
        setTimerStatus={setTimerStatus}
      />
    </div>
  );

  return (
    <EditorContainer
      getContent={() => getContent({ type, settings, list })}
      onClose={onClose}
      // For the container's cancel and discard flows; the save path honours
      // it itself.
      returnFunction={returnFunction}
      // Saves through the block's own handler. Without this the shared
      // saveBlock thunk takes over, and its payload builder drops the
      // *_image_path storage keys, losing the link from a card to its file.
      onSave={handleSave}
      isDirty={isDirty}
      // Until the block's settings have loaded the list is a placeholder blank
      // card, which validates clean and would overwrite the real content.
      validateEntry={() => blockFinished && validateAllCards()}
    >
      <div className="xblock-games-editor">
        <div className="h-75 overflow-auto">
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
          key={`${imageSettings.cardIndex}-${imageSettings.imageType}-${imageSettings.imageData.url}`}
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
