import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import messages from './messages';
import { ProblemTypes } from '../../../../../data/constants/problem';
import AnswersContainer from './AnswersContainer';

// This widget should be connected, grab all answers from store, update them as needed.
const AnswerWidget = ({
  // Redux
  problemType,
  // injected
  intl,
}) => {
  const problemStaticData = ProblemTypes[problemType];
  return (
    <div className="p-4 border-top border-light">
      <div className="text-primary-500">
        <div className="h4 mb-4">
          <FormattedMessage {...messages.answerWidgetTitle} />
        </div>
      </div>
      <AnswersContainer problemType={problemType} />
    </div>
  );
};

AnswerWidget.propTypes = {
  problemType: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
};
export const AnswerWidgetInternal = AnswerWidget; // For testing only
export default injectIntl(AnswerWidget);
