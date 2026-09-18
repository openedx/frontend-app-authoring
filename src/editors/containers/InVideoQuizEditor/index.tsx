import React, { useState, useEffect, useCallback } from 'react';
import { connect, useSelector } from 'react-redux';
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
  type EditorState,
} from '../../data/redux';
import type { QuizItem, VideoOption, ProblemOption } from '../../data/redux/inVideoQuiz';
import { RequestKeys } from '../../data/constants/requests';
import './index.scss';
import EditorContainer from '../EditorContainer';
import UntypedButton from '../../sharedComponents/Button';
import type { EditorComponent } from '../../EditorComponent';
import messages from './messages';

// `Button` is a plain JS component; its inferred prop types from checkJs are too
// strict (required props with no real type). Re-type it locally for this file only.
const Button = UntypedButton as unknown as React.ComponentType<{
  className?: string;
  onClick?: () => void;
  iconBefore?: any;
  variant?: string;
  text?: string;
  children?: React.ReactNode;
}>;

export const hooks = {
  getContent: ({ selectedVideo, quizItems }: { selectedVideo: string | null; quizItems: QuizItem[]; }) => {
    const validItems = quizItems.filter((item) => item.problemId);
    return {
      selectedVideo,
      quizItems: validItems,
    };
  },
};

interface ValidationState {
  problem: 'error' | null;
  time: 'error' | null;
}

interface StateProps {
  blockFinished: boolean;
  blockId: string | null;
  blockValue: EditorState['app']['blockValue'];
  selectedVideo: string | null;
  videos: VideoOption[];
  problems: ProblemOption[];
  quizItems: QuizItem[];
  isDirty: boolean;
  unitContentLoaded: boolean;
}

interface DispatchProps {
  setSelectedVideo: (videoId: string) => void;
  addQuizItem: () => void;
  removeQuizItem: (payload: { index: number; }) => void;
  updateProblemId: (payload: { index: number; problemId: string; }) => void;
  updateTime: (payload: { index: number; time: string; }) => void;
  updateJumpBack: (payload: { index: number; jumpBack: string; }) => void;
  loadInVideoQuizSettings: () => void;
  saveInVideoQuizSettings: (options: {
    onSuccess: (response: unknown) => void;
    onFailure: (error: unknown) => void;
  }) => void;
}

type Props = StateProps & DispatchProps & EditorComponent;

