import { createSelector } from 'reselect';
import * as module from './selectors';

export const problemState = (state) => state.problem;
const mkSimpleSelector = (cb) => createSelector([module.problemState], cb);
export const simpleSelectors = {
  problemType: mkSimpleSelector(problemData => problemData.problemType),
  generalFeedback: mkSimpleSelector(problemData => problemData.generalFeedback),
  groupFeedbackList: mkSimpleSelector(problemData => problemData.groupFeedbackList),
  answers: mkSimpleSelector(problemData => problemData.answers),
  correctAnswerCount: mkSimpleSelector(problemData => problemData.correctAnswerCount),
  settings: mkSimpleSelector(problemData => problemData.settings),
  question: mkSimpleSelector(problemData => problemData.question),
  completeState: mkSimpleSelector(problemData => problemData),
};

export default {
  ...simpleSelectors,
};
