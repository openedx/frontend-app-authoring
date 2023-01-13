import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import { Form } from '@edx/paragon';

import { answerOptionProps } from '../../../../../../../data/services/cms/types';
import messages from './messages';

const FeedbackControl = ({
  feedback, onChange, labelMessage, labelMessageBoldUnderline, answer, intl,
}) => (
  <Form.Group>
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
FeedbackControl.propTypes = {
  feedback: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  labelMessage: PropTypes.string.isRequired,
  labelMessageBoldUnderline: PropTypes.string.isRequired,
  answer: answerOptionProps.isRequired,
  intl: intlShape.isRequired,
};

export default FeedbackControl;
