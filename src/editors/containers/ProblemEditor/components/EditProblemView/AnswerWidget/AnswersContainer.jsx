import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import messages from './messages';
import { initializeAnswerContainer } from '../../../hooks';
import { actions, selectors } from '../../../../../data/redux';
import { answerOptionProps } from '../../../../../data/services/cms/types';
import AnswerOption from './AnswerOption';

export const AnswersContainer = ({
  problemType,
  // Redux
  answers,
  addAnswer,
  updateField,
}) => {
  const { hasSingleAnswer } = initializeAnswerContainer({ answers, problemType, updateField });
  return (
    <div className="border rounded border-light-700 py-4 pl-4 pr-3">
      {answers.map((answer) => (
        <AnswerOption
          key={answer.id}
          hasSingleAnswer={hasSingleAnswer}
          answer={answer}
        />
      ))}
      <Button
        className="pl-0 text-primary-500"
        iconBefore={Add}
        variant="tertiary"
        onClick={addAnswer}
      >
        <FormattedMessage {...messages.addAnswerButtonText} />
      </Button>
    </div>
  );
};

AnswersContainer.propTypes = {
  problemType: PropTypes.string.isRequired,
  answers: PropTypes.arrayOf(answerOptionProps).isRequired,
  addAnswer: PropTypes.func.isRequired,
  updateField: PropTypes.func.isRequired,
};

export const mapStateToProps = (state) => ({
  answers: selectors.problem.answers(state),
});

export const mapDispatchToProps = {
  addAnswer: actions.problem.addAnswer,
  updateField: actions.problem.updateField,
};

export default connect(mapStateToProps, mapDispatchToProps)(AnswersContainer);
