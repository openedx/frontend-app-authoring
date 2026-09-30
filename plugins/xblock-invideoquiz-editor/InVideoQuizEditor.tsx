import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
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
// eslint-disable-next-line import/no-unresolved
import { navigateCallback } from 'CourseAuthoring/editors/hooks';
// eslint-disable-next-line import/no-unresolved
import analyticsEvt from 'CourseAuthoring/editors/data/constants/analyticsEvt';
// eslint-disable-next-line import/no-unresolved
import { selectors } from 'CourseAuthoring/editors/data/redux';
// eslint-disable-next-line import/no-unresolved
import EditorContainer from 'CourseAuthoring/editors/containers/EditorContainer';

import { useInVideoQuizData, useSaveInVideoQuizSettings } from './data/apiHooks';
import {
  makeEmptyQuizItem,
  buildTimemapFromQuizItems,
  buildJumpBackFromQuizItems,
  formatTimeInput,
  isValidTimeFormat,
} from './utils';
import messages from './messages';
import type { InVideoQuizEditorProps, QuizItem, ValidationState } from './types';
import './InVideoQuizEditor.scss';

const InVideoQuizEditor: React.FC<InVideoQuizEditorProps> = ({
  blockId,
  studioEndpointUrl,
  onClose,
  returnFunction = null,
}) => {
  const intl = useIntl();
  const resolvedBlockId = blockId || '';
  const resolvedStudioEndpointUrl = studioEndpointUrl || '';
  const blockTitle = useSelector(selectors.app.blockTitle) || '';
  const returnUrl = useSelector(selectors.app.returnUrl);
  const analytics = useSelector(selectors.app.analytics);

  const { data, isPending: isLoadingUnitContent, isError: isLoadError } = useInVideoQuizData(
    resolvedBlockId,
    resolvedStudioEndpointUrl,
  );
  const { mutateAsync: saveInVideoQuizSettings } = useSaveInVideoQuizSettings();

  // Never edited locally, just read from query data, so derived rather than
  // copied into state (which would drift out of sync with the query cache).
  const videos = data?.videos ?? [];
  const problems = data?.problems ?? [];

  const [selectedVideo, setSelectedVideoState] = useState<string | null>(null);
  const [quizItems, setQuizItems] = useState<QuizItem[]>([makeEmptyQuizItem()]);
  // Only read by EditorContainer at event time (Cancel/close, beforeunload),
  // never rendered, so a ref: on a successful save, navigateTo() triggers
  // beforeunload synchronously, before a state update from setIsDirty could
  // commit, and EditorContainer would still see the stale dirty=true.
  // Clearing a ref is seen immediately.
  const isDirtyRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [contentAlertDismissed, setContentAlertDismissed] = useState(false);

  useEffect(() => {
    if (data) {
      setSelectedVideoState(data.selectedVideo);
      setQuizItems(data.quizItems.length > 0 ? data.quizItems : [makeEmptyQuizItem()]);
      isDirtyRef.current = false;
    }
  }, [data]);

  const hasNoVideos = !isLoadingUnitContent && videos.length === 0;
  const hasNoProblems = !isLoadingUnitContent && problems.length === 0;
  const hasSelectedVideo = videos.some((video) => video.id === selectedVideo);
  // Not "has a problem" - a time-only row counts too.
  const hasAnyRowInput = quizItems.some((item) => item.problemId || item.time);
  const isVideoMissing = !hasSelectedVideo
    && quizItems.some((item) => item.problemId && item.time);
  const isEntirelyEmpty = !hasSelectedVideo && !hasAnyRowInput;
  const isProblemMissing = hasSelectedVideo && !hasAnyRowInput;

  const getValidationState = useCallback((item: QuizItem): ValidationState => {
    const validation: ValidationState = { problem: null, time: null, jumpBack: null };

    if (item.problemId && !item.time) {
      validation.time = 'error';
    }

    if (item.time && !item.problemId) {
      validation.problem = 'error';
    }

    if (item.time && !isValidTimeFormat(item.time)) {
      validation.time = 'error';
    }

    if (item.jumpBack && !isValidTimeFormat(item.jumpBack)) {
      validation.jumpBack = 'error';
    }

    return validation;
  }, []);

  /**
   * Runs before the save request. Sets `saveError` (shown inline, below) and
   * returns false to block the save entirely for anything the author can fix
   * without a round trip - EditorContainer never calls the save handler when
   * this returns false. Actual save/network failures are not handled here;
   * they propagate from the save handler and EditorContainer shows its own
   * generic failure toast for those.
   */
  const validateEntry = useCallback((): boolean => {
    setSaveError(null);
    if (isEntirelyEmpty) {
      setSaveError(intl.formatMessage(messages.videoAndProblemRequiredError));
      return false;
    }
    if (isVideoMissing) {
      setSaveError(intl.formatMessage(messages.videoRequiredError));
      return false;
    }
    if (isProblemMissing) {
      setSaveError(intl.formatMessage(messages.noProblemsAddedError));
      return false;
    }
    const hasInvalidTime = quizItems.some((item) => (
      (item.time && !isValidTimeFormat(item.time))
      || (item.jumpBack && !isValidTimeFormat(item.jumpBack))
    ));
    if (hasInvalidTime) {
      setSaveError(intl.formatMessage(messages.timeFormatError));
      return false;
    }
    const hasProblemWithoutTimer = quizItems.some((item) => item.problemId && !item.time);
    if (hasProblemWithoutTimer) {
      setSaveError(intl.formatMessage(messages.timerRequiredError));
      return false;
    }
    const hasTimerWithoutProblem = quizItems.some((item) => item.time && !item.problemId);
    if (hasTimerWithoutProblem) {
      setSaveError(intl.formatMessage(messages.problemRequiredError));
      return false;
    }
    return true;
  }, [quizItems, isEntirelyEmpty, isVideoMissing, isProblemMissing, intl]);

  const handleSave = useCallback((): Promise<void> => {
    const destination = returnFunction ? '' : returnUrl;
    const callback = navigateCallback({
      returnFunction,
      destination,
      analyticsEvent: analyticsEvt.editorSaveClick,
      analytics,
    });

    // The container only disables its own Save/Cancel/close controls while
    // this promise is pending; the fields below are locked here so an edit
    // made mid-request can't be silently dropped (never sent, since the
    // payload above is already built, and its dirty flag cleared once this
    // unrelated request resolves).
    setIsSaving(true);
    return saveInVideoQuizSettings({
      blockId: resolvedBlockId,
      studioEndpointUrl: resolvedStudioEndpointUrl,
      displayName: blockTitle,
      // validateEntry blocks the save whenever no video is selected (directly
      // via isVideoMissing/isEntirelyEmpty, or indirectly since every other
      // path requires hasSelectedVideo to pass), so handleSave never runs
      // without one.
      videoId: selectedVideo as string,
      timemap: JSON.stringify(buildTimemapFromQuizItems(quizItems)),
      jumpBack: JSON.stringify(buildJumpBackFromQuizItems(quizItems)),
    }).then((response) => {
      isDirtyRef.current = false;
      callback(response);
    }).finally(() => {
      setIsSaving(false);
    });
  }, [
    quizItems,
    returnFunction,
    returnUrl,
    analytics,
    saveInVideoQuizSettings,
    resolvedBlockId,
    resolvedStudioEndpointUrl,
    blockTitle,
    selectedVideo,
  ]);

  const handleVideoChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVideoState(e.target.value);
    isDirtyRef.current = true;
  }, []);

  const updateQuizItemField = useCallback((index: number, field: keyof QuizItem, value: string) => {
    setQuizItems((prev) => {
      if (!prev[index]) { return prev; }
      return prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item));
    });
    isDirtyRef.current = true;
  }, []);

  const handleProblemChange = useCallback((index: number, value: string) => {
    updateQuizItemField(index, 'problemId', value);
  }, [updateQuizItemField]);

  const handleTimeChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTimeInput(e.target.value);
    updateQuizItemField(index, 'time', formatted);
  }, [updateQuizItemField]);

  const handleJumpBackChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTimeInput(e.target.value);
    updateQuizItemField(index, 'jumpBack', formatted);
  }, [updateQuizItemField]);

  const handleAddProblem = useCallback(() => {
    setQuizItems((prev) => [...prev, makeEmptyQuizItem()]);
    isDirtyRef.current = true;
  }, []);

  const handleRemoveProblem = useCallback((index: number) => {
    setQuizItems((prev) => {
      if (index < 0 || index >= prev.length) { return prev; }
      return prev.filter((_, idx) => idx !== index);
    });
    isDirtyRef.current = true;
  }, []);

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
          <Form.Label className="text-primary-500 font-weight-bold">
            {intl.formatMessage(messages.videoLabel)}
          </Form.Label>
          <Form.Control
            as="select"
            value={selectedVideo || ''}
            onChange={handleVideoChange}
            isInvalid={isVideoMissing}
            disabled={isSaving}
          >
            <option value="">{intl.formatMessage(messages.selectVideo)}</option>
            {videos.map((video) => (
              <option key={video.id} value={video.id}>
                {video.display_name}
              </option>
            ))}
          </Form.Control>
          {isVideoMissing && (
            <Form.Control.Feedback type="invalid">
              {intl.formatMessage(messages.videoRequiredError)}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </div>

      <div className="quiz-items-list">
        {quizItems.map((item, index) => {
          const validation = getValidationState(item);
          return (
            <div key={item.id} className="quiz-item-row d-flex align-items-start p-4 my-3">
              <div className="problem-select">
                <Form.Group>
                  <Form.Label className="text-primary-500 font-weight-bold">
                    {intl.formatMessage(messages.problemLabel)}
                  </Form.Label>
                  <Form.Control
                    as="select"
                    value={item.problemId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleProblemChange(index, e.target.value)}
                    isInvalid={validation.problem === 'error'}
                    disabled={isSaving}
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
                  <Form.Label className="text-primary-500 font-weight-bold">
                    {intl.formatMessage(messages.timeLabel)}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={item.time || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTimeChange(index, e)}
                    placeholder={intl.formatMessage(messages.timeInputPlaceholder)}
                    maxLength={8}
                    isInvalid={validation.time === 'error'}
                    disabled={isSaving}
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
                    <Form.Text className="form-helper-text">
                      {intl.formatMessage(messages.timeHelperText)}
                    </Form.Text>
                  )}
                </Form.Group>
              </div>

              <div className="jump-back-input">
                <Form.Group>
                  <Form.Label className="text-primary-500 font-weight-bold d-flex align-items-center">
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
                    placeholder={intl.formatMessage(messages.timeInputPlaceholder)}
                    maxLength={8}
                    isInvalid={validation.jumpBack === 'error'}
                    disabled={isSaving}
                  />
                  {validation.jumpBack === 'error' && (
                    <Form.Control.Feedback type="invalid">
                      {intl.formatMessage(messages.timeFormatError)}
                    </Form.Control.Feedback>
                  )}
                  {!validation.jumpBack && (
                    <Form.Text className="form-helper-text">
                      {intl.formatMessage(messages.timeHelperText)}
                    </Form.Text>
                  )}
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
                  disabled={isSaving}
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
        disabled={isSaving}
      >
        {intl.formatMessage(messages.addProblem)}
      </Button>
    </div>
  );

  return (
    <EditorContainer
      onClose={onClose}
      returnFunction={returnFunction}
      isDirty={() => isDirtyRef.current}
      validateEntry={validateEntry}
      onSave={handleSave}
    >
      <div className="editor-body h-75 overflow-auto">
        {isLoadingUnitContent && loading}
        {isLoadError && <Alert variant="danger">{intl.formatMessage(messages.loadError)}</Alert>}
        {!isLoadingUnitContent && !isLoadError && page}
      </div>
    </EditorContainer>
  );
};

export default InVideoQuizEditor;
