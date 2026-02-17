import { createSlice } from '@reduxjs/toolkit';
import { StrictDict } from '../../../utils';

const generateId = () => `problem-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const initialState = {
  selectedVideo: null,
  videos: [],
  problems: [],
  quizItems: [
    {
      id: generateId(),
      problemId: '',
      time: '',
      jumpBack: '',
    },
  ],
  isDirty: false,
};

const inVideoQuiz = createSlice({
  name: 'inVideoQuiz',
  initialState,
  reducers: {
    setSelectedVideo: (state, { payload }) => ({
      ...state,
      selectedVideo: payload,
      isDirty: true,
    }),
    setVideos: (state, { payload }) => ({
      ...state,
      videos: payload,
    }),
    setProblems: (state, { payload }) => ({
      ...state,
      problems: payload,
    }),
    setQuizItems: (state, { payload }) => ({
      ...state,
      quizItems: payload,
      isDirty: true,
    }),
    addQuizItem: (state) => ({
      ...state,
      quizItems: [
        ...state.quizItems,
        {
          id: generateId(),
          problemId: '',
          time: '',
          jumpBack: '',
        },
      ],
      isDirty: true,
    }),
    removeQuizItem: (state, { payload }) => {
      const { index } = payload;
      if (index < 0 || index >= state.quizItems.length) { return state; }
      return {
        ...state,
        quizItems: state.quizItems.filter((_, idx) => idx !== index),
        isDirty: true,
      };
    },
    updateQuizItem: (state, { payload }) => {
      const { index, field, value } = payload;
      if (!state.quizItems[index]) { return state; }
      const newQuizItems = state.quizItems.map((item, idx) => (
        idx === index ? { ...item, [field]: value } : item
      ));
      return { ...state, quizItems: newQuizItems, isDirty: true };
    },
    setDirty: (state, { payload }) => ({
      ...state,
      isDirty: payload,
    }),
    reset: () => initialState,
  },
});

const baseActions = inVideoQuiz.actions;

const actions = StrictDict({
  ...baseActions,
  updateProblemId: ({ index, problemId }) => baseActions.updateQuizItem({ index, field: 'problemId', value: problemId }),
  updateTime: ({ index, time }) => baseActions.updateQuizItem({ index, field: 'time', value: time }),
  updateJumpBack: ({ index, jumpBack }) => baseActions.updateQuizItem({ index, field: 'jumpBack', value: jumpBack }),
});

const { reducer } = inVideoQuiz;

export {
  actions,
  initialState,
  reducer,
};
