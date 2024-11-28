import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import { Dropdown, Icon } from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';
import messages from './messages';
import { useAnswerContainer, isSingleAnswerProblem } from './hooks';
import { actions, selectors } from '../../../../../data/redux';
import { AnswerOption } from './AnswerOption';
import Button from '../../../../../sharedComponents/Button';
import { ProblemType, ProblemTypeKeys } from '../../../../../data/constants/problem';

interface Props {
  problemType: ProblemType;
}

export const AnswersContainer = ({ problemType }: Props) => {
  const hasSingleAnswer = isSingleAnswerProblem(problemType);
  const answers = useSelector(selectors.problem.answers);
  const dispatch = useDispatch();
  const addAnswer = React.useCallback(() => dispatch(actions.problem.addAnswer), [dispatch]);
  const addAnswerRange = React.useCallback(() => dispatch(actions.problem.addAnswerRange), [dispatch]);
  const updateField = React.useCallback(() => dispatch(actions.problem.updateField), [dispatch]);

  useAnswerContainer({ answers, updateField });

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
