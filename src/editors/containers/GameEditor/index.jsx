/* eslint-disable no-unused-vars */
/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
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
} from '@openedx/paragon';
import {
  DeleteOutline,
  Plus,
  ExpandMore,
  ExpandLess,
  InsertPhoto,
  MoreHoriz,
  InfoOutline,
  Check,
  Info,
} from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import {
  actions,
  selectors,
  thunkActions,
} from '../../data/redux';
import {
  RequestKeys,
} from '../../data/constants/requests';
import './index.scss';
import EditorContainer from '../EditorContainer';
import SettingsOption from '../ProblemEditor/components/EditProblemView/SettingsWidget/SettingsOption';
import Button from '../../sharedComponents/Button';
import DraggableList, { SortableItem } from '../../../generic/DraggableList';
import messages from './messages';

export const hooks = {
  getContent: ({ type, settings, list }) => ({
    gameType: type,
    isShuffled: settings.shuffle,
    hasTimer: settings.timer,
    cards: list,
  }),
};

export const GameEditor = ({
  onClose,
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
  toggleOpen,
  setList,
  addCard,
  removeCard,

  uploadGameImage,
  deleteGameImage,
  loadGamesSettings,

  isDirty,
}) => {
  const intl = useIntl();
  const [cardsData, setCardsData] = React.useState(list);
  const [settingsLoaded, setSettingsLoaded] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState({});
  const [localInputValues, setLocalInputValues] = React.useState({});

  const MAX_TERM_LENGTH = 120;
  const MAX_DEFINITION_LENGTH = 120;

  React.useEffect(() => {
    setCardsData(list);
  }, [list]);

  React.useEffect(() => {
    if (blockFinished && blockId && blockValue && !settingsLoaded) {
      loadGamesSettings();
      setSettingsLoaded(true);
    }
  }, [blockFinished, blockId, blockValue, settingsLoaded, loadGamesSettings]);

  const getInputValue = (index, field) => {
    const key = `${index}_${field}`;
    return localInputValues[key] !== undefined ? localInputValues[key] : cardsData[index]?.[field] || '';
  };

  const handleInputChange = React.useCallback((index, field, value) => {
    const key = `${index}_${field}`;

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

  const handleInputBlur = React.useCallback((index, field) => {
    const key = `${index}_${field}`;
    const value = localInputValues[key];

    if (value !== undefined) {
      // Update Redux state
      const updateFn = field === 'term' ? updateTerm : updateDefinition;
      updateFn({ index, [field]: value });

      // Clear local state
      setLocalInputValues(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  }, [localInputValues, updateTerm, updateDefinition]);

  const getCardErrors = (card, index) => ({
    termError: (validationErrors && validationErrors[`${index}_term`]) || false,
    definitionError: (validationErrors && validationErrors[`${index}_definition`]) || false,
  });

  const validateAllCards = useCallback(() => {
    const errors = {};
    let hasErrors = false;

    list.forEach((card, index) => {
      const termEmpty = !card.term.trim();
      const definitionEmpty = !card.definition.trim();

      if (termEmpty && definitionEmpty) {
        return;
      }

      if (termEmpty && !definitionEmpty) {
        errors[`${index}_term`] = true;
        hasErrors = true;
      }

      if (!termEmpty && definitionEmpty) {
        errors[`${index}_definition`] = true;
        hasErrors = true;
      }
    });

    setValidationErrors(errors);
    return !hasErrors;
  }, [list]);

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

  const handleImageUpload = useCallback((index, imageType) => {
    const id = `${imageType}_image_upload|${index}`;
    const file = document.getElementById(id).files[0];
    if (file) {
      uploadGameImage({ index, imageFile: file, imageType });
    }
  }, [uploadGameImage]);

  const handleImageRemove = useCallback((index, imageType, imageUrl) => {
    const id = `${imageType}_image_upload|${index}`;
    document.getElementById(id).value = '';
    const filePath = imageUrl.replace(/^\/media\//, '');
    deleteGameImage({ index, imageType, filePath });
  }, [deleteGameImage]);

  const saveTermImage = useCallback((index) => handleImageUpload(index, 'term'), [handleImageUpload]);
  const saveDefinitionImage = useCallback((index) => handleImageUpload(index, 'definition'), [handleImageUpload]);

  const moveCardUp = useCallback((index) => {
    if (index === 0) { return; }
    const temp = cardsData.slice();
    [temp[index], temp[index - 1]] = [temp[index - 1], temp[index]];
    setCardsData(temp);
  }, [cardsData]);

  const moveCardDown = useCallback((index) => {
    if (index === cardsData.length - 1) { return; }
    const temp = cardsData.slice();
    [temp[index + 1], temp[index]] = [temp[index], temp[index + 1]];
    setCardsData(temp);
  }, [cardsData]);

  const loading = (
    <div className="text-center p-6">
      <Spinner
        animation="border"
        className="m-3"
        screenreadertext={intl.formatMessage(messages.loadingSpinner)}
      />
    </div>
  );

  const renderImageDisplay = useCallback((imageUrl, index, imageType) => (
    <div className="card-image-area d-flex align-items-center align-self-stretch">
      <img className="card-image" src={`${getConfig().STUDIO_BASE_URL}${imageUrl}`} alt={`${imageType.toUpperCase()}_IMG`} />
      <IconButton
        src={DeleteOutline}
        iconAs={Icon}
        alt="DEL_IMG"
        variant="primary"
        onClick={() => handleImageRemove(index, imageType, imageUrl)}
      />
    </div>
  ), [handleImageRemove]);

  const renderImageUploadButton = useCallback((index, imageType) => (
    <IconButton
      src={InsertPhoto}
      iconAs={Icon}
      alt="IMG"
      variant="primary"
      onClick={() => document.getElementById(`${imageType}_image_upload|${index}`).click()}
    />
  ), []);

  const termImageDiv = (card, index) => renderImageDisplay(card.term_image, index, 'term');
  const termImageUploadButton = (card, index) => renderImageUploadButton(index, 'term');
  const definitionImageDiv = (card, index) => renderImageDisplay(card.definition_image, index, 'definition');
  const definitionImageUploadButton = (card, index) => renderImageUploadButton(index, 'definition');

  const timerSettingsOption = (
    <SettingsOption
      className="sidebar-timer d-flex flex-column align-items-start align-self-stretch"
      title={intl.formatMessage(messages.timerLabel)}
      summary={settings.timer ? 'On' : 'Off'}
      isCardCollapsibleOpen="true"
    >
      <>
        <div className="settings-description">{intl.formatMessage(messages.timerSettingsDescription)}</div>
        <div className="d-flex flex-row gap-0 w-100">
          <Button
            onClick={() => setTimerStatus(false)}
            variant={!settings.timer ? 'primary' : 'outline-primary'}
            className="toggle-button rounded-0"
          >
            {intl.formatMessage(messages.offLabel)}
          </Button>
          <Button
            onClick={() => setTimerStatus(true)}
            variant={settings.timer ? 'primary' : 'outline-primary'}
            className="toggle-button rounded-0"
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
            overlay={(
              <Tooltip id="description-tooltip">
                {getDescription()}
              </Tooltip>
            )}
          >
            <Icon
              src={InfoOutline}
              className="ml-2"
            />
          </OverlayTrigger>
        </div>
        <DraggableList
          className="d-flex flex-column align-items-start align-self-stretch"
          itemList={cardsData}
          setState={setCardsData}
          updateOrder={() => (newList) => setList(newList)}
        >
          {
            cardsData.map((card, index) => (
              <SortableItem
                id={card.id}
                key={card.id}
                buttonClassName="draggable-button"
                actionStyle={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  zIndex: 2,
                }}
                componentStyle={{
                  background: 'white',
                  borderRadius: '6px',
                  marginBottom: '16px',
                  boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.15), 0 1px 2px 0 rgba(0, 0, 0, 0.15)',
                  position: 'relative',
                  width: '100%',
                  flexDirection: 'column',
                }}
              >
                <Collapsible.Advanced
                  className="card"
                  defaultOpen={card.editorOpen}
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
                  <Collapsible.Trigger className="card-heading-wrapper">
                    <div className="card-heading d-flex align-items-center align-self-stretch">
                      <div className="card-number">{index + 1}</div>
                      {!card.editorOpen ? (
                        <div className="preview-block position-relative w-100">
                          <span className="align-middle">
                            <span className="preview-term">
                              {type === 'flashcards' ? (
                                <span className="d-inline-block align-middle pr-2">
                                  {card.term_image !== ''
                                    ? <img className="img-preview" src={`${card.term_image}`} alt="TERM_IMG_PRV" />
                                    : <Icon className="img-preview" src={InsertPhoto} />}
                                </span>
                              )
                                : ''}
                              {card.term !== '' ? card.term : <span className="text-gray">{intl.formatMessage(messages.noTextLabel)}</span>}
                            </span>
                            <span className="preview-definition">
                              {type === 'flashcards' ? (
                                <span className="d-inline-block align-middle pr-2">
                                  {card.definition_image !== ''
                                    ? <img className="img-preview" src={`${card.definition_image}`} alt="DEF_IMG_PRV" />
                                    : <Icon className="img-preview" src={InsertPhoto} />}
                                </span>
                              )
                                : ''}
                              {card.definition !== '' ? card.definition : <span className="text-gray">{intl.formatMessage(messages.noTextLabel)}</span>}
                            </span>
                          </span>
                        </div>
                      )
                        : <div className="card-spacer d-flex align-self-stretch" />}
                      <Dropdown onToggle={(isOpen, e) => e.stopPropagation()}>
                        <Dropdown.Toggle
                          className="card-dropdown"
                          as={IconButton}
                          src={MoreHoriz}
                          iconAs={Icon}
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
                    </div>
                    <Collapsible.Visible whenClosed>
                      <div>
                        <IconButton
                          src={ExpandMore}
                          iconAs={Icon}
                          alt="EXPAND"
                          variant="primary"
                        />
                      </div>
                    </Collapsible.Visible>
                    <Collapsible.Visible whenOpen>
                      <div>
                        <IconButton
                          src={ExpandLess}
                          iconAs={Icon}
                          alt="COLLAPSE"
                          variant="primary"
                        />
                      </div>
                    </Collapsible.Visible>
                  </Collapsible.Trigger>
                  <div className="card-body p-0">
                    <Collapsible.Body>
                      <div className="card-divider" />
                      <div className="card-term d-flex flex-column align-items-start align-self-stretch">
                        <span>{intl.formatMessage(messages.termLabel)}</span>
                        {(type !== 'matching' && card.term_image !== '') && termImageDiv(card, index)}
                        <div className="term-input-area d-flex flex-column align-items-start align-self-stretch">
                          <div className="card-input-line d-flex align-items-start align-self-stretch">
                            <Form.Control
                              className="d-flex flex-column align-items-start align-self-stretch"
                              id={`term|${index}`}
                              placeholder={intl.formatMessage(messages.enterYourTerm)}
                              value={getInputValue(index, 'term')}
                              onChange={(e) => handleInputChange(index, 'term', e.target.value)}
                              onBlur={() => handleInputBlur(index, 'term')}
                              style={{ borderRadius: 0 }}
                              maxLength={MAX_TERM_LENGTH}
                              isInvalid={getCardErrors(card, index).termError}
                            />
                            {type !== 'matching' && termImageUploadButton(card, index)}
                          </div>
                          <div className={`d-flex justify-content-between align-items-center align-self-stretch ${type !== 'matching' ? 'mr-5' : ''}`}>
                            <span>
                              {getCardErrors(card, index).termError && (
                                <Form.Control.Feedback type="invalid" hasIcon={false}>
                                  {intl.formatMessage(messages.termValidationError)}
                                </Form.Control.Feedback>
                              )}
                            </span>
                            <small className="text-muted mr-1">{getInputValue(index, 'term').length}/{MAX_TERM_LENGTH}</small>
                          </div>
                        </div>
                      </div>
                      <div className="card-divider" />
                      <div className="card-definition d-flex flex-column align-items-start align-self-stretch">
                        <span>{intl.formatMessage(messages.definitionLabel)}</span>
                        {(type !== 'matching' && card.definition_image !== '') && definitionImageDiv(card, index)}
                        <div className="definition-input-area d-flex flex-column align-items-start align-self-stretch">
                          <div className="card-input-line d-flex align-items-start align-self-stretch">
                            <Form.Control
                              className="d-flex flex-column align-items-start align-self-stretch"
                              id={`definition|${index}`}
                              placeholder={intl.formatMessage(messages.enterYourDefinition)}
                              value={getInputValue(index, 'definition')}
                              onChange={(e) => handleInputChange(index, 'definition', e.target.value)}
                              onBlur={() => handleInputBlur(index, 'definition')}
                              maxLength={MAX_DEFINITION_LENGTH}
                              style={{ borderRadius: 0 }}
                              isInvalid={getCardErrors(card, index).definitionError}
                            />
                            {type !== 'matching' && definitionImageUploadButton(card, index)}
                          </div>
                          <div className={`d-flex justify-content-between align-items-center align-self-stretch ${type !== 'matching' ? 'mr-5' : ''}`}>
                            <span>
                              {getCardErrors(card, index).definitionError && (
                                <Form.Control.Feedback type="invalid" hasIcon={false}>
                                  {intl.formatMessage(messages.definitionValidationError)}
                                </Form.Control.Feedback>
                              )}
                            </span>
                            <small className="text-muted mr-1">{getInputValue(index, 'definition').length}/{MAX_DEFINITION_LENGTH}</small>
                          </div>
                        </div>
                      </div>
                    </Collapsible.Body>
                  </div>
                </Collapsible.Advanced>
              </SortableItem>
            ))
          }
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
          summary={type.substr(0, 1).toUpperCase() + type.substr(1)}
          isCardCollapsibleOpen="true"
        >
          <Button
            onClick={() => updateType('flashcards')}
            className="type-button"
          >
            <span className="small text-primary-500">{intl.formatMessage(messages.flashcardsLabel)}</span>
            <span hidden={type !== 'flashcards'}><Icon src={Check} className="text-success" /></span>
          </Button>
          <div className="card-divider" />
          <Button
            onClick={() => updateType('matching')}
            className="type-button"
          >
            <span className="small text-primary-500">{intl.formatMessage(messages.matchingLabel)}</span>
            <span hidden={type !== 'matching'}><Icon src={Check} className="text-success" /></span>
          </Button>
        </SettingsOption>
        <SettingsOption
          className="sidebar-shuffle d-flex flex-column align-items-start align-self-stretch"
          title={intl.formatMessage(messages.shuffleLabel)}
          summary={settings.shuffle ? 'On' : 'Off'}
          isCardCollapsibleOpen="true"
        >
          <>
            <div className="settings-description">{intl.formatMessage(messages.shuffleSettingsDescription)}</div>
            <div className="d-flex flex-row gap-0 w-100">
              <Button
                onClick={() => setShuffleStatus(false)}
                variant={!settings.shuffle ? 'primary' : 'outline-primary'}
                className="toggle-button rounded-0"
              >
                {intl.formatMessage(messages.offLabel)}
              </Button>
              <Button
                onClick={() => setShuffleStatus(true)}
                variant={settings.shuffle ? 'primary' : 'outline-primary'}
                className="toggle-button rounded-0"
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
      isDirty={() => isDirty}
      validateEntry={validateAllCards}
    >
      <div className="editor-body h-75 overflow-auto">
        {Object.keys(validationErrors).length > 0 && (
          <Alert variant="danger" className="mt-2" icon={Info}>
            <Alert.Heading className="font-size-normal">{intl.formatMessage(messages.validationErrorHeading)}</Alert.Heading>
            <p>{intl.formatMessage(messages.validationErrorAlert)}</p>
          </Alert>
        )}
        {!blockFinished ? loading : page}
      </div>
    </EditorContainer>
  );
};

GameEditor.propTypes = {
  onClose: PropTypes.func.isRequired,

  blockFinished: PropTypes.bool.isRequired,
  blockId: PropTypes.string.isRequired,
  blockValue: PropTypes.shape({}),
  list: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  updateTerm: PropTypes.func.isRequired,
  updateDefinition: PropTypes.func.isRequired,
  toggleOpen: PropTypes.func.isRequired,
  setList: PropTypes.func.isRequired,
  addCard: PropTypes.func.isRequired,
  removeCard: PropTypes.func.isRequired,
  settings: PropTypes.shape({
    shuffle: PropTypes.bool.isRequired,
    timer: PropTypes.bool.isRequired,
  }).isRequired,
  setShuffleStatus: PropTypes.func.isRequired,
  setTimerStatus: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  updateType: PropTypes.func.isRequired,

  uploadGameImage: PropTypes.func.isRequired,
  deleteGameImage: PropTypes.func.isRequired,
  loadGamesSettings: PropTypes.func.isRequired,

  isDirty: PropTypes.bool,
};

export const mapStateToProps = (state) => ({
  blockFinished: selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchBlock }),
  blockId: selectors.app.blockId(state),
  blockValue: selectors.app.blockValue(state),
  settings: selectors.game.settings(state),
  type: selectors.game.type(state),
  list: selectors.game.list(state),
  isDirty: selectors.game.isDirty(state),
});

export const mapDispatchToProps = {
  initializeEditor: actions.app.initializeEditor,

  setShuffleStatus: actions.game.setShuffleStatus,

  setTimerStatus: actions.game.setTimerStatus,

  updateType: actions.game.updateType,

  updateTerm: actions.game.updateTerm,
  updateTermImage: actions.game.updateTermImage,
  updateDefinition: actions.game.updateDefinition,
  updateDefinitionImage: actions.game.updateDefinitionImage,
  toggleOpen: actions.game.toggleOpen,
  setList: actions.game.setList,
  addCard: actions.game.addCard,
  removeCard: actions.game.removeCard,

  loadGamesSettings: thunkActions.game.loadGamesSettings,
  uploadGameImage: thunkActions.game.uploadGameImage,
  deleteGameImage: thunkActions.game.deleteGameImage,
};

export default connect(mapStateToProps, mapDispatchToProps)(GameEditor);
