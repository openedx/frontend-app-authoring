import { createSelector } from 'reselect';
import type { EditorState } from '..';

export const problemState = (state: EditorState) => state.problem;

const mkSimpleSelector = <T>(cb: (problemState: EditorState['problem']) => T) => createSelector([problemState], cb);

export const simpleSelectors = {
  problemType: mkSimpleSelector(problemData => problemData.problemType),
  generalFeedback: mkSimpleSelector(problemData => problemData.generalFeedback),
  groupFeedbackList: mkSimpleSelector(problemData => problemData.groupFeedbackList),
  answers: mkSimpleSelector(problemData => problemData.answers),
  correctAnswerCount: mkSimpleSelector(problemData => problemData.correctAnswerCount),
  settings: mkSimpleSelector(problemData => problemData.settings),
  question: mkSimpleSelector(problemData => problemData.question),
  defaultSettings: mkSimpleSelector(problemData => problemData.defaultSettings),
  completeState: mkSimpleSelector(problemData => problemData),
  isDirty: mkSimpleSelector(problemData => problemData.isDirty),
};

export default simpleSelectors;
