import _ from 'lodash-es';
import { createSlice } from '@reduxjs/toolkit';
import { indexToLetterMap } from '../../../containers/ProblemEditor/data/OLXParser';
import { StrictDict } from '../../../utils';
import { ProblemTypeKeys, ShowAnswerTypesKeys } from '../../constants/problem';

const nextAlphaId = (lastId) => String.fromCharCode(lastId.charCodeAt(0) + 1);
const initialState = {
  rawOLX: '',
  problemType: ProblemTypeKeys.SINGLESELECT,
  question: '',
  answers: [],
  groupFeedbackList: [],
  additionalAttributes: {},
  settings: {
    scoring: {
      weight: 0,
      attempts: {
        unlimited: true,
        number: 0,
      },
    },
    hints: [],
    timeBetween: 0,
    matLabApiKey: '',
    showAnswer: {
      on: ShowAnswerTypesKeys.FINISHED,
      afterAttempts: 0,
    },
    showResetButton: false,
  },
};

// eslint-disable-next-line no-unused-vars
const problem = createSlice({
  name: 'problem',
  initialState,
  reducers: {
    updateField: (state, { payload }) => ({
      ...state,
      ...payload,
    }),
    updateQuestion: (state, { payload }) => ({
      ...state,
      question: payload,
    }),
    updateAnswer: (state, { payload }) => {
      const { id, hasSingleAnswer, ...answer } = payload;
      const answers = state.answers.map(obj => {
        if (obj.id === id) {
          return { ...obj, ...answer };
        }
        // set other answers as incorrect if problem only has one answer correct
        // and changes object include correct key change
        if (hasSingleAnswer && _.has(answer, 'correct') && obj.correct) {
          return { ...obj, correct: false };
        }
        return obj;
      });
      return {
        ...state,
        answers,
      };
    },
    deleteAnswer: (state, { payload }) => {
      const { id } = payload;
      if (state.answers.length <= 1) {
        return state;
      }
      const answers = state.answers.filter(obj => obj.id !== id).map((answer, index) => {
        const newId = indexToLetterMap[index];
        if (answer.id === newId) {
          return answer;
        }
        return { ...answer, id: newId };
      });
      return {
        ...state,
        answers,
      };
    },
    addAnswer: (state) => {
      const currAnswers = state.answers;
      if (currAnswers.length >= indexToLetterMap.length) {
        return state;
      }
      const newOption = {
        id: currAnswers.length ? nextAlphaId(currAnswers[currAnswers.length - 1].id) : 'A',
        title: '',
        selectedFeedback: undefined,
        unselectedFeedback: undefined,
        feedback: undefined,
        correct: false,
      };
      if (state.problemType === ProblemTypeKeys.MULTISELECT) {
        newOption.selectedFeedback = '';
        newOption.unselectedFeedback = '';
      } else {
        newOption.feedback = '';
      }
      const answers = [
        ...currAnswers,
        newOption,
      ];
      return {
        ...state,
        answers,
      };
    },
    updateSettings: (state, { payload }) => ({
      ...state,
      settings: {
        ...state.settings,
        ...payload,
      },
    }),
    load: (state, { payload: { settings: { scoring, showAnswer, ...settings }, ...payload } }) => ({
      ...state,
      settings: {
        ...state.settings,
        scoring: { ...state.settings.scoring, ...scoring },
        showAnswer: { ...state.settings.showAnswer, ...showAnswer },
        ...settings,
      },
      ...payload,
    }),
    onSelect: (state, { payload }) => ({
      ...state,
      ...payload,
    }),
  },
});

const actions = StrictDict(problem.actions);

const { reducer } = problem;

export {
  actions,
  initialState,
  reducer,
};
