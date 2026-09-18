import { createSelector } from 'reselect';
import type { InVideoQuizState } from './reducers';

interface StateWithInVideoQuiz {
  inVideoQuiz: InVideoQuizState;
}

export const inVideoQuizState = (state: StateWithInVideoQuiz): InVideoQuizState => state.inVideoQuiz;
const mkSimpleSelector = <T>(cb: (data: InVideoQuizState) => T) => createSelector([inVideoQuizState], cb);

export const simpleSelectors = {
  selectedVideo: mkSimpleSelector((data) => data.selectedVideo),
  videos: mkSimpleSelector((data) => data.videos),
  problems: mkSimpleSelector((data) => data.problems),
  quizItems: mkSimpleSelector((data) => data.quizItems),
  isDirty: mkSimpleSelector((data) => data.isDirty),
  unitContentLoaded: mkSimpleSelector((data) => data.unitContentLoaded),
  completeState: mkSimpleSelector((data) => data),
};

export default {
  ...simpleSelectors,
};
