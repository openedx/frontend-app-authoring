import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { getProblemTypes } from '@src/editors/data/constants/problem';
import messages from './messages';
import AnswersContainer from './AnswersContainer';

// This widget should be connected, grab all answers from store, update them as needed.
const AnswerWidget = ({
  // Redux
  problemType,
}) => {
  const intl = useIntl();

  const localizedProblemTypes = getProblemTypes(intl.formatMessage);
  const localizedProblemStaticData = localizedProblemTypes[problemType];

  return (
    <div>
      <div className="mt-4 text-primary-500">
        <div className="h4">
          <FormattedMessage {...messages.answerWidgetTitle} />
        </div>
        <div className="small">
          <FormattedMessage
            {...messages.answerHelperText}
            values={{ helperText: localizedProblemStaticData.description }}
          />
        </div>
      </div>
      <AnswersContainer problemType={problemType} />
    </div>
  );
};

AnswerWidget.propTypes = {
  problemType: PropTypes.string.isRequired,
};
export const AnswerWidgetInternal = AnswerWidget; // For testing only
export default AnswerWidget;
