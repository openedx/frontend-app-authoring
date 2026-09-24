import { useSelector } from 'react-redux';
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Form,
  Spinner,
  Collapsible,
  Icon,
  IconButton,
  Dropdown,
  OverlayTrigger,
  Tooltip,
  Alert,
  Button as PgnButton,
} from '@openedx/paragon';
import {
  DeleteOutline,
  Plus,
  ExpandMore,
  ExpandLess,
  MoreHoriz,
  InfoOutline,
  Check,
  Info,
} from '@openedx/paragon/icons';
import './GamesEditor.scss';
import EditorContainer from 'CourseAuthoring/editors/containers/EditorContainer';
import { selectors } from 'CourseAuthoring/editors/data/redux';
import * as editorHooks from 'CourseAuthoring/editors/hooks';
import { isLibraryKey } from 'CourseAuthoring/generic/key-utils';
import {
  AlertHeading,
  Button,
  DraggableList,
  PlainIconButton,
  SettingsOption,
  SortableItem,
} from './hostComponents';
import messages from './messages';
import PictureIcon from './PictureIcon';
import GameImageSettingsModal from './GameImageSettingsModal';

import { useGameState } from './data/useGameState';
import type {
  Card,
  EditorPluginProps,
  GameActions,
  GameSettings,
  GameState,
  GameType,
  ImageData,
  ImageType,
  RequestError,
} from './types';

/** Keyed `${cardIndex}_${field}`; the value says which message to show. */
type ValidationErrors = Record<string, true | 'imageWithoutText'>;

/** The two free-text fields of a card. */
type TextField = 'term' | 'definition';

/**
 * Key for per-card, per-field state (validation errors, unsaved text). Built
 * from the card id, not its position, so reordering cannot mis-attach it. Card
 * ids are `card-<time>-<n>` and never contain `_`, so the field can be split
 * off again at the last `_`.
 */
const fieldKey = (cardId: string, field: TextField) => `${cardId}_${field}`;

type SaveOptions = { beforePersist?: () => void; };

/** Splits a `fieldKey` back into its card id and field. */
const parseFieldKey = (key: string): { cardId: string; field: TextField; } => {
  const sep = key.lastIndexOf('_');
  return {
    cardId: key.slice(0, sep),
    field: key.slice(sep + 1) === 'term' ? 'term' : 'definition',
  };
};

export const hooks = {
  getContent: ({ type, settings, list }: Pick<GameState, 'type' | 'settings' | 'list'>) => {
    // Filter out cards based on game type requirements
    let filledCards: Card[];

    if (type === 'matching') {
      filledCards = list.filter((card) => {
        const termText = (card.term || '').trim();
        const definitionText = (card.definition || '').trim();
        return termText !== '' || definitionText !== '';
      });
    } else {
      filledCards = list.filter((card) => {
        const termText = (card.term || '').trim();
        const definitionText = (card.definition || '').trim();
        const hasText = termText !== '' || definitionText !== '';
        const hasImages = !!card.term_image || !!card.definition_image;
        return hasText || hasImages;
      });
    }

    return {
      gameType: type,
      isShuffled: settings.shuffle,
      hasTimer: settings.timer,
      cards: filledCards,
    };
  },

  // Pure, so it can run against state that has not been rendered yet (see
  // handleSave, which revalidates once pending image requests have settled).
  validateCards: ({ list, type }: Pick<GameState, 'list' | 'type'>) => {
    const errors: ValidationErrors = {};
    let hasErrors = false;

    list.forEach((card) => {
      const termEmpty = !card.term.trim();
      const definitionEmpty = !card.definition.trim();
      const hasTermImage = !!card.term_image;
      const hasDefinitionImage = !!card.definition_image;

      if (termEmpty && definitionEmpty) {
        // For flashcards, if there's an image but no text, show validation error
        if (type === 'flashcards' && (hasTermImage || hasDefinitionImage)) {
          if (hasTermImage) {
            errors[fieldKey(card.id, 'term')] = 'imageWithoutText';
            hasErrors = true;
          }
          if (hasDefinitionImage) {
            errors[fieldKey(card.id, 'definition')] = 'imageWithoutText';
            hasErrors = true;
          }
        }
        return;
      }

      if (termEmpty && !definitionEmpty) {
        errors[fieldKey(card.id, 'term')] = true;
        hasErrors = true;
      }

      if (!termEmpty && definitionEmpty) {
        errors[fieldKey(card.id, 'definition')] = true;
        hasErrors = true;
      }

      // For flashcards, validate that images have accompanying text
      if (type === 'flashcards') {
        if (hasTermImage && termEmpty) {
          errors[fieldKey(card.id, 'term')] = 'imageWithoutText';
          hasErrors = true;
        }
        if (hasDefinitionImage && definitionEmpty) {
          errors[fieldKey(card.id, 'definition')] = 'imageWithoutText';
          hasErrors = true;
        }
      }
    });

    // An empty list is valid: the block accepts it, and a blank placeholder
    // card already saves as one (getContent drops it). Only real field and
    // image errors block a save.
    return { errors, isValid: !hasErrors };
  },
};

