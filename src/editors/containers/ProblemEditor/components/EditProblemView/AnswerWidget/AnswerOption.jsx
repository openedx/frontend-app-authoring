import React, { memo } from 'react';
import { connect, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Col, Collapsible, Icon, IconButton, Form, Row,
} from '@edx/paragon';
import { AddComment, Delete } from '@edx/paragon/icons';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';
import { selectors } from '../../../../../data/redux';
import { answerOptionProps } from '../../../../../data/services/cms/types';
import { ProblemTypeKeys } from '../../../../../data/constants/problem';
import * as hooks from './hooks';

const Checker = ({
  hasSingleAnswer, answer, setAnswer,
}) => {
  let CheckerType = Form.Checkbox;
  if (hasSingleAnswer) {
    CheckerType = Form.Radio;
  }
  return (
    <CheckerType
      className="pl-4 mt-3"
      value={answer.id}
      onChange={(e) => setAnswer({ correct: e.target.checked })}
      checked={answer.correct}
    >
      {answer.id}
    </CheckerType>
  );
};

const FeedbackControl = ({
  feedback, onChange, labelMessage, labelMessageBoldUnderline, key, answer, intl,
}) => (
  <Form.Group key={key}>
    <Form.Label className="mb-3">
      <FormattedMessage
        {...labelMessage}
        values={{
          answerId: answer.id,
          boldunderline: <b><u><FormattedMessage {...labelMessageBoldUnderline} /></u></b>,
        }}
      />
    </Form.Label>
    <Form.Control
      placeholder={intl.formatMessage(messages.feedbackPlaceholder)}
      value={feedback}
      onChange={onChange}
    />
  </Form.Group>
);

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

  const displayFeedbackControl = (answerObject) => {
    if (problemType !== ProblemTypeKeys.MULTISELECT) {
      return FeedbackControl({
        key: `feedback-${answerObject.id}`,
        feedback: answerObject.selectedFeedback,
        onChange: (e) => setAnswer({ selectedFeedback: e.target.value }),
        labelMessage: messages.selectedFeedbackLabel,
        labelMessageBoldUnderline: messages.selectedFeedbackLabelBoldUnderlineText,
        answer: answerObject,
        intl,
      });
    }
    return [
      FeedbackControl({
        key: `selectedfeedback-${answerObject.id}`,
        feedback: answerObject.selectedFeedback,
        onChange: (e) => setAnswer({ selectedFeedback: e.target.value }),
        labelMessage: messages.selectedFeedbackLabel,
        labelMessageBoldUnderline: messages.selectedFeedbackLabelBoldUnderlineText,
        answer: answerObject,
        intl,
      }),
      FeedbackControl({
        key: `unselectedfeedback-${answerObject.id}`,
        feedback: answerObject.unselectedFeedback,
        onChange: (e) => setAnswer({ unselectedFeedback: e.target.value }),
        labelMessage: messages.unSelectedFeedbackLabel,
        labelMessageBoldUnderline: messages.unSelectedFeedbackLabelBoldUnderlineText,
        answer: answerObject,
        intl,
      }),
    ];
  };

  return (
    <Collapsible.Advanced
      open={isFeedbackVisible}
      onToggle={toggleFeedback}
      className="collapsible-card"
    >
      <Row className="my-2">

        <Col xs={1}>
          <Checker
            hasSingleAnswer={hasSingleAnswer}
            answer={answer}
            setAnswer={setAnswer}
          />
        </Col>

        <Col xs={10}>
          <Form.Control
            as="textarea"
            rows={1}
            value={answer.title}
            onChange={(e) => { setAnswer({ title: e.target.value }); }}
            placeholder={intl.formatMessage(messages.answerTextboxPlaceholder)}
          />

          <Collapsible.Body>
            <div className="bg-dark-100 p-4 mt-3">
              {displayFeedbackControl(answer)}
            </div>
          </Collapsible.Body>
        </Col>

        <Col xs={1} className="d-inline-flex mt-1">
          <Collapsible.Trigger>
            <IconButton
              src={AddComment}
              iconAs={Icon}
              alt={intl.formatMessage(messages.feedbackToggleIconAltText)}
              variant="primary"
            />
          </Collapsible.Trigger>
          <IconButton
            src={Delete}
            iconAs={Icon}
            alt={intl.formatMessage(messages.answerDeleteIconAltText)}
            onClick={removeAnswer}
            variant="primary"
          />
        </Col>

      </Row>
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

FeedbackControl.propTypes = {
  feedback: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  labelMessage: PropTypes.string.isRequired,
  labelMessageBoldUnderline: PropTypes.string.isRequired,
  key: PropTypes.string.isRequired,
  answer: answerOptionProps.isRequired,
  intl: intlShape.isRequired,
};

Checker.propTypes = {
  hasSingleAnswer: PropTypes.bool.isRequired,
  answer: answerOptionProps.isRequired,
  setAnswer: PropTypes.func.isRequired,
};

export const mapStateToProps = (state) => ({
  problemType: selectors.problem.problemType(state),
});

export const mapDispatchToProps = {};
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(memo(AnswerOption)));
