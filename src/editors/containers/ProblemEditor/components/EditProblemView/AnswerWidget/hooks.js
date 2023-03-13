import { useState, useEffect } from 'react';
import { StrictDict } from '../../../../../utils';
import * as module from './hooks';
import { actions } from '../../../../../data/redux';
import { ProblemTypeKeys } from '../../../../../data/constants/problem';

export const state = StrictDict({
  isFeedbackVisible: (val) => useState(val),
});

export const removeAnswer = ({ answer, dispatch }) => () => {
  dispatch(actions.problem.deleteAnswer({ id: answer.id, correct: answer.correct }));
};

export const setAnswer = ({ answer, hasSingleAnswer, dispatch }) => (payload) => {
  dispatch(actions.problem.updateAnswer({ id: answer.id, hasSingleAnswer, ...payload }));
};

export const setAnswerTitle = ({ answer, hasSingleAnswer, dispatch }) => (updatedTitle) => {
  dispatch(actions.problem.updateAnswer({ id: answer.id, hasSingleAnswer, title: updatedTitle }));
};

export const setSelectedFeedback = ({ answer, hasSingleAnswer, dispatch }) => (e) => {
  dispatch(actions.problem.updateAnswer({
    id: answer.id,
    hasSingleAnswer,
    selectedFeedback: e.target.value,
  }));
};

export const setUnselectedFeedback = ({ answer, hasSingleAnswer, dispatch }) => (e) => {
  dispatch(actions.problem.updateAnswer({
    id: answer.id,
    hasSingleAnswer,
    unselectedFeedback: e.target.value,
  }));
};

export const useFeedback = (answer) => {
  const [isFeedbackVisible, setIsFeedbackVisible] = module.state.isFeedbackVisible(false);
  useEffect(() => {
    // Show feedback fields if feedback is present
    const isVisible = !!answer.selectedFeedback || !!answer.unselectedFeedback;
    setIsFeedbackVisible(isVisible);
  }, []);

  const toggleFeedback = (open) => {
    // Do not allow to hide if feedback is added
    if (!!answer.selectedFeedback || !!answer.unselectedFeedback) {
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
