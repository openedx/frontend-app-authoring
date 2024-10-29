import React, { memo } from 'react';
import { connect, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Collapsible,
  Icon,
  IconButton,
  Form,
} from '@openedx/paragon';
import { FeedbackOutline, DeleteOutline } from '@openedx/paragon/icons';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './messages';
import { selectors } from '../../../../../data/redux';
import { answerOptionProps } from '../../../../../data/services/cms/types';
import Checker from './components/Checker';
import { FeedbackBox } from './components/Feedback';
import * as hooks from './hooks';
import { ProblemTypeKeys } from '../../../../../data/constants/problem';
import ExpandableTextArea from '../../../../../sharedComponents/ExpandableTextArea';

const AnswerOption = ({
  answer,
  hasSingleAnswer,
  // injected
  intl,
  // redux
  problemType,
  images,
  isLibrary,
  learningContextId,
}) => {
  const dispatch = useDispatch();
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

  const getInputArea = () => {
    if ([ProblemTypeKeys.SINGLESELECT, ProblemTypeKeys.MULTISELECT].includes(problemType)) {
      return (
        <ExpandableTextArea
          value={answer.title}
          setContent={setAnswerTitle}
          placeholder={intl.formatMessage(messages.answerTextboxPlaceholder)}
          id={`answer-${answer.id}`}
          {...{
            images,
            isLibrary,
            learningContextId,
          }}
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
    return (
      <div>
        <Form.Control
          as="textarea"
          className="answer-option-textarea text-gray-500 small"
          autoResize
          rows={1}
          value={answer.title}
          onChange={setAnswerTitle}
          placeholder={intl.formatMessage(messages.answerRangeTextboxPlaceholder)}
        />
        <div className="pgn__form-switch-helper-text">
          <FormattedMessage {...messages.answerRangeHelperText} />
        </div>
      </div>

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
            {...{
              images,
              isLibrary,
              learningContextId,
            }}
          />
        </Collapsible.Body>
      </div>
      <div className="d-flex flex-row flex-nowrap">
        <Collapsible.Trigger aria-label="Toggle feedback" className="btn-icon btn-icon-primary btn-icon-md align-items-center">
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
  // injected
  intl: intlShape.isRequired,
  // redux
  problemType: PropTypes.string.isRequired,
  images: PropTypes.shape({}).isRequired,
  learningContextId: PropTypes.string.isRequired,
  isLibrary: PropTypes.bool.isRequired,
};

export const mapStateToProps = (state) => ({
  problemType: selectors.problem.problemType(state),
  images: selectors.app.images(state),
  isLibrary: selectors.app.isLibrary(state),
  learningContextId: selectors.app.learningContextId(state),
});

export const mapDispatchToProps = {};
export const AnswerOptionInternal = AnswerOption; // For testing only
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(memo(AnswerOption)));