// The card and setting actions come straight from useGameState, so reuse its
// contract. `getLatestState`, `waitForPendingRequests` and `save` are consumed
// by the wrapper below, not by the view.
type ViewActions = Omit<
  GameActions,
  'getLatestState' | 'waitForPendingRequests' | 'save' | 'reload' | 'clearError'
>;

interface GameEditorProps extends ViewActions {
  onClose: (() => void) | null;
  onSave: (options?: SaveOptions) => Promise<unknown>;
  returnFunction?: EditorPluginProps['returnFunction'];
  blockFinished: boolean;
  blockId: string | null;
  blockValue?: {} | null;
  settings: GameSettings;
  type: GameType;
  list: Card[];
  loadGamesSettings: () => void;
  isDirty?: boolean | (() => boolean);
  error?: RequestError | null;
  loadFailed?: boolean;
  reload?: () => void;
  clearError?: () => void;
}

export const GameEditor = ({
  onClose,
  onSave,
  returnFunction = null,
  blockFinished,
  blockId,
  blockValue,

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
  loadGamesSettings,

  isDirty,
  error = null,
  loadFailed = false,
  reload = () => {},
  clearError = () => {},
}: GameEditorProps) => {
  const intl = useIntl();
  const [cardsData, setCardsData] = useState<Card[]>(list);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [localInputValues, setLocalInputValues] = useState<Record<string, string>>({});
  const [isAlertVisible, setIsAlertVisible] = useState(true);
  // True from the Save click until the save has settled. The form is disabled
  // meanwhile: the response closes the editor, so anything typed during the
  // wait would be lost without a word.
  const [isSaving, setIsSaving] = useState(false);
  const [imageSettingsModal, setImageSettingsModal] = useState<{
    isOpen: boolean;
    imageData: ImageData | null;
    cardIndex: number | null;
    imageType: ImageType | null;
  }>({
    isOpen: false,
    imageData: null,
    cardIndex: null,
    imageType: null,
  });

  const MAX_TERM_LENGTH = 120;
  const MAX_DEFINITION_LENGTH = 120;

  useEffect(() => {
    setCardsData(list);
  }, [list]);

  useEffect(() => {
    if (blockFinished && blockId && blockValue && !settingsLoaded) {
      loadGamesSettings();
      setSettingsLoaded(true);
    }
  }, [blockFinished, blockId, blockValue, settingsLoaded, loadGamesSettings]);

  // Latest localInputValues, for callbacks that outlive the render they were
  // created in (a save can sit waiting on an upload while the author types).
  const localInputValuesRef = useRef(localInputValues);
  localInputValuesRef.current = localInputValues;
  // Latest list, for the same reason: a pending edit is committed to the card's
  // position at commit time, which a reorder may have changed since.
  const listRef = useRef(list);
  listRef.current = list;

  // Writes one field of a card into the game state. The actions address cards
  // by position, so the position is looked up now, not when the edit began.
  const commitField = useCallback((cardId: string, field: TextField, value: string) => {
    const index = listRef.current.findIndex((card) => card.id === cardId);
    if (index < 0) { return; } // the card was removed meanwhile
    if (field === 'term') {
      updateTerm({ index, term: value });
    } else {
      updateDefinition({ index, definition: value });
    }
  }, [updateTerm, updateDefinition]);

  // Commits text that has been typed but not blurred, as a blur would.
  const flushPendingEdits = useCallback(() => {
    Object.entries(localInputValuesRef.current).forEach(([key, value]) => {
      const { cardId, field } = parseFieldKey(key);
      commitField(cardId, field, value);
    });
    setLocalInputValues({});
  }, [commitField]);

  // Text edits sit in localInputValues until blur. They must still count as
  // unsaved, or closing the editor mid-edit would discard them silently.
  const hasPendingEdits = () =>
    Object.entries(localInputValues).some(([key, value]) => {
      const { cardId, field } = parseFieldKey(key);
      return value !== (cardsData.find((card) => card.id === cardId)?.[field] || '');
    });

  const getInputValue = (card: Card, field: TextField): string => {
    const key = fieldKey(card.id, field);
    return localInputValues[key] !== undefined ? localInputValues[key] : card[field] || '';
  };

  const handleInputChange = useCallback((cardId: string, field: TextField, value: string) => {
    const key = fieldKey(cardId, field);

    setLocalInputValues(prev => ({ ...prev, [key]: value }));

    setValidationErrors(prev => {
      if (prev[key]) {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const handleInputBlur = useCallback((cardId: string, field: TextField) => {
    const key = fieldKey(cardId, field);
    const value = localInputValues[key];

    if (value !== undefined) {
      commitField(cardId, field, value);

      // Clear local state
      setLocalInputValues(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  }, [localInputValues, commitField]);

  const getCardErrors = (card: Card) => ({
    termError: validationErrors[fieldKey(card.id, 'term')] || false,
    definitionError: validationErrors[fieldKey(card.id, 'definition')] || false,
  });

  // Validates the cards as the author sees them. Text typed into a field that
  // has not blurred yet is still local, and a Save click does not blur it in
  // every browser (Safari, and Firefox on macOS, leave focus where it was).
  const validateAllCards = useCallback(() => {
    const pending = localInputValuesRef.current;
    const visible = list.map((card) => ({
      ...card,
      term: pending[fieldKey(card.id, 'term')] ?? card.term,
      definition: pending[fieldKey(card.id, 'definition')] ?? card.definition,
    }));
    const { errors, isValid } = hooks.validateCards({ list: visible, type });
    setValidationErrors(errors);
    return isValid;
  }, [list, type]);

  // Show alert when new validation errors appear
  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      setIsAlertVisible(true);
    }
  }, [validationErrors]);

  const cardsWithErrors = useMemo(() => {
    const errorCards = new Set<string>();
    Object.keys(validationErrors).forEach((key) => {
      errorCards.add(key.slice(0, key.lastIndexOf('_')));
    });
    return errorCards;
  }, [validationErrors]);

  useEffect(() => {
    if (cardsWithErrors.size === 0) {
      return;
    }

    const cardsToExpand: number[] = [];
    cardsWithErrors.forEach((id) => {
      const index = list.findIndex((card) => card.id === id);
      if (index >= 0 && !list[index].editorOpen) {
        cardsToExpand.push(index);
      }
    });

    // Only call toggleOpen if there are actually cards to expand
    if (cardsToExpand.length > 0) {
      cardsToExpand.forEach(index => {
        toggleOpen({ index, isOpen: true });
      });
    }
  }, [cardsWithErrors, list, toggleOpen]);

  const getDescriptionHeader = () => {
    switch (type) {
      case 'flashcards':
        return intl.formatMessage(messages.descriptionHeaderFlashcard);
      case 'matching':
        return intl.formatMessage(messages.descriptionHeaderMatching);
      default:
        return intl.formatMessage(messages.undefined);
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'flashcards':
        return intl.formatMessage(messages.descriptionFlashcard);
      case 'matching':
        return intl.formatMessage(messages.descriptionMatching);
      default:
        return intl.formatMessage(messages.undefined);
    }
  };

  const fileInput = (index: number, imageType: ImageType) =>
    document.getElementById(`${imageType}_image_upload|${index}`) as HTMLInputElement | null;

  const handleImageUpload = useCallback((index: number, imageType: ImageType) => {
    const input = fileInput(index, imageType);
    const file = input?.files?.[0];
    // Clear the selection now: a browser fires no `change` for re-choosing the
    // same file, so a failed upload could otherwise not be retried with it.
    // The File object is independent of the selection and stays usable.
    if (input) { input.value = ''; }
    if (file) {
      // Fire and forget: the hook tracks the request and reports its failure.
      void uploadGameImage({ index, cardId: list[index]?.id, imageFile: file, imageType });
    }
  }, [uploadGameImage, list]);

  const handleImageRemove = useCallback((index: number, imageType: ImageType, filePath: string) => {
    const input = fileInput(index, imageType);
    if (input) { input.value = ''; }
    deleteGameImage({ index, cardId: list[index]?.id, imageType, filePath });
  }, [deleteGameImage, list]);

  // The save revalidates after waiting on image requests, by which point this
  // component's own check (validateEntry, run at the click) is out of date.
  // Show what it found the same way.
  //
  // `flushPendingEdits` goes the other way: the save calls it just before it
  // reads the state to persist, so text typed while it was waiting is included.
  const handleSave = useCallback(() => {
    setIsSaving(true);
    return Promise.resolve(onSave({ beforePersist: flushPendingEdits }))
      .catch((saveError) => {
        if (saveError?.validationErrors) {
          setValidationErrors(saveError.validationErrors);
        }
        throw saveError;
      })
      .finally(() => setIsSaving(false));
  }, [onSave, flushPendingEdits]);

  const saveTermImage = useCallback((index: number) => handleImageUpload(index, 'term'), [handleImageUpload]);
  const saveDefinitionImage = useCallback((index: number) => handleImageUpload(index, 'definition'), [
    handleImageUpload,
  ]);

  const moveCardUp = useCallback((index: number) => {
    if (index === 0) { return; }
    const temp = cardsData.slice();
    [temp[index], temp[index - 1]] = [temp[index - 1], temp[index]];
    setCardsData(temp);
    setList(temp);
  }, [cardsData, setList]);

  const moveCardDown = useCallback((index: number) => {
    if (index === cardsData.length - 1) { return; }
    const temp = cardsData.slice();
    [temp[index + 1], temp[index]] = [temp[index], temp[index + 1]];
    setCardsData(temp);
    setList(temp);
  }, [cardsData, setList]);

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
      <AlertHeading className="font-size-normal">
        {intl.formatMessage(messages.loadErrorHeading)}
      </AlertHeading>
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

  const renderImageDisplay = useCallback(
    (imageUrl: string, filePath: string, index: number, imageType: ImageType, altText: string) => (
      <div className="card-image-area d-flex align-items-center align-self-stretch">
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id={`image-settings-tooltip-${imageType}-${index}`}>
              <PlainIconButton
                src={PictureIcon}
                iconAs={Icon}
                alt={intl.formatMessage(messages.imageSettingsTooltip)}
                variant="plain"
              />
            </Tooltip>
          }
        >
          <div
            role="button"
            tabIndex={0}
            // Named here, not by the image inside: a decorative image has an
            // empty alt, which would leave this button with no name.
            aria-label={intl.formatMessage(messages.imageSettingsTooltip)}
            // Outside the disabled fieldset, so locked by hand: an alt-text
            // change made while a save is out is not in that save's payload.
            aria-disabled={isSaving}
            style={{ cursor: isSaving ? 'default' : 'pointer', display: 'inline-block' }}
            onClick={() => {
              if (isSaving) { return; }
              setImageSettingsModal({
                isOpen: true,
                imageData: {
                  url: imageUrl,
                  altText: altText || '',
                },
                cardIndex: index,
                imageType,
              });
            }}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !isSaving) {
                e.preventDefault();
                setImageSettingsModal({
                  isOpen: true,
                  imageData: {
                    url: imageUrl,
                    altText: altText || '',
                  },
                  cardIndex: index,
                  imageType,
                });
              }
            }}
          >
            {
              /* An empty alt is the author's "decorative" choice (see
                GameImageSettingsModal) and must stay empty. */
            }
            <img
              className="card-image"
              src={imageUrl}
              alt={altText}
            />
          </div>
        </OverlayTrigger>
        <IconButton
          src={DeleteOutline}
          iconAs={Icon}
          alt={intl.formatMessage(messages.removeImageLabel)}
          variant="primary"
          onClick={() => handleImageRemove(index, imageType, filePath)}
        />
      </div>
    ),
    [handleImageRemove, intl, isSaving],
  );

  const renderImageUploadButton = useCallback((index: number, imageType: ImageType) => (
    <IconButton
      src={PictureIcon}
      iconAs={Icon}
      alt={intl.formatMessage(messages.addImageLabel)}
      variant="dark"
      onClick={() => fileInput(index, imageType)?.click()}
    />
  ), [intl]);

  const handleImageSettingsSave = useCallback((altTextData: { altText: string; }) => {
    // A modal that was already open when Save was clicked must not write
    // into a save that has already gone out.
    if (isSaving) { return; }
    const { cardIndex, imageType } = imageSettingsModal;
    const altText = altTextData.altText || '';

    // No card is selected only while the modal is closed, when it cannot save.
    if (cardIndex !== null) {
      if (imageType === 'term') {
        updateTermImageAlt({ index: cardIndex, termImageAlt: altText });
      } else if (imageType === 'definition') {
        updateDefinitionImageAlt({ index: cardIndex, definitionImageAlt: altText });
      }
    }

    setImageSettingsModal({
      isOpen: false,
      imageData: null,
      cardIndex: null,
      imageType: null,
    });
  }, [imageSettingsModal, updateTermImageAlt, updateDefinitionImageAlt, isSaving]);

  const termImageDiv = (card: Card, index: number) =>
    renderImageDisplay(card.term_image, card.term_image_path, index, 'term', card.term_image_alt);
  const termImageUploadButton = (_card: Card, index: number) => renderImageUploadButton(index, 'term');
  const definitionImageDiv = (card: Card, index: number) =>
    renderImageDisplay(
      card.definition_image,
      card.definition_image_path,
      index,
      'definition',
      card.definition_image_alt,
    );
  const definitionImageUploadButton = (_card: Card, index: number) => renderImageUploadButton(index, 'definition');

  const timerSettingsOption = (
    <SettingsOption
      className="sidebar-timer d-flex flex-column align-items-start align-self-stretch"
      title={intl.formatMessage(messages.timerLabel)}
      summary={intl.formatMessage(settings.timer ? messages.onLabel : messages.offLabel)}
      isCardCollapsibleOpen="true"
    >
      <>
        <div className="settings-description">{intl.formatMessage(messages.timerSettingsDescription)}</div>
        <div className="d-flex flex-row gap-0 w-100">
          <Button
            onClick={() => setTimerStatus(false)}
            variant={!settings.timer ? 'primary' : 'outline-primary'}
            className="toggle-button rounded-0 timer-toggle-button"
          >
            {intl.formatMessage(messages.offLabel)}
          </Button>
          <Button
            onClick={() => setTimerStatus(true)}
            variant={settings.timer ? 'primary' : 'outline-primary'}
            className="toggle-button rounded-0 timer-toggle-button"
          >
            {intl.formatMessage(messages.onLabel)}
          </Button>
        </div>
      </>
    </SettingsOption>
  );

  const page = (
    <div className="page-body d-flex align-items-start">
      <div className="terms d-flex flex-column align-items-start align-self-stretch">
        <div className="description d-flex flex-row align-items-start align-self-stretch">
          <div className="description-header">
            {getDescriptionHeader()}
          </div>
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip id="description-tooltip">
                {getDescription()}
              </Tooltip>
            }
          >
            <Icon src={InfoOutline} />
          </OverlayTrigger>
        </div>
        <DraggableList
          itemList={cardsData}
          setState={setCardsData}
          updateOrder={() => (newList) => setList(newList)}
        >
          {cardsData.map((card, index) => (
            <SortableItem
              id={card.id}
              key={card.id}
              actions={null}
              actionStyle={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                zIndex: 2,
              }}
              componentStyle={{
                background: 'white',
                borderRadius: '6px',
                boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.15), 0 1px 2px 0 rgba(0, 0, 0, 0.15)',
                position: 'relative',
                width: '100%',
                flexDirection: 'column',
              }}
            >
              <Collapsible.Advanced
                className="card"
                open={card.editorOpen}
                onToggle={(isOpen) => toggleOpen({ index, isOpen })}
              >
                <input
                  type="file"
                  id={`term_image_upload|${index}`}
                  hidden
                  onChange={() => saveTermImage(index)}
                  accept="image/png, image/jpeg, image/gif, image/webp"
                />
                <input
                  type="file"
                  id={`definition_image_upload|${index}`}
                  hidden
                  onChange={() => saveDefinitionImage(index)}
                  accept="image/png, image/jpeg, image/gif, image/webp"
                />
                <div className="card-heading-row">
                  <Collapsible.Trigger className="card-heading-wrapper">
                    <div className="card-heading d-flex align-items-center align-self-stretch">
                      <div className="card-number">{index + 1}</div>
                      {!card.editorOpen
                        ? (
                          <div className="preview-block position-relative w-100">
                            <span className="align-middle">
                              <span className="preview-term">
                                {type === 'flashcards'
                                  ? (
                                    <span
                                      className={`d-flex align-items-center mr-2 img-preview-wrapper ${
                                        card.term_image !== '' ? 'with-img' : 'with-icon'
                                      }`}
                                    >
                                      {card.term_image !== ''
                                        ? (
                                          <img
                                            className="img-preview"
                                            src={card.term_image}
                                            alt={card.term_image_alt}
                                          />
                                        )
                                        : (
                                          <OverlayTrigger
                                            placement="top"
                                            overlay={
                                              <Tooltip id="no-term-image-tooltip">
                                                {intl.formatMessage(messages.noImageLabel)}
                                              </Tooltip>
                                            }
                                          >
                                            <Icon className="img-preview" src={PictureIcon} />
                                          </OverlayTrigger>
                                        )}
                                    </span>
                                  )
                                  : ''}
                                {card.term !== ''
                                  ? card.term
                                  : <span className="text-gray">{intl.formatMessage(messages.noTextLabel)}</span>}
                              </span>
                              <span className="preview-definition">
                                {type === 'flashcards'
                                  ? (
                                    <span
                                      className={`d-flex align-items-center mr-2 img-preview-wrapper ${
                                        card.definition_image !== '' ? 'with-img' : 'with-icon'
                                      }`}
                                    >
                                      {card.definition_image !== ''
                                        ? (
                                          <img
                                            className="img-preview"
                                            src={card.definition_image}
                                            alt={card.definition_image_alt}
                                          />
                                        )
                                        : (
                                          <OverlayTrigger
                                            placement="top"
                                            overlay={
                                              <Tooltip id="no-definition-image-tooltip">
                                                {intl.formatMessage(messages.noImageLabel)}
                                              </Tooltip>
                                            }
                                          >
                                            <Icon className="img-preview" src={PictureIcon} />
                                          </OverlayTrigger>
                                        )}
                                    </span>
                                  )
                                  : ''}
                                {card.definition !== ''
                                  ? card.definition
                                  : <span className="text-gray">{intl.formatMessage(messages.noTextLabel)}</span>}
                              </span>
                            </span>
                          </div>
                        )
                        : <div className="card-spacer d-flex align-self-stretch" />}
                    </div>
                  </Collapsible.Trigger>
                  {/* Siblings of the trigger: a button nested in a button is invalid markup. */}
                  <Dropdown>
                    <Dropdown.Toggle
                      className="card-dropdown"
                      as={IconButton}
                      src={MoreHoriz}
                      iconAs={Icon}
                      alt={intl.formatMessage(messages.cardActionsLabel)}
                      variant="primary"
                    />
                    <Dropdown.Menu align="right">
                      <Dropdown.Item onClick={() => moveCardUp(index)}>
                        {intl.formatMessage(messages.moveUpLabel)}
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => moveCardDown(index)}>
                        {intl.formatMessage(messages.moveDownLabel)}
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={() => removeCard({ index })}>
                        {intl.formatMessage(messages.deleteLabel)}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  <IconButton
                    src={card.editorOpen ? ExpandLess : ExpandMore}
                    iconAs={Icon}
                    alt={intl.formatMessage(card.editorOpen ? messages.collapseCardLabel : messages.expandCardLabel)}
                    variant="primary"
                    onClick={() => toggleOpen({ index, isOpen: !card.editorOpen })}
                  />
                </div>
                <div className="card-body p-0">
                  <Collapsible.Body>
                    <div className="card-divider" />
                    <div className="card-term d-flex flex-column align-items-start align-self-stretch">
                      <Form.Label htmlFor={`term|${index}`} className="mb-0">
                        {intl.formatMessage(messages.termLabel)}
                      </Form.Label>
                      {(type !== 'matching' && card.term_image !== '') && termImageDiv(card, index)}
                      <div className="term-input-area d-flex flex-column align-items-start align-self-stretch">
                        <div className="card-input-line d-flex align-items-start align-self-stretch">
                          <Form.Control
                            className="d-flex flex-column align-items-start align-self-stretch"
                            id={`term|${index}`}
                            placeholder={intl.formatMessage(messages.enterYourTerm)}
                            value={getInputValue(card, 'term')}
                            onChange={(e) => handleInputChange(card.id, 'term', e.target.value)}
                            onBlur={() => handleInputBlur(card.id, 'term')}
                            style={{ borderRadius: 0 }}
                            maxLength={MAX_TERM_LENGTH}
                            isInvalid={getCardErrors(card).termError}
                          />
                          {type !== 'matching' && termImageUploadButton(card, index)}
                        </div>
                        <div
                          className={`d-flex justify-content-between align-items-center align-self-stretch ${
                            type !== 'matching' ? 'mr-5' : ''
                          }`}
                        >
                          <span>
                            {getCardErrors(card).termError && (
                              <Form.Control.Feedback type="invalid" hasIcon={false}>
                                {validationErrors[fieldKey(card.id, 'term')] === 'imageWithoutText'
                                  ? intl.formatMessage(messages.imageWithoutTextError)
                                  : intl.formatMessage(messages.termValidationError)}
                              </Form.Control.Feedback>
                            )}
                          </span>
                          <small className="text-muted mr-1">
                            {getInputValue(card, 'term').length}/{MAX_TERM_LENGTH}
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="card-divider" />
                    <div className="card-definition d-flex flex-column align-items-start align-self-stretch">
                      <Form.Label htmlFor={`definition|${index}`} className="mb-0">
                        {intl.formatMessage(messages.definitionLabel)}
                      </Form.Label>
                      {(type !== 'matching' && card.definition_image !== '') && definitionImageDiv(card, index)}
                      <div className="definition-input-area d-flex flex-column align-items-start align-self-stretch">
                        <div className="card-input-line d-flex align-items-start align-self-stretch">
                          <Form.Control
                            className="d-flex flex-column align-items-start align-self-stretch"
                            id={`definition|${index}`}
                            placeholder={intl.formatMessage(messages.enterYourDefinition)}
                            value={getInputValue(card, 'definition')}
                            onChange={(e) => handleInputChange(card.id, 'definition', e.target.value)}
                            onBlur={() => handleInputBlur(card.id, 'definition')}
                            maxLength={MAX_DEFINITION_LENGTH}
                            style={{ borderRadius: 0 }}
                            isInvalid={getCardErrors(card).definitionError}
                          />
                          {type !== 'matching' && definitionImageUploadButton(card, index)}
                        </div>
                        <div
                          className={`d-flex justify-content-between align-items-center align-self-stretch ${
                            type !== 'matching' ? 'mr-5' : ''
                          }`}
                        >
                          <span>
                            {getCardErrors(card).definitionError && (
                              <Form.Control.Feedback type="invalid" hasIcon={false}>
                                {validationErrors[fieldKey(card.id, 'definition')] === 'imageWithoutText'
                                  ? intl.formatMessage(messages.imageWithoutTextError)
                                  : intl.formatMessage(messages.definitionValidationError)}
                              </Form.Control.Feedback>
                            )}
                          </span>
                          <small className="text-muted mr-1">
                            {getInputValue(card, 'definition').length}/{MAX_DEFINITION_LENGTH}
                          </small>
                        </div>
                      </div>
                    </div>
                  </Collapsible.Body>
                </div>
              </Collapsible.Advanced>
            </SortableItem>
          ))}
        </DraggableList>
        <Button
          className="add-button"
          onClick={() => addCard()}
          iconBefore={Plus}
          variant="link"
          size="inline"
        >
          {intl.formatMessage(messages.addLabel)}
        </Button>
      </div>
      <div className="sidebar d-flex flex-column align-items-start flex-shrink-0">
        <div className="sidebar-header d-flex align-items-center align-self-stretch">
          <span className="sidebar-title">{intl.formatMessage(messages.settingsTitle)}</span>
        </div>
        <SettingsOption
          className="sidebar-type d-flex flex-column align-items-start align-self-stretch"
          title={intl.formatMessage(messages.typeLabel)}
          summary={intl.formatMessage(type === 'matching' ? messages.matchingLabel : messages.flashcardsLabel)}
          isCardCollapsibleOpen="true"
        >
          <Button
            onClick={() => updateType('flashcards')}
            className="type-button"
          >
            <span className="small text-primary-500">{intl.formatMessage(messages.flashcardsLabel)}</span>
            <span hidden={type !== 'flashcards'}>
              <Icon src={Check} className="text-success" />
            </span>
          </Button>
          <div className="card-divider" />
          <Button
            onClick={() => updateType('matching')}
            className="type-button"
          >
            <span className="small text-primary-500">{intl.formatMessage(messages.matchingLabel)}</span>
            <span hidden={type !== 'matching'}>
              <Icon src={Check} className="text-success" />
            </span>
          </Button>
        </SettingsOption>
        <SettingsOption
          className="sidebar-shuffle d-flex flex-column align-items-start align-self-stretch"
          title={intl.formatMessage(messages.shuffleLabel)}
          summary={intl.formatMessage(settings.shuffle ? messages.onLabel : messages.offLabel)}
          isCardCollapsibleOpen="true"
        >
          <>
            <div className="settings-description">{intl.formatMessage(messages.shuffleSettingsDescription)}</div>
            <div className="d-flex flex-row gap-0 w-100">
              <Button
                onClick={() => setShuffleStatus(false)}
                variant={!settings.shuffle ? 'primary' : 'outline-primary'}
                className="toggle-button rounded-0 shuffle-toggle-button"
              >
                {intl.formatMessage(messages.offLabel)}
              </Button>
              <Button
                onClick={() => setShuffleStatus(true)}
                variant={settings.shuffle ? 'primary' : 'outline-primary'}
                className="toggle-button rounded-0 shuffle-toggle-button"
              >
                {intl.formatMessage(messages.onLabel)}
              </Button>
            </div>
          </>
        </SettingsOption>
        {type === 'matching' && timerSettingsOption}
      </div>
    </div>
  );

  return (
    <EditorContainer
      getContent={() => hooks.getContent({ type, settings, list })}
      onClose={onClose}
      // For the container's cancel and discard flows; the save path below
      // honours it itself.
      returnFunction={returnFunction}
      // The plugin saves through the block's own handler. Without this the host
      // app's saveBlock thunk takes over, and its payload builder drops the
      // *_image_path storage keys, losing the link from a card to its file.
      onSave={handleSave}
      isDirty={() => (typeof isDirty === 'function' ? isDirty() : isDirty) || hasPendingEdits()}
      // Until the block's settings have loaded the list is a placeholder blank
      // card, which validates clean and would overwrite the real content.
      validateEntry={() => blockFinished && validateAllCards()}
    >
      <div className="xblock-games-editor">
        <div className="editor-body h-75 overflow-auto">
          {Object.keys(validationErrors).length > 0 && isAlertVisible && (
            <Alert
              variant="danger"
              className="mt-2"
              icon={Info}
              dismissible
              onClose={() => setIsAlertVisible(false)}
            >
              <AlertHeading className="font-size-normal">
                {intl.formatMessage(messages.validationErrorHeading)}
              </AlertHeading>
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
              <AlertHeading className="font-size-normal">
                {intl.formatMessage(
                  error.code === 'saveFailed' ? messages.saveErrorHeading : messages.requestErrorHeading,
                )}
              </AlertHeading>
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
      <GameImageSettingsModal
        key={`${imageSettingsModal.cardIndex}-${imageSettingsModal.imageType}-${imageSettingsModal.imageData?.url}`}
        isOpen={imageSettingsModal.isOpen}
        close={() =>
          setImageSettingsModal({
            isOpen: false,
            imageData: null,
            cardIndex: null,
            imageType: null,
          })}
        imageData={imageSettingsModal.imageData}
        onSave={handleImageSettingsSave}
        isSaveDisabled={isSaving}
      />
    </EditorContainer>
  );
};

/**
 * Slot-facing entry point.
 *
 * XBlockEditorSlot hands the plugin `blockId`, `onClose` and friends; the
 * editor's data lives in `useGameState`, so nothing here touches the host
 * app's Redux store.
 */
/**
 * Mirrors the host app's post-save course refresh so the outline picks up the
 * change. The host does this inside its own saveBlock thunk, which the plugin
 * no longer goes through.
 */
const triggerCourseRefresh = () => {
  const storageKey = 'courseRefreshTriggerOnComponentEditSave';
  const now = Date.now().toString();
  try {
    // Session storage, as the host's save uses: it keeps the signal to this
    // tab, where local storage would also fire it in every other Studio tab.
    sessionStorage.setItem(storageKey, now);
    window.dispatchEvent(new StorageEvent('storage', { key: storageKey, newValue: now }));
  } catch {
    // Storage can be unavailable (private mode); the refresh is a nicety.
  }
};

/**
 * Whether the block's handler URLs are issued by the server (v2 libraries)
 * rather than fixed. This is the same test the host applies before it builds
 * a v2 library URL: an `lb:` block, or a `lib:` learning context. Legacy (v1)
 * libraries are deliberately not included: their blocks have legacy usage
 * keys, which the v2 resolver rejects, and they use the fixed route.
 */
const isLibraryBlock = (blockId: string, learningContextId: string | null) =>
  blockId.startsWith('lb:') || isLibraryKey(learningContextId);

const GamesEditorForBlock = ({
  blockId = null,
  learningContextId = null,
  studioEndpointUrl = null,
  onClose = null,
  returnFunction = null,
}: EditorPluginProps) => {
  // Everything the API layer needs to reach this block. The host names the
  // Studio to use; the global config is only a fallback for a caller that
  // does not (the standalone editor route passes the global anyway).
  const block = React.useMemo(() => (blockId
    ? {
      blockId,
      studioEndpointUrl: studioEndpointUrl ?? getConfig().STUDIO_BASE_URL,
      isLibrary: isLibraryBlock(blockId, learningContextId),
    }
    : null), [blockId, studioEndpointUrl, learningContextId]);
  const { state, actions } = useGameState(block);
  // False once this editor has gone away (Cancel -> Discard changes, or the
  // host moving to another block). A save can still be waiting on an upload at
  // that point, and must not go on to persist what the author walked away from.
  const mountedRef = React.useRef(true);
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);
  // The title lives in the host's editor store, which EditorContainer's title
  // header writes to; read it from the same place the host's save did.
  const blockTitle = useSelector(selectors.app.blockTitle);
  // Read at persist time, not at the Save click, so the save carries whatever
  // the store holds when it goes out. EditorContainer locks the title header
  // for the length of the save, so it cannot change after that.
  const blockTitleRef = React.useRef(blockTitle);
  blockTitleRef.current = blockTitle;
  const returnUrl = useSelector(selectors.app.returnUrl);
  // The title is saved by this editor but edited in the host's header, so the
  // game state never sees it change. Compare against the block as loaded.
  const blockValue = useSelector(selectors.app.blockValue);
  const isTitleDirty = !!blockValue && (blockTitle ?? '') !== (blockValue.data?.display_name ?? '');
  // Set the moment the block accepts a save. The container arms the
  // leave-page warning on `isDirty` until the save has resolved, but this
  // editor navigates away (a beforeunload) before that, so it has to answer
  // "nothing unsaved" itself from that point. A ref, not state: the navigation
  // happens in the same tick, before any re-render.
  const persistedRef = React.useRef(false);
  const isDirty = React.useCallback(
    () => !persistedRef.current && (state.isDirty || isTitleDirty),
    [state.isDirty, isTitleDirty],
  );

  const handleSave = React.useCallback(({ beforePersist }: SaveOptions = {}) => {
    if (!state.isLoaded) {
      return Promise.reject(new Error('Game settings have not loaded yet; refusing to save.'));
    }
    // An image upload may still be in flight. Wait for it, then
    // read the state as it stands afterwards; otherwise the card is written
    // without the image change and the editor closes on top of it.
    return actions.waitForPendingRequests()
      .then(() => {
        if (!mountedRef.current) {
          throw new Error('The editor was closed before the save went out; nothing was saved.');
        }
        // Text typed during the wait is still in the component; pull it in.
        if (beforePersist) { beforePersist(); }
        const latest = actions.getLatestState();
        // Validation ran at the click, before the wait. An upload that landed
        // since can have made a card invalid (an image with no text).
        const { errors, isValid } = hooks.validateCards(latest);
        if (!isValid) {
          throw Object.assign(new Error('Game cards failed validation.'), { validationErrors: errors });
        }
        const content = hooks.getContent({
          type: latest.type,
          settings: latest.settings,
          list: latest.list,
        });
        return actions.save({
          gameType: content.gameType,
          isShuffled: content.isShuffled,
          hasTimer: content.hasTimer,
          cards: content.cards,
          title: blockTitleRef.current,
        });
      })
      .then((response) => {
        persistedRef.current = true;
        // The save did land, so the outline still needs to pick it up.
        triggerCourseRefresh();
        // The author may have closed this editor while the request was out. Its
        // close/navigate callbacks now belong to whatever the host shows next
        // (possibly another block's editor), so they must not run.
        if (!mountedRef.current) { return response; }
        // Same contract as the host's navigateCallback.
        if (returnFunction) {
          returnFunction()(response.data);
        } else if (onClose) {
          onClose();
        } else {
          // The standalone editor route supplies neither; go back to where the
          // built-in save would have (see navigateCallback in editors/hooks).
          editorHooks.navigateTo(returnUrl);
        }
        return response;
      });
  }, [actions, state.isLoaded, returnFunction, onClose, returnUrl]);

  return (
    <GameEditor
      onClose={onClose}
      onSave={handleSave}
      returnFunction={returnFunction}
      blockId={blockId}
      // The load is owned by useGameState, so the editor is "finished" as soon
      // as that first fetch resolves.
      blockFinished={state.isLoaded}
      blockValue={state.isLoaded ? {} : null}
      loadGamesSettings={() => {}}
      settings={state.settings}
      type={state.type}
      list={state.list}
      isDirty={isDirty}
      error={state.error}
      loadFailed={state.loadFailed}
      {...actions}
    />
  );
};

/**
 * One editor instance per block. Keying on the block id remounts everything
 * when the host moves to another block without unmounting, so the previous
 * block's cards, pending uploads and waiting saves cannot leak into the new one
 * (its cards would otherwise stay "loaded", and saveable, until the new fetch
 * resolved).
 */
const GamesEditorPlugin = (props: EditorPluginProps) => {
  const { blockId, studioEndpointUrl } = props;
  // The Studio endpoint is part of the block's identity here: the same id on a
  // different Studio is different content, and must start over the same way.
  return <GamesEditorForBlock key={`${blockId}|${studioEndpointUrl ?? ''}`} {...props} />;
};

export default GamesEditorPlugin;
