import _ from 'lodash';
import { createSlice } from '@reduxjs/toolkit';
import { indexToLetterMap } from '../../../containers/ProblemEditor/data/OLXParser';
import { StrictDict } from '../../../utils';
import { ProblemTypeKeys, RichTextProblems } from '../../constants/problem';
import { ToleranceTypes } from '../../../containers/ProblemEditor/components/EditProblemView/SettingsWidget/settingsComponents/Tolerance/constants';
import type { EditorState } from '..';

const nextAlphaId = (lastId: string) => String.fromCharCode(lastId.charCodeAt(0) + 1);

const initialState: EditorState['problem'] = {
  rawOLX: '',
  problemType: null,
  question: '',
  answers: [],
  correctAnswerCount: 0,
  groupFeedbackList: [],
  generalFeedback: '',
  additionalAttributes: {},
  defaultSettings: {},
  isDirty: false,
  settings: {
    randomization: null,
    scoring: {
      weight: 1,
      attempts: {
        unlimited: true,
        number: null,
      },
    },
    hints: [],
    timeBetween: 0,
    showAnswer: {
      on: '',
      afterAttempts: 0,
    },
    showResetButton: null,
    solutionExplanation: '',
    tolerance: {
      value: null,
      type: ToleranceTypes.none.type,
    },
  },
};

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
      isDirty: true,
    }),
    updateAnswer: (state, { payload }) => {
      const { id, hasSingleAnswer, ...answer } = payload;
      let { correctAnswerCount } = state;
      const answers = state.answers.map(obj => {
        if (obj.id === id) {
          if (_.has(answer, 'correct') && payload.correct) {
            correctAnswerCount += 1;
          }
          if (_.has(answer, 'correct') && payload.correct === false && correctAnswerCount > 0) {
            correctAnswerCount -= 1;
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
        isDirty: true,
      };
    },
    deleteAnswer: (state, { payload }) => {
      const { id, correct, editorState } = payload;
      const EditorsArray = (window as any).tinymce.editors;
      if (state.answers.length === 1) {
        return {
          ...state,
          correctAnswerCount: state.problemType === ProblemTypeKeys.NUMERIC ? 1 : 0,
          isDirty: true,
          answers: [{
            id: 'A',
            title: '',
            selectedFeedback: '',
            unselectedFeedback: '',
            correct: state.problemType === ProblemTypeKeys.NUMERIC,
            isAnswerRange: false,
          }],
        };
      }
      const answers = state.answers.filter(obj => obj.id !== id).map((answer, index) => {
        const newId = indexToLetterMap[index];
        if (answer.id === newId) {
          return answer;
        }
        let newAnswer = {
          ...answer,
          id: newId,
          selectedFeedback: editorState.selectedFeedback ? editorState.selectedFeedback[answer.id] : '',
          unselectedFeedback: editorState.unselectedFeedback ? editorState.unselectedFeedback[answer.id] : '',
        };
        if (RichTextProblems.includes(state.problemType as any)) {
          newAnswer = {
            ...newAnswer,
            title: editorState.answers[answer.id],
          };
          if (EditorsArray[`answer-${newId}`]) {
            EditorsArray[`answer-${newId}`].setContent(newAnswer.title ?? '');
          }
        }
        // Note: The following assumes selectedFeedback and unselectedFeedback is using ExpandedTextArea
        //   Content only needs to be set here when the 'next' feedback fields are shown.
        if (EditorsArray[`selectedFeedback-${newId}`]) {
          EditorsArray[`selectedFeedback-${newId}`].setContent(newAnswer.selectedFeedback ?? '');
        }
        if (EditorsArray[`unselectedFeedback-${newId}`]) {
          EditorsArray[`unselectedFeedback-${newId}`].setContent(newAnswer.unselectedFeedback ?? '');
        }
        return newAnswer;
      });
      const groupFeedbackList = state.groupFeedbackList.map(feedback => {
        const newAnswers = feedback.answers.filter(obj => obj !== id).map(letter => {
          if (letter.charCodeAt(0) > id.charCodeAt(0)) {
            return String.fromCharCode(letter.charCodeAt(0) - 1);
          }
          return letter;
        });
        return { ...feedback, answers: newAnswers };
      });
      return {
        ...state,
        answers,
        correctAnswerCount: correct ? state.correctAnswerCount - 1 : state.correctAnswerCount,
        groupFeedbackList,
        isDirty: true,
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
        correct: state.problemType === ProblemTypeKeys.NUMERIC,
        isAnswerRange: false,
      };
      let { correctAnswerCount } = state;
      if (state.problemType === ProblemTypeKeys.NUMERIC) {
        correctAnswerCount += 1;
      }

      const answers = [
        ...currAnswers,
        newOption,
      ];
      return {
        ...state,
        correctAnswerCount,
        isDirty: true,
        answers,
      };
    },
    addAnswerRange: (state) => {
      // As you may only have one answer range at a time, overwrite the answer object.
      const newOption = {
        id: 'A',
        title: '',
        selectedFeedback: '',
        unselectedFeedback: '',
        correct: state.problemType === ProblemTypeKeys.NUMERIC,
        isAnswerRange: true,
      };
      const correctAnswerCount = 1;
      return {
        ...state,
        correctAnswerCount,
        answers: [newOption],
        isDirty: true,
      };
    },

    updateSettings: (state, { payload }) => ({
      ...state,
      settings: {
        ...state.settings,
        ...payload,
      },
      isDirty: true,
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
    setEnableTypeSelection: (state, { payload }) => {
      const { maxAttempts, showanswer, showResetButton } = payload;
      const attempts = { number: maxAttempts, unlimited: false };
      return {
        ...state,
        settings: {
          ...state.settings,
          scoring: { ...state.settings.scoring, attempts },
          showAnswer: { ...state.settings.showAnswer, on: showanswer },
          showResetButton,
        },
        problemType: null,
      };
    },
  },
});

const actions = StrictDict(problem.actions);

const { reducer } = problem;

export {
  actions,
  initialState,
  reducer,
};
