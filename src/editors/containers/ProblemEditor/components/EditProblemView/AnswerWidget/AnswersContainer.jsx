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
}) => {
  const { hasSingleAnswer } = initializeAnswerContainer(problemType);

  return (
    <div>
      {answers.map((answer) => (
        <AnswerOption
          key={answer.id}
          hasSingleAnswer={hasSingleAnswer}
          answer={answer}
        />
      ))}
      <Button
        className="my-3 ml-2"
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
};

export const mapStateToProps = (state) => ({
  answers: selectors.problem.answers(state),
});

export const mapDispatchToProps = {
  addAnswer: actions.problem.addAnswer,
};

export default connect(mapStateToProps, mapDispatchToProps)(AnswersContainer);
