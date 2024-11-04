import { createSelector } from 'reselect';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
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
  defaultSettings: mkSimpleSelector(problemData => problemData.defaultSettings),
  completeState: mkSimpleSelector(problemData => problemData),
  isDirty: mkSimpleSelector(problemData => problemData.isDirty),
};

export default {
  ...simpleSelectors,
};
