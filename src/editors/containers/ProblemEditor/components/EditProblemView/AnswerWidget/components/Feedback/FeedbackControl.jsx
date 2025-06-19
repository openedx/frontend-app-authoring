import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';

import { answerOptionProps } from '../../../../../../../data/services/cms/types';
import ExpandableTextArea from '../../../../../../../sharedComponents/ExpandableTextArea';
import messages from './messages';

const FeedbackControl = ({
  feedback,
  onChange,
  labelMessage,
  labelMessageBoldUnderline,
  answer,
  type,
  images,
  isLibrary,
  learningContextId,
}) => {
  const intl = useIntl();
  return (
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
      <ExpandableTextArea
        id={`${type}Feedback-${answer.id}`}
        value={feedback}
        setContent={onChange}
        placeholder={intl.formatMessage(messages.feedbackPlaceholder)}
        {...{
          images,
          isLibrary,
          learningContextId,
        }}
      />
    </Form.Group>
  );
};
FeedbackControl.propTypes = {
  feedback: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  labelMessage: PropTypes.shape.isRequired,
  labelMessageBoldUnderline: PropTypes.shape.isRequired,
  answer: answerOptionProps.isRequired,
  type: PropTypes.string.isRequired,
  images: PropTypes.shape({}).isRequired,
  learningContextId: PropTypes.string.isRequired,
  isLibrary: PropTypes.bool.isRequired,
};

export default FeedbackControl;
