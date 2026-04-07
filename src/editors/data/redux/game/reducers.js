import { createSlice } from '@reduxjs/toolkit';
import { StrictDict } from '../../../utils';

const generateId = () => `card-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const initialState = {
  settings: {
    shuffle: false,
    timer: false,
  },
  type: 'flashcards',
  list: [
    {
      id: generateId(),
      term: '',
      term_image: '',
      definition: '',
      definition_image: '',
      editorOpen: true,
    },
  ],
  isDirty: false,
};

const game = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // settings
    shuffleTrue: (state) => ({
      ...state,
      settings: {
        ...state.settings,
        shuffle: true,
      },
      isDirty: true,
    }),
    shuffleFalse: (state) => ({
      ...state,
      settings: {
        ...state.settings,
        shuffle: false,
      },
      isDirty: true,
    }),
    timerTrue: (state) => ({
      ...state,
      settings: {
        ...state.settings,
        timer: true,
      },
      isDirty: true,
    }),
    timerFalse: (state) => ({
      ...state,
      settings: {
        ...state.settings,
        timer: false,
      },
      isDirty: true,
    }),
    // type
    updateType: (state, { payload }) => ({
      ...state,
      type: payload,
      isDirty: true,
    }),
    // list operations
    updateTerm: (state, { payload }) => {
      const { index, term } = payload;
      if (!state.list[index]) { return state; }
      const newList = state.list.map((item, idx) => (idx === index ? { ...item, term } : item));
      return { ...state, list: newList, isDirty: true };
    },
    updateTermImage: (state, { payload }) => {
      const { index, termImage } = payload;
      if (!state.list[index]) { return state; }
      const newList = state.list.map((item, idx) => (idx === index ? { ...item, term_image: termImage } : item));
      return { ...state, list: newList, isDirty: true };
    },
    updateDefinition: (state, { payload }) => {
      const { index, definition } = payload;
      if (!state.list[index]) { return state; }
      const newList = state.list.map((item, idx) => (idx === index ? { ...item, definition } : item));
      return { ...state, list: newList, isDirty: true };
    },
    updateDefinitionImage: (state, { payload }) => {
      const { index, definitionImage } = payload;
      if (!state.list[index]) { return state; }
      const newList = state.list.map(
        (item, idx) => (idx === index ? { ...item, definition_image: definitionImage } : item),
      );
      return { ...state, list: newList, isDirty: true };
    },
    toggleOpen: (state, { payload }) => {
      const { index, isOpen } = payload;
      if (!state.list[index]) { return state; }
      const newList = state.list.map((item, idx) => (idx === index ? { ...item, editorOpen: !!isOpen } : item));
      return { ...state, list: newList, isDirty: true };
    },
    setList: (state, { payload }) => ({
      ...state,
      list: payload,
      isDirty: true,
    }),
    addCard: (state) => ({
      ...state,
      list: [
        ...state.list,
        {
          id: generateId(),
          term: '',
          term_image: '',
          definition: '',
          definition_image: '',
          editorOpen: true,
        },
      ],
      isDirty: true,
    }),
    removeCard: (state, { payload }) => {
      const { index } = payload;
      if (index < 0 || index >= state.list.length) { return state; }
      return {
        ...state,
        list: state.list.filter((_, idx) => idx !== index),
        isDirty: true,
      };
    },
    setDirty: (state, { payload }) => ({
      ...state,
      isDirty: payload,
    }),
  },
});

const actions = StrictDict(game.actions);

const { reducer } = game;

export {
  actions,
  initialState,
  reducer,
};
