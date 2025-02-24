import React from 'react';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';
import { ProblemType, ProblemTypes } from '../../../../../data/constants/problem';
import { AnswersContainer } from './AnswersContainer';

interface Props {
  problemType: ProblemType;
}

// This widget should be connected, grab all answers from store, update them as needed.
export const AnswerWidget = ({ problemType }: Props) => {
  const intl = useIntl();
  const problemStaticData = ProblemTypes[problemType];
  return (
    <div>
      <div className="mt-4 text-primary-500">
        <div className="h4">
          <FormattedMessage {...messages.answerWidgetTitle} />
        </div>
        <div className="small">
          {intl.formatMessage(messages.answerHelperText, { helperText: problemStaticData.description })}
        </div>
      </div>
      <AnswersContainer problemType={problemType} />
    </div>
  );
};
