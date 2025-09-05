import React, { memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Collapsible,
  Icon,
  IconButton,
  Form,
} from '@openedx/paragon';
import { FeedbackOutline, DeleteOutline } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import messages from './messages';
import { selectors } from '../../../../../data/redux';
import { answerOptionProps } from '../../../../../data/services/cms/types';
import Checker from './components/Checker';
import { FeedbackBox } from './components/Feedback';
import * as hooks from './hooks';
import { ProblemTypeKeys } from '../../../../../data/constants/problem';
import ExpandableTextArea from '../../../../../sharedComponents/ExpandableTextArea';
import { answerRangeFormatRegex } from '../../../data/OLXParser';

const AnswerOption = ({
  answer,
  hasSingleAnswer,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const problemType = useSelector(selectors.problem.problemType);
  const images = useSelector(selectors.app.images);
  const isLibrary = useSelector(selectors.app.isLibrary);
  const learningContextId = useSelector(selectors.app.learningContextId);
  const blockId = useSelector(selectors.app.blockId);

  const removeAnswer = hooks.removeAnswer({ answer, dispatch });
  const setAnswer = hooks.setAnswer({ answer, hasSingleAnswer, dispatch });
  const setAnswerTitle = hooks.setAnswerTitle({
    answer,
    hasSingleAnswer,
    dispatch,
    problemType,
  });
  const setSelectedFeedback = hooks.setSelectedFeedback({ answer, hasSingleAnswer, dispatch });
  const setUnselectedFeedback = hooks.setUnselectedFeedback({ answer, hasSingleAnswer, dispatch });
  const { isFeedbackVisible, toggleFeedback } = hooks.useFeedback(answer);

  const staticRootUrl = isLibrary
    ? `${getConfig().STUDIO_BASE_URL}/library_assets/blocks/${blockId}/`
    : undefined;

  const validateAnswerRange = (value) => {
    const cleanedValue = value.replace(/^\s+|\s+$/g, '');
    return !cleanedValue.length || answerRangeFormatRegex.test(cleanedValue);
  };

  const getInputArea = () => {
    if ([ProblemTypeKeys.SINGLESELECT, ProblemTypeKeys.MULTISELECT].includes(problemType)) {
      return (
        <ExpandableTextArea
          value={answer.title}
          setContent={setAnswerTitle}
          placeholder={intl.formatMessage(messages.answerTextboxPlaceholder)}
          id={`answer-${answer.id}`}
          images={images}
          isLibrary={isLibrary}
          learningContextId={learningContextId}
          staticRootUrl={staticRootUrl}
        />
      );
    }
    if (problemType !== ProblemTypeKeys.NUMERIC || !answer.isAnswerRange) {
      return (
        <Form.Control
          as="textarea"
          className="answer-option-textarea text-gray-500 small"
          autoResize
          rows={1}
          value={answer.title}
          onChange={setAnswerTitle}
          placeholder={intl.formatMessage(messages.answerTextboxPlaceholder)}
        />
      );
    }
    // Return Answer Range View
    const isValidValue = validateAnswerRange(answer.title);
    return (
      <Form.Group isInvalid={!isValidValue}>
        <Form.Control
          as="textarea"
          className="answer-option-textarea text-gray-500 small"
          autoResize
          rows={1}
          value={answer.title}
          onChange={setAnswerTitle}
          placeholder={intl.formatMessage(messages.answerRangeTextboxPlaceholder)}
        />
        {!isValidValue && (
          <Form.Control.Feedback type="invalid">
            <FormattedMessage {...messages.answerRangeErrorText} />
          </Form.Control.Feedback>
        )}
        <div className="pgn__form-switch-helper-text">
          <FormattedMessage {...messages.answerRangeHelperText} />
        </div>
      </Form.Group>
    );
  };

  return (
    <Collapsible.Advanced
      open={isFeedbackVisible}
      onToggle={toggleFeedback}
      className="answer-option d-flex flex-row justify-content-between flex-nowrap pb-2 pt-2"
    >
      <div className="mr-1 d-flex">
        <Checker
          hasSingleAnswer={hasSingleAnswer}
          answer={answer}
          setAnswer={setAnswer}
          disabled={problemType === ProblemTypeKeys.NUMERIC}
        />
      </div>
      <div className="ml-1 flex-grow-1">
        {getInputArea()}
        <Collapsible.Body>
          <FeedbackBox
            problemType={problemType}
            answer={answer}
            setSelectedFeedback={setSelectedFeedback}
            setUnselectedFeedback={setUnselectedFeedback}
            intl={intl}
            images={images}
            isLibrary={isLibrary}
            learningContextId={learningContextId}
          />
        </Collapsible.Body>
      </div>
      <div className="d-flex flex-row flex-nowrap">
        <Collapsible.Trigger aria-label={intl.formatMessage(messages.feedbackToggleIconAriaLabel)} className="btn-icon btn-icon-primary btn-icon-md align-items-center">
          <Icon
            src={FeedbackOutline}
            alt={intl.formatMessage(messages.feedbackToggleIconAltText)}
          />
        </Collapsible.Trigger>
        <IconButton
          src={DeleteOutline}
          iconAs={Icon}
          alt={intl.formatMessage(messages.answerDeleteIconAltText)}
          onClick={removeAnswer}
          variant="primary"
        />
      </div>
    </Collapsible.Advanced>
  );
};

AnswerOption.propTypes = {
  answer: answerOptionProps.isRequired,
  hasSingleAnswer: PropTypes.bool.isRequired,
};

export default memo(AnswerOption);
