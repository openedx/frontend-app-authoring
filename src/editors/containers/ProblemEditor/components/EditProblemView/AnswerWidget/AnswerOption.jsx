import React, { memo } from 'react';
import { connect, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Collapsible,
  Icon,
  IconButton,
  Form,
} from '@edx/paragon';
import { FeedbackOutline, DeleteOutline } from '@edx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';
import { selectors } from '../../../../../data/redux';
import { answerOptionProps } from '../../../../../data/services/cms/types';
import Checker from './components/Checker';
import { FeedbackBox } from './components/Feedback';
import * as hooks from './hooks';

export const AnswerOption = ({
  answer,
  hasSingleAnswer,
  // injected
  intl,
  // redux
  problemType,
}) => {
  const dispatch = useDispatch();
  const removeAnswer = hooks.removeAnswer({ answer, dispatch });
  const setAnswer = hooks.setAnswer({ answer, hasSingleAnswer, dispatch });
  const { isFeedbackVisible, toggleFeedback } = hooks.prepareFeedback(answer);

  return (
    <Collapsible.Advanced
      open={isFeedbackVisible}
      onToggle={toggleFeedback}
      className="answer-option d-flex flex-row justify-content-between flex-nowrap pb-2 pt-2"
    >
      <div className="answer-option-flex-item-1 mr-1 d-flex">
        <Checker
          hasSingleAnswer={hasSingleAnswer}
          answer={answer}
          setAnswer={setAnswer}
        />
      </div>
      <div className="answer-option-flex-item-2 ml-1">
        <Form.Control
          as="textarea"
          className="answer-option-textarea text-gray-500 small"
          autoResize
          rows={1}
          value={answer.title}
          onChange={(e) => { setAnswer({ title: e.target.value }); }}
          placeholder={intl.formatMessage(messages.answerTextboxPlaceholder)}
        />
        <Collapsible.Body>
          <FeedbackBox
            problemType={problemType}
            answer={answer}
            setAnswer={setAnswer}
            intl={intl}
          />
        </Collapsible.Body>
      </div>
      <div className="answer-option-flex-item-3 d-flex flex-row flex-nowrap">
        <Collapsible.Trigger>
          <IconButton
            src={FeedbackOutline}
            iconAs={Icon}
            alt={intl.formatMessage(messages.feedbackToggleIconAltText)}
            variant="primary"
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
};

export const mapStateToProps = (state) => ({
  problemType: selectors.problem.problemType(state),
});

export const mapDispatchToProps = {};
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(memo(AnswerOption)));
