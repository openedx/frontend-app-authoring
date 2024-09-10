import { useState, useEffect } from 'react';
import { StrictDict } from '../../../../../utils';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './hooks';
import { actions } from '../../../../../data/redux';
import { ProblemTypeKeys } from '../../../../../data/constants/problem';
import { fetchEditorContent } from '../hooks';

export const state = StrictDict({
  // eslint-disable-next-line react-hooks/rules-of-hooks
  isFeedbackVisible: (val) => useState(val),
});

export const removeAnswer = ({
  answer,
  dispatch,
}) => () => {
  dispatch(actions.problem.deleteAnswer({
    id: answer.id,
    correct: answer.correct,
    editorState: fetchEditorContent({ format: '' }),
  }));
};

export const setAnswer = ({ answer, hasSingleAnswer, dispatch }) => (payload) => {
  dispatch(actions.problem.updateAnswer({ id: answer.id, hasSingleAnswer, ...payload }));
};

export const setAnswerTitle = ({
  answer,
  hasSingleAnswer,
  dispatch,
  problemType,
}) => (updatedTitle) => {
  let title = updatedTitle;
  if ([ProblemTypeKeys.TEXTINPUT, ProblemTypeKeys.NUMERIC, ProblemTypeKeys.DROPDOWN].includes(problemType)) {
    title = updatedTitle.target.value;
  }
  dispatch(actions.problem.updateAnswer({ id: answer.id, hasSingleAnswer, title }));
};

export const setSelectedFeedback = ({ answer, hasSingleAnswer, dispatch }) => (value) => {
  if (value) {
    dispatch(actions.problem.updateAnswer({
      id: answer.id,
      hasSingleAnswer,
      selectedFeedback: value,
    }));
  }
};

export const setUnselectedFeedback = ({ answer, hasSingleAnswer, dispatch }) => (value) => {
  if (value) {
    dispatch(actions.problem.updateAnswer({
      id: answer.id,
      hasSingleAnswer,
      unselectedFeedback: value,
    }));
  }
};

export const useFeedback = (answer) => {
  const [isFeedbackVisible, setIsFeedbackVisible] = module.state.isFeedbackVisible(false);
  useEffect(() => {
    // Show feedback fields if feedback is present
    const isVisible = !!answer.selectedFeedback || !!answer.unselectedFeedback;
    setIsFeedbackVisible(isVisible);
  }, [answer]);

  const toggleFeedback = (open) => {
    // Do not allow to hide if feedback is added
    const { selectedFeedback, unselectedFeedback } = fetchEditorContent({ format: '' });

    if (!!selectedFeedback?.[answer.id] || !!unselectedFeedback?.[answer.id]) {
      setIsFeedbackVisible(true);
      return;
    }
    setIsFeedbackVisible(open);
  };
  return {
    isFeedbackVisible,
    toggleFeedback,
  };
};

export const isSingleAnswerProblem = (problemType) => (
  problemType === ProblemTypeKeys.DROPDOWN
);

export const useAnswerContainer = ({ answers, updateField }) => {
  useEffect(() => {
    let answerCount = 0;
    answers.forEach(answer => {
      if (answer.correct) {
        answerCount += 1;
      }
    });
    updateField({ correctAnswerCount: answerCount });
  }, []);
};

export default {
  state, removeAnswer, setAnswer, setAnswerTitle, useFeedback, isSingleAnswerProblem, useAnswerContainer,
};
