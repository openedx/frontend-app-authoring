import _ from 'lodash-es';
import { createSlice } from '@reduxjs/toolkit';
import { indexToLetterMap } from '../../../containers/ProblemEditor/data/OLXParser';
import { StrictDict } from '../../../utils';
import { ShowAnswerTypesKeys } from '../../constants/problem';

const nextAlphaId = (lastId) => String.fromCharCode(lastId.charCodeAt(0) + 1);
const initialState = {
  rawOLX: '',
  problemType: null,
  question: '',
  answers: [],
  correctAnswerCount: 0,
  groupFeedbackList: [],
  additionalAttributes: {},
  settings: {
    scoring: {
      weight: 0,
      attempts: {
        unlimited: true,
        number: null,
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
      let { correctAnswerCount } = state;
      const answers = state.answers.map(obj => {
        if (obj.id === id) {
          if (_.has(answer, 'correct') && payload.correct) {
            correctAnswerCount += 1;
            return { ...obj, ...answer };
          }
          if (_.has(answer, 'correct') && payload.correct === false) {
            correctAnswerCount -= 1;
            return { ...obj, ...answer };
          }
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
        correctAnswerCount,
        answers,
      };
    },
    deleteAnswer: (state, { payload }) => {
      const { id, correct } = payload;
      if (state.answers.length <= 1) {
        return state;
      }
      let { correctAnswerCount } = state;
      if (correct) {
        correctAnswerCount -= 1;
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
        correctAnswerCount,
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
        selectedFeedback: '',
        unselectedFeedback: '',
        correct: false,
      };

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
    setEnableTypeSelection: (state) => ({
      ...state,
      problemType: null,
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