export const InVideoQuizEditor: React.FC<Props> = ({
  onClose,
  returnFunction = null,
  blockFinished,
  blockId,
  blockValue,
  selectedVideo,
  videos,
  problems,
  quizItems,
  unitContentLoaded,
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
  const [saveError, setSaveError] = useState<string | null>(null);
  const [contentAlertDismissed, setContentAlertDismissed] = useState(false);
  const returnUrl = useSelector(selectors.app.returnUrl);
  const analytics = useSelector(selectors.app.analytics);

  const hasNoVideos = unitContentLoaded && videos.length === 0;
  const hasNoProblems = unitContentLoaded && problems.length === 0;
  const isLoadingUnitContent = Boolean(blockFinished && blockId && blockValue && !unitContentLoaded);

  const isValidTimeFormat = useCallback((value: string) => /^\d+:[0-5]\d$/.test(value), []);

  const getValidationState = useCallback((item: QuizItem): ValidationState => {
    const validation: ValidationState = { problem: null, time: null };

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
    if (blockFinished && blockId && blockValue && !unitContentLoaded) {
      loadInVideoQuizSettings();
    }
  }, [blockFinished, blockId, blockValue, unitContentLoaded, loadInVideoQuizSettings]);

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
      onSuccess: (response: unknown) => {
        callback(response);
      },
      onFailure: (error: any) => {
        setSaveError(error?.response?.data?.error || error?.message || 'Failed to save settings');
      },
    });
  }, [saveInVideoQuizSettings, returnFunction, returnUrl, analytics, quizItems, intl, isValidTimeFormat]);

  const handleVideoChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVideo(e.target.value);
  }, [setSelectedVideo]);

  const handleProblemChange = useCallback((index: number, value: string) => {
    updateProblemId({ index, problemId: value });
  }, [updateProblemId]);

  const formatTimeInput = (value: string): string => {
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

  const handleTimeChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTimeInput(e.target.value);
    updateTime({ index, time: formatted });
  }, [quizItems, updateTime]);

  const handleJumpBackChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTimeInput(e.target.value);
    updateJumpBack({ index, jumpBack: formatted });
  }, [quizItems, updateJumpBack]);

  const handleAddProblem = useCallback(() => {
    addQuizItem();
  }, [addQuizItem]);

  const handleRemoveProblem = useCallback((index: number) => {
    removeQuizItem({ index });
  }, [removeQuizItem]);

  const formatTimeDisplay = (videoItem: VideoOption): string => {
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
      {(hasNoVideos || hasNoProblems) && !contentAlertDismissed && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setContentAlertDismissed(true)}
        >
          <Alert.Heading>{intl.formatMessage(messages.contentNotFoundTitle)}</Alert.Heading>
          {hasNoVideos && <div>{intl.formatMessage(messages.noVideoFoundInUnit)}</div>}
          {hasNoProblems && <div>{intl.formatMessage(messages.noProblemFoundInUnit)}</div>}
        </Alert>
      )}
      {saveError && (
        <Alert variant="danger" dismissible onClose={() => setSaveError(null)}>
          <Alert.Heading>{intl.formatMessage(messages.saveErrorTitle)}</Alert.Heading>
          {saveError}
        </Alert>
      )}
      <div className="video-select-container">
        <Form.Group>
          <Form.Label className="invideo-form-label font-weight-bold ">
            {intl.formatMessage(messages.videoLabel)}
          </Form.Label>
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
                  <Form.Label className="invideo-form-label font-weight-bold">
                    {intl.formatMessage(messages.problemLabel)}
                  </Form.Label>
                  <Form.Control
                    as="select"
                    value={item.problemId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleProblemChange(index, e.target.value)}
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
                  <Form.Label className="invideo-form-label font-weight-bold">
                    {intl.formatMessage(messages.timeLabel)}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={item.time || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTimeChange(index, e)}
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
                    <Form.Text className="form-helper-text timer-help-text">
                      {intl.formatMessage(messages.timeHelperText)}
                    </Form.Text>
                  )}
                </Form.Group>
              </div>

              <div className="jump-back-input">
                <Form.Group>
                  <Form.Label className="invideo-form-label font-weight-bold d-flex align-items-center">
                    {intl.formatMessage(messages.jumpBackLabel)}
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-jump-back-${index}`}>
                          {intl.formatMessage(messages.jumpBackTooltip)}
                        </Tooltip>
                      }
                    >
                      <Icon src={InfoOutline} size="xs" className="ml-1" />
                    </OverlayTrigger>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={item.jumpBack || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleJumpBackChange(index, e)}
                    placeholder="00:00"
                    maxLength={8}
                  />
                  <Form.Text className="form-helper-text timer-help-text">
                    {intl.formatMessage(messages.timeHelperText)}
                  </Form.Text>
                </Form.Group>
              </div>

              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-delete-problem-${index}`}>
                    {intl.formatMessage(messages.deleteProblem)}
                  </Tooltip>
                }
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
      saveButtonLabel={intl.formatMessage(messages.save)}
      saveButtonAriaLabel={intl.formatMessage(messages.save)}
    >
      <div className="editor-body h-75 overflow-auto">
        {!blockFinished || isLoadingUnitContent ? loading : page}
      </div>
    </EditorContainer>
  );
};

export const mapStateToProps = (state: EditorState) => ({
  blockFinished: selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchBlock }),
  blockId: selectors.app.blockId(state),
  blockValue: selectors.app.blockValue(state),
  selectedVideo: selectors.inVideoQuiz.selectedVideo(state),
  videos: selectors.inVideoQuiz.videos(state),
  problems: selectors.inVideoQuiz.problems(state),
  quizItems: selectors.inVideoQuiz.quizItems(state),
  isDirty: selectors.inVideoQuiz.isDirty(state),
  unitContentLoaded: selectors.inVideoQuiz.unitContentLoaded(state),
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
