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
    // Unified setting update
    updateSetting: (state, { payload }) => {
      const { key, value } = payload;
      return {
        ...state,
        settings: {
          ...state.settings,
          [key]: value,
        },
        isDirty: true,
      };
    },
    // type
    updateType: (state, { payload }) => ({
      ...state,
      type: payload,
      isDirty: true,
    }),
    // Unified card field update
    updateCardField: (state, { payload }) => {
      const { index, field, value } = payload;
      if (!state.list[index]) { return state; }
      const newList = state.list.map((item, idx) => (idx === index ? { ...item, [field]: value } : item));
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

// Create backward-compatible action creators
const baseActions = game.actions;

const actions = StrictDict({
  ...baseActions,
  // Backward compatible wrappers for settings
  shuffleTrue: () => baseActions.updateSetting({ key: 'shuffle', value: true }),
  shuffleFalse: () => baseActions.updateSetting({ key: 'shuffle', value: false }),
  timerTrue: () => baseActions.updateSetting({ key: 'timer', value: true }),
  timerFalse: () => baseActions.updateSetting({ key: 'timer', value: false }),
  // Backward compatible wrappers for card fields
  updateTerm: ({ index, term }) => baseActions.updateCardField({ index, field: 'term', value: term }),
  updateTermImage: ({ index, termImage }) => baseActions.updateCardField({ index, field: 'term_image', value: termImage }),
  updateDefinition: ({ index, definition }) => baseActions.updateCardField({ index, field: 'definition', value: definition }),
  updateDefinitionImage: ({ index, definitionImage }) => baseActions.updateCardField({ index, field: 'definition_image', value: definitionImage }),
  toggleOpen: ({ index, isOpen }) => baseActions.updateCardField({ index, field: 'editorOpen', value: !!isOpen }),
});

const { reducer } = game;

export {
  actions,
  initialState,
  reducer,
};
