import * as api from './api';
import { libraryBlockActions as actions } from './slice';
import { libraryAuthoringActions as detailActions } from '../../author-library/data';
import { annotateThunk, logError } from '../../common/data';

export const fetchLibraryBlockMetadata = annotateThunk(({ blockId }) => async (dispatch) => {
  try {
    dispatch(actions.libraryBlockRequest({ blockId, attr: 'metadata' }));
    const metadata = await api.getLibraryBlock(blockId);
    dispatch(actions.libraryBlockSuccess({ blockId, value: metadata, attr: 'metadata' }));
  } catch (error) {
    dispatch(actions.libraryBlockFailed({ blockId, errorMessage: error.message, attr: 'metadata' }));
    logError(error);
  }
});

export const fetchLibraryBlockView = annotateThunk(({ blockId, viewSystem, viewName }) => async (dispatch) => {
  try {
    dispatch(actions.libraryBlockRequest({ blockId, attr: 'view' }));
    const view = await api.renderXBlockView(blockId, viewSystem, viewName);
    dispatch(actions.libraryBlockSuccess({ value: view, blockId, attr: 'view' }));
  } catch (error) {
    dispatch(actions.libraryBlockFailed({ errorMessage: error.message, blockId, attr: 'view' }));
    logError(error);
  }
});

export const fetchLibraryBlockAssets = annotateThunk(({ blockId }) => async (dispatch) => {
  try {
    dispatch(actions.libraryBlockRequest({ blockId, attr: 'assets' }));
    const assets = await api.getLibraryBlockAssets(blockId);
    dispatch(actions.libraryBlockSuccess({ blockId, value: assets, attr: 'assets' }));
  } catch (error) {
    dispatch(actions.libraryBlockFailed({ errorMessage: error.message, attr: 'assets' }));
    logError(error);
  }
});

export const uploadLibraryBlockAssets = annotateThunk(({ blockId, files }) => async (dispatch) => {
  try {
    dispatch(actions.libraryBlockRequest({ blockId, attr: 'assets' }));

    /* Upload each file to this block's static assets.
     *
     * A parallelized implementation would be faster but currently
     * doesn't work due to a race condition in blockstore. */
    files.forEach(file => api.addLibraryBlockAsset(blockId, file.name, file));

    /* This is hackish, but we have to wait for Studio/blockstore to process the files before refreshing them. */
    await new Promise(r => { setTimeout(r, 1000); });

    const [metadata, assets] = await Promise.all(
      [api.getLibraryBlock(blockId), api.getLibraryBlockAssets(blockId)],
    );
    dispatch(actions.libraryBlockSuccess({ blockId, value: assets, attr: 'assets' }));
    dispatch(actions.libraryBlockSuccess({ blockId, value: metadata, attr: 'metadata' }));
  } catch (error) {
    dispatch(actions.libraryBlockFailed({ blockId, errorMessage: error.message }));
    logError(error);
  }
});

export const deleteLibraryBlockAsset = annotateThunk(({ blockId, fileName }) => async (dispatch) => {
  try {
    dispatch(actions.libraryBlockRequest({ blockId, attr: 'assets' }));
    await api.deleteLibraryBlockAsset(blockId, fileName);
    const [assets, metadata] = await Promise.all([api.getLibraryBlockAssets(blockId), api.getLibraryBlock(blockId)]);
    dispatch(actions.libraryBlockSuccess({ blockId, value: assets, attr: 'assets' }));
    dispatch(actions.libraryBlockSuccess({ blockId, value: metadata, attr: 'metadata' }));
  } catch (error) {
    dispatch(actions.libraryBlockFailed({ errorMessage: error.message, blockId }));
    logError(error);
  }
});

export const fetchLibraryBlockOlx = annotateThunk(({ blockId }) => async (dispatch) => {
  try {
    dispatch(actions.libraryBlockRequest({ blockId, attr: 'olx' }));
    const olx = await api.getLibraryBlockOlx(blockId);
    dispatch(actions.libraryBlockSuccess({ value: olx, blockId, attr: 'olx' }));
  } catch (error) {
    dispatch(actions.libraryBlockFailed({ errorMessage: error.message, blockId }));
    logError(error);
  }
});

export const setLibraryBlockDisplayName = annotateThunk(({ blockId, displayName }) => async (dispatch) => {
  dispatch(actions.libraryBlockUpdateDisplayName({ blockId, displayName }));
  dispatch(detailActions.libraryBlockUpdateDisplayName({ blockId, displayName }));
});

export const setLibraryBlockOlx = annotateThunk(({ blockId, olx }) => async (dispatch) => {
  try {
    dispatch(actions.libraryBlockRequest({ blockId, attr: 'olx' }));
    await api.setLibraryBlockOlx(blockId, olx);
    const [newOlx, metadata] = await Promise.all([api.getLibraryBlockOlx(blockId), api.getLibraryBlock(blockId)]);
    dispatch(actions.libraryBlockSuccess({ attr: 'olx', value: newOlx, blockId }));
    dispatch(actions.libraryBlockSuccess({ attr: 'metadata', value: metadata, blockId }));
  } catch (error) {
    dispatch(actions.libraryBlockFailed({ errorMessage: error.message, blockId }));
    logError(error);
  }
});

export const deleteLibraryBlock = annotateThunk(({ blockId }) => async (dispatch) => {
  try {
    dispatch(actions.libraryBlockRequest({ blockId, attr: 'deletion' }));
    await api.deleteLibraryBlock(blockId);
    dispatch(detailActions.libraryAuthoringBlockDeleted({ blockId }));
    dispatch(actions.libraryClearBlock({ blockId }));
  } catch (error) {
    dispatch(actions.libraryBlockFailed({ errorMessage: error.message, blockId }));
    throw error;
  }
});

export const setLibraryBlockError = annotateThunk(({ errorMessage, blockId, attr }) => async (dispatch) => {
  dispatch(actions.libraryBlockFailed({ errorMessage, blockId, attr }));
});

export const clearLibraryBlockError = annotateThunk(({ blockId }) => async (dispatch) => {
  dispatch(actions.libraryBlockClearError({ blockId }));
});

export const focusBlock = annotateThunk(({ blockId }) => async (dispatch) => {
  dispatch(actions.libraryEnsureBlock({ blockId }));
  dispatch(actions.libraryFocusBlock({ blockId }));
});

export const initializeBlock = annotateThunk(({ blockId }) => async (dispatch) => {
  dispatch(actions.libraryEnsureBlock({ blockId }));
});
