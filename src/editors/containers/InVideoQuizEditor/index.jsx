import React, { useState, useEffect, useCallback } from 'react';
import { connect, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Form,
  Spinner,
  IconButton,
  OverlayTrigger,
  Tooltip,
  Icon,
  Alert,
} from '@openedx/paragon';
import {
  DeleteOutline,
  Plus,
  InfoOutline,
} from '@openedx/paragon/icons';
import { navigateCallback } from '../../hooks';
import analyticsEvt from '../../data/constants/analyticsEvt';
import {
  actions,
  selectors,
  thunkActions,
} from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';
import './index.scss';
import EditorContainer from '../EditorContainer';
import Button from '../../sharedComponents/Button';
import messages from './messages';

export const hooks = {
  getContent: ({ selectedVideo, quizItems }) => {
    const validItems = quizItems.filter((item) => item.problemId);
    return {
      selectedVideo,
      quizItems: validItems,
    };
  },
};

export const InVideoQuizEditor = ({
  onClose,
  returnFunction = null,
  blockFinished,
  blockId,
  blockValue,
  selectedVideo,
  videos,
  problems,
  quizItems,
  setSelectedVideo,
  addQuizItem,
  removeQuizItem,
  updateProblemId,
  updateTime,
  updateJumpBack,
  loadInVideoQuizSettings,
  saveInVideoQuizSettings,
  isDirty,
}) => {
  const intl = useIntl();
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const returnUrl = useSelector(selectors.app.returnUrl);
  const analytics = useSelector(selectors.app.analytics);

  const isValidTimeFormat = useCallback((value) => /^\d+:[0-5]\d$/.test(value), []);

  const getValidationState = useCallback((item) => {
    const validation = { problem: null, time: null };

    if (item.problemId && !item.time) {
      validation.time = 'error';
    }

    if (item.time && !item.problemId) {
      validation.problem = 'error';
    }

    if (item.time && !isValidTimeFormat(item.time)) {
      validation.time = 'error';
    }

    return validation;
  }, [isValidTimeFormat]);

  useEffect(() => {
    if (blockFinished && blockId && blockValue && !settingsLoaded) {
      loadInVideoQuizSettings();
      setSettingsLoaded(true);
    }
  }, [blockFinished, blockId, blockValue, settingsLoaded, loadInVideoQuizSettings]);

  const handleSave = useCallback(() => {
    setSaveError(null);
    const hasInvalidTime = quizItems.some((item) => (
      (item.time && !isValidTimeFormat(item.time))
      || (item.jumpBack && !isValidTimeFormat(item.jumpBack))
    ));
    if (hasInvalidTime) {
      setSaveError(intl.formatMessage(messages.timeFormatError));
      return;
    }
    const hasProblemWithoutTimer = quizItems.some((item) => item.problemId && !item.time);
    if (hasProblemWithoutTimer) {
      setSaveError(intl.formatMessage(messages.timerRequiredError));
      return;
    }
    const hasTimerWithoutProblem = quizItems.some((item) => item.time && !item.problemId);
    if (hasTimerWithoutProblem) {
      setSaveError(intl.formatMessage(messages.problemRequiredError));
      return;
    }
    const destination = returnFunction ? '' : returnUrl;
    const callback = navigateCallback({
      returnFunction,
      destination,
      analyticsEvent: analyticsEvt.editorSaveClick,
      analytics,
    });

    saveInVideoQuizSettings({
      onSuccess: (response) => {
        callback(response);
      },
      onFailure: (error) => {
        setSaveError(error?.response?.data?.error || error?.message || 'Failed to save settings');
      },
    });
  }, [saveInVideoQuizSettings, returnFunction, returnUrl, analytics, quizItems, intl, isValidTimeFormat]);

  const handleVideoChange = useCallback((e) => {
    setSelectedVideo(e.target.value);
  }, [setSelectedVideo]);

  const handleProblemChange = useCallback((index, value) => {
    updateProblemId({ index, problemId: value });
  }, [updateProblemId]);

  const formatTimeInput = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    if (digits.length === 0) { return ''; }
    if (digits.length === 1) { return digits; }
    if (digits.length === 2) { return digits; }
    if (digits.length === 3) {
      const minutes = digits.slice(0, 1);
      const seconds = digits.slice(1, 3);
      const sec = parseInt(seconds, 10);
      return `${minutes}:${sec > 59 ? '59' : seconds}`;
    }

    // 4 or more digits
    const minutes = digits.slice(0, -2);
    const seconds = digits.slice(-2);
    const sec = parseInt(seconds, 10);

    return `${minutes}:${sec > 59 ? '59' : seconds}`;
  };

  const handleTimeChange = useCallback((index, e) => {
    const formatted = formatTimeInput(e.target.value);
    updateTime({ index, time: formatted });
  }, [quizItems, updateTime]);

  const handleJumpBackChange = useCallback((index, e) => {
    const formatted = formatTimeInput(e.target.value);
    updateJumpBack({ index, jumpBack: formatted });
  }, [quizItems, updateJumpBack]);

  const handleAddProblem = useCallback(() => {
    addQuizItem();
  }, [addQuizItem]);

  const handleRemoveProblem = useCallback((index) => {
    removeQuizItem({ index });
  }, [removeQuizItem]);

  const formatTimeDisplay = (videoItem) => {
    if (videoItem.duration) {
      const minutes = Math.floor(videoItem.duration / 60);
      const seconds = videoItem.duration % 60;
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return '';
  };

  const loading = (
    <div className="text-center p-6">
      <Spinner
        animation="border"
        className="m-3"
        screenReaderText={intl.formatMessage(messages.loadingSpinner)}
      />
    </div>
  );

  const page = (
    <div className="in-video-quiz-editor">
      {saveError && (
        <Alert variant="danger" dismissible onClose={() => setSaveError(null)}>
          <Alert.Heading>{intl.formatMessage(messages.saveErrorTitle)}</Alert.Heading>
          {saveError}
        </Alert>
      )}
      <div className="video-select-container">
        <Form.Group>
          <Form.Label size="sm" className="invideo-form-label font-weight-bold ">{intl.formatMessage(messages.videoLabel)}</Form.Label>
          <Form.Control
            as="select"
            value={selectedVideo || ''}
            onChange={handleVideoChange}
          >
            <option value="">{intl.formatMessage(messages.selectVideo)}</option>
            {videos.map((video) => (
              <option key={video.id} value={video.id}>
                {video.display_name} {formatTimeDisplay(video)}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      </div>

      <div className="quiz-items-list">
        {quizItems.map((item, index) => {
          const validation = getValidationState(item);
          return (
            <div key={item.id} className="quiz-item-row d-flex align-items-start p-4 my-3">
              <div className="problem-select">
                <Form.Group>
                  <Form.Label size="sm" className="invideo-form-label font-weight-bold">{intl.formatMessage(messages.problemLabel)}</Form.Label>
                  <Form.Control
                    as="select"
                    value={item.problemId}
                    onChange={(e) => handleProblemChange(index, e.target.value)}
                    isInvalid={validation.problem === 'error'}
                  >
                    <option value="">{intl.formatMessage(messages.selectProblem)}</option>
                    {problems.map((problem) => (
                      <option key={problem.id} value={problem.id}>
                        {problem.display_name}
                      </option>
                    ))}
                  </Form.Control>
                  {validation.problem === 'error' && (
                  <Form.Control.Feedback type="invalid">
                    {intl.formatMessage(messages.problemRequiredError)}
                  </Form.Control.Feedback>
                  )}
                </Form.Group>
              </div>

              <div className="time-input">
                <Form.Group>
                  <Form.Label size="sm" className="invideo-form-label font-weight-bold">{intl.formatMessage(messages.timeLabel)}</Form.Label>
                  <Form.Control
                    type="text"
                    value={item.time || ''}
                    onChange={(e) => handleTimeChange(index, e)}
                    placeholder="00:00"
                    maxLength={8}
                    isInvalid={validation.time === 'error'}
                  />
                  {validation.time === 'error' && item.problemId && !item.time && (
                  <Form.Control.Feedback type="invalid">
                    {intl.formatMessage(messages.timerRequiredError)}
                  </Form.Control.Feedback>
                  )}
                  {validation.time === 'error' && item.time && !isValidTimeFormat(item.time) && (
                  <Form.Control.Feedback type="invalid">
                    {intl.formatMessage(messages.timeFormatError)}
                  </Form.Control.Feedback>
                  )}
                  {!validation.time && (
                  <Form.Text className="form-helper-text timer-help-text">{intl.formatMessage(messages.timeHelperText)}</Form.Text>
                  )}
                </Form.Group>
              </div>

              <div className="jump-back-input">
                <Form.Group>
                  <Form.Label size="sm" className="invideo-form-label font-weight-bold d-flex align-items-center">
                    {intl.formatMessage(messages.jumpBackLabel)}
                    <OverlayTrigger
                      placement="top"
                      overlay={(
                        <Tooltip id={`tooltip-jump-back-${index}`}>
                          {intl.formatMessage(messages.jumpBackTooltip)}
                        </Tooltip>
                    )}
                    >
                      <Icon src={InfoOutline} size="xs" className="ml-1" />
                    </OverlayTrigger>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={item.jumpBack || ''}
                    onChange={(e) => handleJumpBackChange(index, e)}
                    placeholder="00:00"
                    maxLength={8}
                  />
                  <Form.Text className="form-helper-text timer-help-text">{intl.formatMessage(messages.timeHelperText)}</Form.Text>
                </Form.Group>
              </div>

              <OverlayTrigger
                placement="top"
                overlay={(
                  <Tooltip id={`tooltip-delete-problem-${index}`}>
                    {intl.formatMessage(messages.deleteProblem)}
                  </Tooltip>
                    )}
              >
                <IconButton
                  className="delete-btn"
                  src={DeleteOutline}
                  iconAs={Icon}
                  alt={intl.formatMessage(messages.deleteProblem)}
                  onClick={() => handleRemoveProblem(index)}
                />
              </OverlayTrigger>
            </div>
          );
        })}
      </div>

      <Button
        className="mt-3 add-problem-btn"
        onClick={handleAddProblem}
        iconBefore={Plus}
        variant="primary"
      >
        {intl.formatMessage(messages.addProblem)}
      </Button>
    </div>
  );

  return (
    <EditorContainer
      getContent={() => hooks.getContent({ selectedVideo, quizItems })}
      onClose={onClose}
      returnFunction={returnFunction}
      isDirty={() => isDirty}
      onSave={handleSave}
      saveButtonLabel={intl.formatMessage(messages.addToCourse)}
      saveButtonAriaLabel={intl.formatMessage(messages.addToCourse)}
    >
      <div className="editor-body h-75 overflow-auto">
        {!blockFinished ? loading : page}
      </div>
    </EditorContainer>
  );
};

InVideoQuizEditor.propTypes = {
  onClose: PropTypes.func.isRequired,
  returnFunction: PropTypes.func,
  blockFinished: PropTypes.bool.isRequired,
  blockId: PropTypes.string,
  blockValue: PropTypes.shape({}),
  selectedVideo: PropTypes.string,
  videos: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    display_name: PropTypes.string,
    duration: PropTypes.number,
  })),
  problems: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    display_name: PropTypes.string,
  })),
  quizItems: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    problemId: PropTypes.string,
    time: PropTypes.string,
    jumpBack: PropTypes.string,
  })),
  setSelectedVideo: PropTypes.func.isRequired,
  addQuizItem: PropTypes.func.isRequired,
  removeQuizItem: PropTypes.func.isRequired,
  updateProblemId: PropTypes.func.isRequired,
  updateTime: PropTypes.func.isRequired,
  updateJumpBack: PropTypes.func.isRequired,
  loadInVideoQuizSettings: PropTypes.func.isRequired,
  saveInVideoQuizSettings: PropTypes.func.isRequired,
  isDirty: PropTypes.bool.isRequired,
};

