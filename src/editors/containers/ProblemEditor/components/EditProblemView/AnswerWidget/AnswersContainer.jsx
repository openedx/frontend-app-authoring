import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { Dropdown, Icon } from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';
import messages from './messages';
import { useAnswerContainer, isSingleAnswerProblem } from './hooks';
import { actions, selectors } from '../../../../../data/redux';
import { answerOptionProps } from '../../../../../data/services/cms/types';
import AnswerOption from './AnswerOption';
import Button from '../../../../../sharedComponents/Button';
import { ProblemTypeKeys } from '../../../../../data/constants/problem';

const AnswersContainer = ({
  problemType,
  // Redux
  answers,
  addAnswer,
  addAnswerRange,
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

      {problemType !== ProblemTypeKeys.NUMERIC ? (
        <Button
          variant="add"
          onClick={addAnswer}
        >
          <FormattedMessage {...messages.addAnswerButtonText} />
        </Button>

      ) : (
        <Dropdown>
          <Dropdown.Toggle
            id="Add-Answer-Or-Answer-Range"
            variant="tertiary"
            className="pl-0"
          >
            <Icon
              src={Add}
            />
            <FormattedMessage {...messages.addAnswerButtonText} />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item
              key="add-answer"
              onClick={addAnswer}
              className={`AddAnswerRange ${answers.length === 1 && answers[0].isAnswerRange ? 'disabled' : ''}`}
            >
              <FormattedMessage {...messages.addAnswerButtonText} />
            </Dropdown.Item>
            <Dropdown.Item
              key="add-answer-range"
              onClick={addAnswerRange}
              className={`AddAnswerRange ${answers.length > 1 || (answers.length === 1 && answers[0].isAnswerRange) ? 'disabled' : ''}`}
            >
              <FormattedMessage {...messages.addAnswerRangeButtonText} />
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      )}
    </div>
  );
};

AnswersContainer.propTypes = {
  problemType: PropTypes.string.isRequired,
  answers: PropTypes.arrayOf(answerOptionProps).isRequired,
  addAnswer: PropTypes.func.isRequired,
  addAnswerRange: PropTypes.func.isRequired,
  updateField: PropTypes.func.isRequired,
};

export const mapStateToProps = (state) => ({
  answers: selectors.problem.answers(state),
});

export const mapDispatchToProps = {
  addAnswer: actions.problem.addAnswer,
  addAnswerRange: actions.problem.addAnswerRange,
  updateField: actions.problem.updateField,
};

export const AnswersContainerInternal = AnswersContainer; // For testing only
export default connect(mapStateToProps, mapDispatchToProps)(AnswersContainer);
