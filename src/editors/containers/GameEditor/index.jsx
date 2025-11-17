/* istanbul ignore file */
import React from 'react';
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
} from '@openedx/paragon';
import {
  DeleteOutline,
  Add,
  ExpandMore,
  ExpandLess,
  InsertPhoto,
  MoreHoriz,
  Check,
} from '@openedx/paragon/icons';
import {
  actions,
  selectors,
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
  getContent: () => ({
    some: 'content',
  }),
};

export const GameEditor = ({
  onClose,
  // redux
  blockFinished,

  // settings
  settings,
  shuffleTrue,
  shuffleFalse,
  timerTrue,
  timerFalse,
  type,
  updateType,

  // list
  list,
  updateTerm,
  updateTermImage,
  updateDefinition,
  updateDefinitionImage,
  toggleOpen,
  setList,
  addCard,
  removeCard,

  isDirty,
}) => {
  const intl = useIntl();
  // State for list
  const [state, setState] = React.useState(list);
  React.useEffect(() => { setState(list); }, [list]);

  // Non-reducer functions go here
  const getDescriptionHeader = () => {
    // Function to determine what the header will say based on type
    switch (type) {
      case 'flashcards':
        return 'Flashcard terms';
      case 'matching':
        return 'Matching terms';
      default:
        return 'Undefined';
    }
  };

  const getDescription = () => {
    // Function to determine what the description will say based on type
    switch (type) {
      case 'flashcards':
        return 'Enter your terms and definitions below. Learners will review each card by viewing the term, then flipping to reveal the definition.';
      case 'matching':
        return 'Enter your terms and definitions below. Learners must match each term with the correct definition.';
      default:
        return 'Undefined';
    }
  };

  const saveTermImage = (index) => {
    const id = `term_image_upload|${index}`;
    const file = document.getElementById(id).files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateTermImage({ index, termImage: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeTermImage = (index) => {
    const id = `term_image_upload|${index}`;
    document.getElementById(id).value = '';
    updateTermImage({ index, termImage: '' });
  };

  const saveDefinitionImage = (index) => {
    const id = `definition_image_upload|${index}`;
    const file = document.getElementById(id).files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateDefinitionImage({ index, definitionImage: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeDefintionImage = (index) => {
    const id = `definition_image_upload|${index}`;
    document.getElementById(id).value = '';
    updateDefinitionImage({ index, definitionImage: '' });
  };

  const moveCardUp = (index) => {
    if (index === 0) { return; }
    const temp = state.slice();
    [temp[index], temp[index - 1]] = [temp[index - 1], temp[index]];
    setState(temp);
  };

  const moveCardDown = (index) => {
    if (index === state.length - 1) { return; }
    const temp = state.slice();
    [temp[index + 1], temp[index]] = [temp[index], temp[index + 1]];
    setState(temp);
  };

  const loading = (
    <div className="text-center p-6">
      <Spinner
        animation="border"
        className="m-3"
        screenreadertext={intl.formatMessage(messages.loadingSpinner)}
      />
    </div>
  );

  const termImageDiv = (card, index) => (
    <div className="card-image-area d-flex align-items-center align-self-stretch">
      <img className="card-image" src={card.term_image} alt="TERM_IMG" />
      <IconButton
        src={DeleteOutline}
        iconAs={Icon}
        alt="DEL_IMG"
        variant="primary"
        onClick={() => removeTermImage(index)}
      />
    </div>
  );

  const termImageUploadButton = (card, index) => (
    <IconButton
      src={InsertPhoto}
      iconAs={Icon}
      alt="IMG"
      variant="primary"
      onClick={() => document.getElementById(`term_image_upload|${index}`).click()}
    />
  );

  const definitionImageDiv = (card, index) => (
    <div className="card-image-area d-flex align-items-center align-self-stretch">
      <img className="card-image" src={card.definition_image} alt="DEF_IMG" />
      <IconButton
        src={DeleteOutline}
        iconAs={Icon}
        alt="DEL_IMG"
        variant="primary"
        onClick={() => removeDefintionImage(index)}
      />
    </div>
  );

  const definitionImageUploadButton = (card, index) => (
    <IconButton
      src={InsertPhoto}
      iconAs={Icon}
      alt="IMG"
      variant="primary"
      onClick={() => document.getElementById(`definition_image_upload|${index}`).click()}
    />
  );

  const timerSettingsOption = (
    <SettingsOption
      className="sidebar-timer d-flex flex-column align-items-start align-self-stretch"
      title="Timer"
      summary={settings.timer ? 'On' : 'Off'}
      isCardCollapsibleOpen="true"
    >
      <>
        <div className="settings-description">Measure the time it takes learners to match all terms and definitions. Used to calculate a learner&apos;s score.</div>
        <Button
          onClick={() => timerFalse()}
          variant={!settings.timer ? 'primary' : 'outline-primary'}
          className="toggle-button rounded-0"
        >
          Off
        </Button>
        <Button
          onClick={() => timerTrue()}
          variant={settings.timer ? 'primary' : 'outline-primary'}
          className="toggle-button rounded-0"
        >
          On
        </Button>
      </>
    </SettingsOption>
  );

  const page = (
    <div className="page-body d-flex align-items-start">
      <div className="terms d-flex flex-column align-items-start align-self-stretch">
        <div className="description d-flex flex-column align-items-start align-self-stretch">
          <div className="description-header">
            {getDescriptionHeader()}
          </div>
          <div className="description-body align-self-stretch">
            {getDescription()}
          </div>
        </div>
        <DraggableList
          className="d-flex flex-column align-items-start align-self-stretch"
          itemList={state}
          setState={setState}
          updateOrder={() => (newList) => setList(newList)}
        >
          {
            state.map((card, index) => (
              <SortableItem
                id={card.id}
                key={card.id}
                buttonClassName="draggable-button"
                componentStyle={{
                  background: 'white',
                  borderRadius: '6px',
                  padding: '24px',
                  marginBottom: '16px',
                  boxShadow: '0px 1px 5px #ADADAD',
                  position: 'relative',
                  width: '100%',
                  flexDirection: 'column',
                  flexFlow: 'nowrap',
                }}
              >
                <Collapsible.Advanced
                  className="card"
                  defaultOpen
                  onOpen={() => toggleOpen({ index, isOpen: true })}
                  onClose={() => toggleOpen({ index, isOpen: false })}
                >
                  <input
                    type="file"
                    id={`term_image_upload|${index}`}
                    hidden
                    onChange={() => saveTermImage(index)}
                  />
                  <input
                    type="file"
                    id={`definition_image_upload|${index}`}
                    hidden
                    onChange={() => saveDefinitionImage(index)}
                  />
                  <Collapsible.Trigger className="card-heading">
                    <div className="drag-spacer" />
                    <div className="card-heading d-flex align-items-center align-self-stretch">
                      <div className="card-number">{index + 1}</div>
                      {!card.editorOpen ? (
                        <div className="preview-block position-relative w-100">
                          <span className="align-middle">
                            <span className="preview-term">
                              {type === 'flashcards' ? (
                                <span className="d-inline-block align-middle pr-2">
                                  {card.term_image !== ''
                                    ? <img className="img-preview" src={card.term_image} alt="TERM_IMG_PRV" />
                                    : <Icon className="img-preview" src={InsertPhoto} />}
                                </span>
                              )
                                : ''}
                              {card.term !== '' ? card.term : <span className="text-gray">No text</span>}
                            </span>
                            <span className="preview-definition">
                              {type === 'flashcards' ? (
                                <span className="d-inline-block align-middle pr-2">
                                  {card.definition_image !== ''
                                    ? <img className="img-preview" src={card.definition_image} alt="DEF_IMG_PRV" />
                                    : <Icon className="img-preview" src={InsertPhoto} />}
                                </span>
                              )
                                : ''}
                              {card.definition !== '' ? card.definition : <span className="text-gray">No text</span>}
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
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => moveCardUp(index)}>Move up</Dropdown.Item>
                          <Dropdown.Item onClick={() => moveCardDown(index)}>Move down</Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item onClick={() => removeCard({ index })}>Delete</Dropdown.Item>
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
                      <div className="card-body-divider">
                        <div className="card-divider" />
                      </div>
                      <div className="card-term d-flex flex-column align-items-start align-self-stretch">
                        Term
                        {(type !== 'matching' && card.term_image !== '') && termImageDiv(card, index)}
                        <div className="card-input-line d-flex align-items-start align-self-stretch">
                          <Form.Control
                            className="d-flex flex-column align-items-start align-self-stretch"
                            id={`term|${index}`}
                            placeholder="Enter your term"
                            value={card.term}
                            onChange={(e) => updateTerm({ index, term: e.target.value })}
                          />
                          {type !== 'matching' && termImageUploadButton(card, index)}
                        </div>
                      </div>
                      <div className="card-divider" />
                      <div className="card-definition d-flex flex-column align-items-start align-self-stretch">
                        Definition
                        {(type !== 'matching' && card.definition_image !== '') && definitionImageDiv(card, index)}
                        <div className="card-input-line d-flex align-items-start align-self-stretch">
                          <Form.Control
                            className="d-flex flex-column align-items-start align-self-stretch"
                            id={`definition|${index}`}
                            placeholder="Enter your definition"
                            value={card.definition}
                            onChange={(e) => updateDefinition({ index, definition: e.target.value })}
                          />
                          {type !== 'matching' && definitionImageUploadButton(card, index)}
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
        >
          <IconButton
            src={Add}
            iconAs={Icon}
            alt="ADD"
            variant="primary"
          />
          Add
        </Button>
      </div>
      <div className="sidebar d-flex flex-column align-items-start flex-shrink-0">
        <SettingsOption
          className="sidebar-type d-flex flex-column align-items-start align-self-stretch"
          title="Type"
          summary={type.substr(0, 1).toUpperCase() + type.substr(1)}
          isCardCollapsibleOpen="true"
        >
          <Button
            onClick={() => updateType('flashcards')}
            className="type-button"
          >
            <span className="small text-primary-500">Flashcards</span>
            <span hidden={type !== 'flashcards'}><Icon src={Check} className="text-success" /></span>
          </Button>
          <div className="card-divider" />
          <Button
            onClick={() => updateType('matching')}
            className="type-button"
          >
            <span className="small text-primary-500">Matching</span>
            <span hidden={type !== 'matching'}><Icon src={Check} className="text-success" /></span>
          </Button>
        </SettingsOption>
        <SettingsOption
          className="sidebar-shuffle d-flex flex-column align-items-start align-self-stretch"
          title="Shuffle"
          summary={settings.shuffle ? 'On' : 'Off'}
          isCardCollapsibleOpen="true"
        >
          <>
            <div className="settings-description">Shuffle the order of terms shown to learners when reviewing.</div>
            <Button
              onClick={() => shuffleFalse()}
              variant={!settings.shuffle ? 'primary' : 'outline-primary'}
              className="toggle-button rounded-0"
            >
              Off
            </Button>
            <Button
              onClick={() => shuffleTrue()}
              variant={settings.shuffle ? 'primary' : 'outline-primary'}
              className="toggle-button rounded-0"
            >
              On
            </Button>
          </>
        </SettingsOption>
        {type === 'matching' && timerSettingsOption}
      </div>
    </div>
  );

  // Page content goes here
  return (
    <EditorContainer
      getContent={hooks.getContent}
      onClose={onClose}
      isDirty={() => isDirty}
    >
      <div className="editor-body h-75 overflow-auto">
        {!blockFinished ? loading : page}
      </div>
    </EditorContainer>
  );
};

GameEditor.propTypes = {
  onClose: PropTypes.func.isRequired,

  // redux
  blockFinished: PropTypes.bool.isRequired,
  list: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  updateTerm: PropTypes.func.isRequired,
  updateTermImage: PropTypes.func.isRequired,
  updateDefinition: PropTypes.func.isRequired,
  updateDefinitionImage: PropTypes.func.isRequired,
  toggleOpen: PropTypes.func.isRequired,
  setList: PropTypes.func.isRequired,
  addCard: PropTypes.func.isRequired,
  removeCard: PropTypes.func.isRequired,
  settings: PropTypes.shape({
    shuffle: PropTypes.bool.isRequired,
    timer: PropTypes.bool.isRequired,
  }).isRequired,
  shuffleTrue: PropTypes.func.isRequired,
  shuffleFalse: PropTypes.func.isRequired,
  timerTrue: PropTypes.func.isRequired,
  timerFalse: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  updateType: PropTypes.func.isRequired,

  isDirty: PropTypes.bool,
};

export const mapStateToProps = (state) => ({
  blockFinished: selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchBlock }),
  settings: selectors.game.settings(state),
  type: selectors.game.type(state),
  list: selectors.game.list(state),
  isDirty: selectors.game.isDirty(state),
});

export const mapDispatchToProps = {
  initializeEditor: actions.app.initializeEditor,

  // shuffle
  shuffleTrue: actions.game.shuffleTrue,
  shuffleFalse: actions.game.shuffleFalse,

  // timer
  timerTrue: actions.game.timerTrue,
  timerFalse: actions.game.timerFalse,

  // type
  updateType: actions.game.updateType,

  // list
  updateTerm: actions.game.updateTerm,
  updateTermImage: actions.game.updateTermImage,
  updateDefinition: actions.game.updateDefinition,
  updateDefinitionImage: actions.game.updateDefinitionImage,
  toggleOpen: actions.game.toggleOpen,
  setList: actions.game.setList,
  addCard: actions.game.addCard,
  removeCard: actions.game.removeCard,
};

export default connect(mapStateToProps, mapDispatchToProps)(GameEditor);
