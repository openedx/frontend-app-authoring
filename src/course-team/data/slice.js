/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'courseTeam',
  initialState: {
    users: [],
    show_transfer_ownership_hint: false,
    allow_actions: false,
    errorEmail: '',
  },
  reducers: {
    fetchCourseTeamSuccess: (state, { payload }) => {
      state.users = payload.users;
      state.show_transfer_ownership_hint = payload.show_transfer_ownership_hint;
      state.allow_actions = payload.allow_actions;
    },
    deleteCourseTeamUser: (state, { payload }) => {
      state.users = state.users.filter((user) => user.email !== payload);
    },
    setErrorEmail: (state, { payload }) => {
      state.errorEmail = payload;
    },
  },
});

export const {
  fetchCourseTeamSuccess,
  deleteCourseTeamUser,
  setErrorEmail,
} = slice.actions;

export const {
  reducer,
} = slice;
