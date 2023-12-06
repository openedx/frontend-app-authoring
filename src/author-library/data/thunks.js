import debounce from 'lodash.debounce';
import { annotateThunk, logError } from '@src/library-authoring/common/data';
import { normalizeErrors } from '@src/library-authoring/common/helpers';
import * as api from './api';
import { libraryAuthoringActions as actions } from './slice';

const toError = (dispatch, error, attr) => {
  dispatch(actions.libraryAuthoringFailed({ errorMessage: error.message, errorFields: error.fields, attr }));
  logError(error);
};

let controllers = [];
export const fetchLibraryDetail = annotateThunk(({ libraryId }) => async (dispatch) => {
  try {
    const currentController = new AbortController();
    controllers.push(currentController);
    dispatch(actions.libraryAuthoringRequest({ attr: 'library' }));
    const library = await api.getLibraryDetail(libraryId, currentController).catch(normalizeErrors);
    dispatch(actions.libraryAuthoringSuccess({ value: library, attr: 'library' }));
  } catch (error) {
    toError(dispatch, error, 'library');
  }
});

export const fetchBlocks = annotateThunk(({ libraryId, paginationParams, query }) => async (dispatch) => {
  try {
    const currentController = new AbortController();
    controllers.push(currentController);
    dispatch(actions.libraryAuthoringRequest({ attr: 'blocks' }));
    const blocks = await api.getBlocks({
      libraryId,
      paginationParams,
      query,
      controller: currentController,
    }).catch(normalizeErrors);
    dispatch(actions.libraryAuthoringSuccess({ value: blocks, attr: 'blocks' }));
  } catch (error) {
    toError(dispatch, error, 'blocks');
  }
});

export const fetchBlockLtiUrl = annotateThunk(({ blockId }) => async (dispatch) => {
  try {
    dispatch(actions.libraryBlockLtiUrlFetchRequest({ blockId }));
    const libraryBlockLtiUrl = await api.getBlockLtiUrl({ blockId }).catch(normalizeErrors);
    dispatch(actions.libraryAuthoringSuccess({
      value: { blockId, lti_url: libraryBlockLtiUrl.lti_url },
      attr: 'ltiUrlClipboard',
      message: 'LTI URL copied to clipboard.',
    }));
  } catch (error) {
    toError(dispatch, error, 'ltiUrlClipboard');
  }
});

export const createBlock = annotateThunk(({
  libraryId, data, paginationParams, query, types,
}) => async (dispatch) => {
  try {
    dispatch(actions.libraryAuthoringRequest({ attr: 'blocks' }));
    await api.createLibraryBlock({ libraryId, data }).catch(normalizeErrors);
    const [library, blocks] = await Promise.all([
      api.getLibraryDetail(libraryId),
      api.getBlocks({
        libraryId, paginationParams, query, types,
      }),
    ]).catch(normalizeErrors);
    dispatch(actions.libraryAuthoringSuccess({ value: library, attr: 'library' }));
    dispatch(actions.libraryAuthoringSuccess({ value: blocks, attr: 'blocks' }));
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

export const revertLibraryChanges = annotateThunk(({ libraryId, paginationParams }) => async (dispatch) => {
  try {
    dispatch(actions.libraryAuthoringRequest({ attr: 'library' }));
    await api.revertLibraryChanges(libraryId).catch(normalizeErrors);
    const [library, blocks] = await Promise.all([
      api.getLibraryDetail(libraryId),
      api.getBlocks({ libraryId, paginationParams }),
    ]).catch(normalizeErrors);
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

export const clearLibrarySuccess = annotateThunk(() => async (dispatch) => {
  dispatch(actions.libraryAuthoringClearSuccess());
});

export const clearLibrary = annotateThunk(() => async (dispatch) => {
  if (controllers) {
    controllers.forEach(control => {
      control.abort();
    });
  }
  dispatch(actions.libraryAuthoringReset());
  controllers = [];
});

const baseBlockSearch = ({
  dispatch, libraryId, paginationParams, query, types,
}) => {
  const currentController = new AbortController();
  controllers.push(currentController);
  dispatch(actions.libraryAuthoringRequest({ attr: 'blocks' }));
  api.getBlocks({
    libraryId, paginationParams, query, types, controller: currentController,
  }).then((blocks) => {
    dispatch(actions.libraryAuthoringSuccess({ value: blocks, attr: 'blocks' }));
  }).catch(normalizeErrors).catch((error) => {
    toError(dispatch, error, 'blocks');
  });
};

export const debouncedBlockSearch = debounce(baseBlockSearch, 200);

export const searchLibrary = annotateThunk(({
  libraryId, paginationParams, query, types,
}) => async (dispatch) => {
  debouncedBlockSearch({
    dispatch, libraryId, paginationParams, query, types,
  });
});
