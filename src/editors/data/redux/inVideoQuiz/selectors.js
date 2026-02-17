import { createSelector } from 'reselect';
// eslint-disable-next-line import/no-self-import
import * as module from './selectors';

export const inVideoQuizState = (state) => state.inVideoQuiz;
const mkSimpleSelector = (cb) => createSelector([module.inVideoQuizState], cb);

export const simpleSelectors = {
  selectedVideo: mkSimpleSelector(data => data.selectedVideo),
  videos: mkSimpleSelector(data => data.videos),
  problems: mkSimpleSelector(data => data.problems),
  quizItems: mkSimpleSelector(data => data.quizItems),
  isDirty: mkSimpleSelector(data => data.isDirty),
  completeState: mkSimpleSelector(data => data),
};

export default {
  ...simpleSelectors,
};
