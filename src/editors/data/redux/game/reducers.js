import { createSlice } from '@reduxjs/toolkit';
import { StrictDict } from '../../../utils';

const initialState = {
  settings: {},
  // TODO fill in with mock state
  exampleValue: 'this is an example value from the redux state',
};

// eslint-disable-next-line no-unused-vars
const game = createSlice({
  name: 'game',
  initialState,
  reducers: {
    updateField: (state, { payload }) => ({
      ...state,
      ...payload,
    }),
    // TODO fill in reducers
  },
});

const actions = StrictDict(game.actions);

const { reducer } = game;

export {
  actions,
  initialState,
  reducer,
};
