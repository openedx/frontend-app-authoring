import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import messages from './messages';
import { ProblemTypes } from '../../../../../data/constants/problem';
import AnswersContainer from './AnswersContainer';
import './index.scss';

// This widget should be connected, grab all answers from store, update them as needed.
const AnswerWidget = ({
  // Redux
  problemType,
}) => {
  const problemStaticData = ProblemTypes[problemType];
  return (
    <div>
      <div className="problem-answer">
        <div className="problem-answer-title">
          <FormattedMessage {...messages.answerWidgetTitle} />
        </div>
        <div className="problem-answer-description">
          {problemStaticData.description}
        </div>
      </div>
      <AnswersContainer problemType={problemType} />
    </div>
  );
};

AnswerWidget.propTypes = {
  problemType: PropTypes.string.isRequired,
};
export default AnswerWidget;