InVideoQuizEditor.defaultProps = {
  blockId: null,
  blockValue: null,
  selectedVideo: null,
  videos: [],
  problems: [],
  quizItems: [],
};

export const mapStateToProps = (state) => ({
  blockFinished: selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchBlock }),
  blockId: selectors.app.blockId(state),
  blockValue: selectors.app.blockValue(state),
  selectedVideo: selectors.inVideoQuiz.selectedVideo(state),
  videos: selectors.inVideoQuiz.videos(state),
  problems: selectors.inVideoQuiz.problems(state),
  quizItems: selectors.inVideoQuiz.quizItems(state),
  isDirty: selectors.inVideoQuiz.isDirty(state),
});

export const mapDispatchToProps = {
  setSelectedVideo: actions.inVideoQuiz.setSelectedVideo,
  addQuizItem: actions.inVideoQuiz.addQuizItem,
  removeQuizItem: actions.inVideoQuiz.removeQuizItem,
  updateProblemId: actions.inVideoQuiz.updateProblemId,
  updateTime: actions.inVideoQuiz.updateTime,
  updateJumpBack: actions.inVideoQuiz.updateJumpBack,
  loadInVideoQuizSettings: thunkActions.inVideoQuiz.loadInVideoQuizSettings,
  saveInVideoQuizSettings: thunkActions.inVideoQuiz.saveInVideoQuizSettings,
};

export default connect(mapStateToProps, mapDispatchToProps)(InVideoQuizEditor);
