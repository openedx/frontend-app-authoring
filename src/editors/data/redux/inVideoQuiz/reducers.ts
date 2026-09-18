import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { StrictDict } from '../../../utils';

export interface QuizItem {
  id: string;
  problemId: string;
  time: string;
  jumpBack: string;
}

export interface VideoOption {
  id: string;
  display_name: string;
  duration?: number;
}

export interface ProblemOption {
  id: string;
  display_name: string;
}

export interface InVideoQuizState {
  selectedVideo: string | null;
  videos: VideoOption[];
  problems: ProblemOption[];
  unitContentLoaded: boolean;
  quizItems: QuizItem[];
  isDirty: boolean;
}

const generateId = (): string => `problem-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const makeEmptyQuizItem = (): QuizItem => ({
  id: generateId(),
  problemId: '',
  time: '',
  jumpBack: '',
});

const initialState: InVideoQuizState = {
  selectedVideo: null,
  videos: [],
  problems: [],
  unitContentLoaded: false,
  quizItems: [makeEmptyQuizItem()],
  isDirty: false,
};

export interface UpdateQuizItemPayload {
  index: number;
  field: keyof QuizItem;
  value: string;
}

const inVideoQuiz = createSlice({
  name: 'inVideoQuiz',
  initialState,
  reducers: {
    setSelectedVideo: (state, { payload }: PayloadAction<string | null>) => ({
      ...state,
      selectedVideo: payload,
      isDirty: true,
    }),
    setVideos: (state, { payload }: PayloadAction<VideoOption[]>) => ({
      ...state,
      videos: payload,
    }),
    setProblems: (state, { payload }: PayloadAction<ProblemOption[]>) => ({
      ...state,
      problems: payload,
    }),
    setUnitContentLoaded: (state, { payload }: PayloadAction<boolean>) => ({
      ...state,
      unitContentLoaded: payload,
    }),
    setQuizItems: (state, { payload }: PayloadAction<QuizItem[]>) => ({
      ...state,
      quizItems: payload,
      isDirty: true,
    }),
    addQuizItem: (state) => ({
      ...state,
      quizItems: [
        ...state.quizItems,
        makeEmptyQuizItem(),
      ],
      isDirty: true,
    }),
    removeQuizItem: (state, { payload }: PayloadAction<{ index: number; }>) => {
      const { index } = payload;
      if (index < 0 || index >= state.quizItems.length) { return state; }
      return {
        ...state,
        quizItems: state.quizItems.filter((_, idx) => idx !== index),
        isDirty: true,
      };
    },
    updateQuizItem: (state, { payload }: PayloadAction<UpdateQuizItemPayload>) => {
      const { index, field, value } = payload;
      if (!state.quizItems[index]) { return state; }
      const newQuizItems = state.quizItems.map((item, idx) => (
        idx === index ? { ...item, [field]: value } : item
      ));
      return { ...state, quizItems: newQuizItems, isDirty: true };
    },
    setDirty: (state, { payload }: PayloadAction<boolean>) => ({
      ...state,
      isDirty: payload,
    }),
    reset: () => initialState,
  },
});

const baseActions = inVideoQuiz.actions;

const actions = StrictDict({
  ...baseActions,
  updateProblemId: ({ index, problemId }: { index: number; problemId: string; }) => (
    baseActions.updateQuizItem({ index, field: 'problemId', value: problemId })
  ),
  updateTime: ({ index, time }: { index: number; time: string; }) => (
    baseActions.updateQuizItem({ index, field: 'time', value: time })
  ),
  updateJumpBack: ({ index, jumpBack }: { index: number; jumpBack: string; }) => (
    baseActions.updateQuizItem({ index, field: 'jumpBack', value: jumpBack })
  ),
});

const { reducer } = inVideoQuiz;

export { actions, initialState, reducer };
