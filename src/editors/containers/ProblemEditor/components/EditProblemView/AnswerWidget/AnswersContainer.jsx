import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import messages from './messages';
import { useAnswerContainer, isSingleAnswerProblem } from './hooks';
import { actions, selectors } from '../../../../../data/redux';
import { answerOptionProps } from '../../../../../data/services/cms/types';
import AnswerOption from './AnswerOption';
import Button from '../../../../../sharedComponents/Button';

export const AnswersContainer = ({
  problemType,
  // Redux
  answers,
  addAnswer,
  updateField,
}) => {
  const hasSingleAnswer = isSingleAnswerProblem(problemType);

  useAnswerContainer({ answers, problemType, updateField });

  return (
    <div className="answers-container border border-light-700 rounded py-4 pl-4 pr-3">
      {answers.map((answer) => (
        <AnswerOption
          key={answer.id}
          hasSingleAnswer={hasSingleAnswer}
          answer={answer}
        />
      ))}
      <Button
        variant="add"
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
