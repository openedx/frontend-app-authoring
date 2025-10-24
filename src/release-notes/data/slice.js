/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { sortBy } from 'lodash';

const initialState = {
  releaseNotes: [],
  savingStatuses: {
    createReleaseNoteQuery: '',
    editReleaseNoteQuery: '',
    deleteReleaseNoteQuery: '',
  },
  loadingStatuses: {
    fetchReleaseNotesQuery: '',
  },
  errors: {
    creatingNote: false,
    deletingNote: false,
    loadingNotes: false,
    savingNote: false,
  },
};

const slice = createSlice({
  name: 'releaseNotes',
  initialState,
  reducers: {
    fetchReleaseNotesSuccess: (state, { payload }) => {
      state.releaseNotes = payload;
    },
    createReleaseNote: (state, { payload }) => {
      state.releaseNotes = [payload, ...state.releaseNotes];
    },
    editReleaseNote: (state, { payload }) => {
      state.releaseNotes = state.releaseNotes.map((note) => {
        if (note.id === payload.id) {
          return payload;
        }
        return note;
      });
    },
    deleteReleaseNote: (state, { payload }) => {
      if (Array.isArray(payload)) {
        state.releaseNotes = sortBy(payload, 'id').reverse();
      } else {
        state.releaseNotes = state.releaseNotes.filter((note) => note.id !== payload);
      }
    },
    updateSavingStatuses: (state, { payload }) => {
      const { status, error } = payload;
      state.errors = { ...initialState.errors, ...error };
      state.savingStatuses = { ...state.savingStatuses, ...status };
    },
    updateLoadingStatuses: (state, { payload }) => {
      const { status, error } = payload;
      state.errors = { ...initialState.errors, ...error };
      state.loadingStatuses = { ...state.loadingStatuses, ...status };
    },
  },
});

export const {
  fetchReleaseNotesSuccess,
  createReleaseNote,
  editReleaseNote,
  deleteReleaseNote,
  updateSavingStatuses,
  updateLoadingStatuses,
} = slice.actions;

export const {
  reducer,
} = slice;
