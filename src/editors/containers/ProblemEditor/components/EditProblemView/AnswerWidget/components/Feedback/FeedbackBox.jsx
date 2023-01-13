import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { answerOptionProps } from '../../../../../../../data/services/cms/types';
import FeedbackControl from './FeedbackControl';
import { messages } from './messages';

export const FeedbackBox = ({
  answer, setAnswer, intl,
}) => {
  const props = {
    onChange: (e) => setAnswer({ selectedFeedback: e.target.value }),
    answer,
    intl,
  };

  return (
    <div className="bg-light-300 p-4 mt-3">
      <FeedbackControl
        key={`selectedfeedback-${answer.id}`}
        feedback={answer.selectedFeedback}
        labelMessage={messages.selectedFeedbackLabel}
        labelMessageBoldUnderline={messages.selectedFeedbackLabelBoldUnderlineText}
        {...props}
      />
      <FeedbackControl
        key={`unselectedfeedback-${answer.id}`}
        feedback={answer.unselectedFeedback}
        labelMessage={messages.unSelectedFeedbackLabel}
        labelMessageBoldUnderline={messages.unSelectedFeedbackLabelBoldUnderlineText}
        {...props}
      />
    </div>
  );
};
FeedbackBox.propTypes = {
  answer: answerOptionProps.isRequired,
  setAnswer: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(FeedbackBox);
