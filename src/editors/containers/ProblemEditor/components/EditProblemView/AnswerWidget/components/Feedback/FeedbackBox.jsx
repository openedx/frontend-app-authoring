import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { answerOptionProps } from '../../../../../../../data/services/cms/types';
import FeedbackControl from './FeedbackControl';
import messages from './messages';
import { ProblemTypeKeys } from '../../../../../../../data/constants/problem';

export const FeedbackBox = ({
  answer,
  problemType,
  setSelectedFeedback,
  setUnselectedFeedback,
  images,
  isLibrary,
  learningContextId,
  // injected
  intl,
}) => {
  const props = {
    answer,
    intl,
    images,
    isLibrary,
    learningContextId,
  };

  return ((problemType === ProblemTypeKeys.MULTISELECT) ? (
    <div className="bg-light-300 p-4 mt-3 rounded text-primary-500">
      <FeedbackControl
        key={`selectedfeedback-${answer.id}`}
        feedback={answer.selectedFeedback}
        labelMessage={messages.selectedFeedbackLabel}
        labelMessageBoldUnderline={messages.selectedFeedbackLabelBoldUnderlineText}
        onChange={setSelectedFeedback}
        type="selected"
        {...props}
      />
      <FeedbackControl
        key={`unselectedfeedback-${answer.id}`}
        feedback={answer.unselectedFeedback}
        labelMessage={messages.unSelectedFeedbackLabel}
        labelMessageBoldUnderline={messages.unSelectedFeedbackLabelBoldUnderlineText}
        onChange={setUnselectedFeedback}
        type="unselected"
        {...props}
      />
    </div>
  ) : (
    <div className="bg-light-300 p-4 mt-3 rounded text-primary-500">
      <FeedbackControl
        key={`selectedfeedback-${answer.id}`}
        feedback={answer.selectedFeedback}
        labelMessage={messages.selectedFeedbackLabel}
        labelMessageBoldUnderline={messages.selectedFeedbackLabelBoldUnderlineText}
        onChange={setSelectedFeedback}
        type="selected"
        {...props}
      />
    </div>
  ));
};
FeedbackBox.propTypes = {
  answer: answerOptionProps.isRequired,
  problemType: PropTypes.string.isRequired,
  setAnswer: PropTypes.func.isRequired,
  setSelectedFeedback: PropTypes.func.isRequired,
  setUnselectedFeedback: PropTypes.func.isRequired,
  images: PropTypes.shape({}).isRequired,
  learningContextId: PropTypes.string.isRequired,
  isLibrary: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(FeedbackBox);
