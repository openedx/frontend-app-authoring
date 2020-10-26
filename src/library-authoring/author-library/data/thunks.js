import debounce from 'lodash.debounce';
import * as api from './api';
import { libraryAuthoringActions as actions } from './slice';
import { annotateThunk, logError } from '../../common/data';
import { normalizeErrors } from '../../common/helpers';

const toError = (dispatch, error, attr) => {
  dispatch(actions.libraryAuthoringFailed({ errorMessage: error.message, errorFields: error.fields, attr }));
  logError(error);
};

export const fetchLibraryDetail = annotateThunk(({ libraryId }) => async (dispatch) => {
  try {
    dispatch(actions.libraryAuthoringRequest({ attr: 'library' }));
    const library = await api.getLibraryDetail(libraryId).catch(normalizeErrors);
    dispatch(actions.libraryAuthoringSuccess({ value: library, attr: 'library' }));
  } catch (error) {
    toError(dispatch, error, 'library');
  }
});

export const fetchBlocks = annotateThunk(({ libraryId, query }) => async (dispatch) => {
  try {
    dispatch(actions.libraryAuthoringRequest({ attr: 'blocks' }));
    const blocks = await api.getBlocks({ libraryId, query }).catch(normalizeErrors);
    dispatch(actions.libraryAuthoringSuccess({ value: blocks, attr: 'blocks' }));
  } catch (error) {
    toError(dispatch, error, 'blocks');
  }
});

export const createBlock = annotateThunk(({ libraryId, data }) => async (dispatch) => {
  try {
    dispatch(actions.libraryAuthoringRequest({ attr: 'blocks' }));
    const libraryBlock = await api.createLibraryBlock({ libraryId, data }).catch(normalizeErrors);
    dispatch(actions.libraryCreateBlockSuccess({ libraryBlock }));
  } catch (error) {
    toError(dispatch, error, 'blocks');
  }
});

export const commitLibraryChanges = annotateThunk(({ libraryId }) => async (dispatch) => {
  try {
    dispatch(actions.libraryAuthoringRequest({ attr: 'library' }));
    await api.commitLibraryChanges(libraryId).catch(normalizeErrors);
    const library = await api.getLibraryDetail(libraryId).catch(normalizeErrors);
    dispatch(actions.libraryAuthoringSuccess({ value: library, attr: 'library' }));
  } catch (error) {
    toError(dispatch, error, 'library');
  }
});

export const revertLibraryChanges = annotateThunk(({ libraryId }) => async (dispatch) => {
  try {
    dispatch(actions.libraryAuthoringRequest({ attr: 'library' }));
    await api.revertLibraryChanges(libraryId).catch(normalizeErrors);
    const [library, blocks] = await Promise.all(
      [api.getLibraryDetail(libraryId), api.getBlocks({ libraryId })],
    ).catch(normalizeErrors);
    dispatch(actions.libraryAuthoringSuccess({ value: library, attr: 'library' }));
    dispatch(actions.libraryAuthoringSuccess({ value: blocks, attr: 'blocks' }));
  } catch (error) {
    toError(dispatch, error, 'library');
    toError(dispatch, error, 'blocks');
  }
});

export const clearLibraryError = annotateThunk(() => async (dispatch) => {
  dispatch(actions.libraryAuthoringClearError());
});

export const clearLibrary = annotateThunk(() => async (dispatch) => {
  dispatch(actions.libraryAuthoringReset());
});

const baseBlockSearch = ({
  dispatch, libraryId, query, types,
}) => {
  dispatch(actions.libraryAuthoringRequest({ attr: 'blocks' }));
  api.getBlocks({ libraryId, query, types }).then((blocks) => {
    dispatch(actions.libraryAuthoringSuccess({ value: blocks, attr: 'blocks' }));
  }).catch(normalizeErrors).catch((error) => {
    toError(dispatch, error, 'blocks');
  });
};

export const debouncedBlockSearch = debounce(baseBlockSearch, 200);

export const searchLibrary = annotateThunk(({ libraryId, query, types }) => async (dispatch) => {
  debouncedBlockSearch({
    dispatch, libraryId, query, types,
  });
});
