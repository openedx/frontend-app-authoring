import { logError } from '@edx/frontend-platform/logging';
import * as api from './api';
import { libraryBlockActions as actions } from './slice';
import { libraryDetailActions as detailActions } from '../../library-detail/data';

export const fetchLibraryBlockMetadata = ({ blockId }) => async (dispatch) => {
  try {
    dispatch(actions.libraryBlockRequest({ blockId }));
    const metadata = await api.getLibraryBlock(blockId);
    dispatch(actions.libraryBlockMetadataSuccess({ blockId, metadata }));
  } catch (error) {
    dispatch(actions.libraryBlockFailed({ blockId, errorMessage: error.message }));
    logError(error);
  }
};

export const fetchLibraryBlockView = ({ blockId, viewSystem, viewName }) => async (dispatch) => {
  try {
    dispatch(actions.libraryBlockRequest({ blockId }));
    const view = await api.renderXBlockView(blockId, viewSystem, viewName);
    dispatch(actions.libraryBlockViewSuccess({ view, blockId }));
  } catch (error) {
    dispatch(actions.libraryBlockFailed({ errorMessage: error.message, blockId }));
    logError(error);
  }
};

export const fetchLibraryBlockAssets = ({ blockId }) => async (dispatch) => {
  try {
    dispatch(actions.libraryBlockRequest({ blockId }));
    const assets = await api.getLibraryBlockAssets(blockId);
    dispatch(actions.libraryBlockAssetsSuccess({ assets }));
  } catch (error) {
    dispatch(actions.libraryBlockFailed({ errorMessage: error.message }));
    logError(error);
  }
};

export const uploadLibraryBlockAssets = ({ blockId, files }) => async (dispatch) => {
  try {
    dispatch(actions.libraryBlockRequest({ blockId }));

    /* Upload each file to this block's static assets.
     *
     * A parallelized implementation would be faster but currently
     * doesn't work due to a race condition in blockstore. */
    files.forEach(file => api.addLibraryBlockAsset(blockId, file.name, file));

    /* This is hackish, but we have to wait for Studio/blockstore to process the files before refreshing them. */
    await new Promise(r => setTimeout(r, 1000));

    dispatch(actions.libraryBlockAssetsSuccess({
      assets: await api.getLibraryBlockAssets(blockId),
      metadata: await api.getLibraryBlock(blockId),
    }));
  } catch (error) {
    dispatch(actions.libraryBlockFailed({ blockId, errorMessage: error.message }));
    logError(error);
  }
};

export const deleteLibraryBlockAsset = ({ blockId, fileName }) => async (dispatch) => {
  try {
    dispatch(actions.libraryBlockRequest({ blockId }));
    await api.deleteLibraryBlockAsset(blockId, fileName);
    dispatch(actions.libraryBlockAssetsSuccess({
      assets: await api.getLibraryBlockAssets(blockId),
      metadata: await api.getLibraryBlock(blockId),
      blockId,
    }));
  } catch (error) {
    dispatch(actions.libraryBlockFailed({ errorMessage: error.message, blockId }));
    logError(error);
  }
};

export const fetchLibraryBlockOlx = ({ blockId }) => async (dispatch) => {
  try {
    dispatch(actions.libraryBlockRequest({ blockId }));
    const olx = await api.getLibraryBlockOlx(blockId);
    dispatch(actions.libraryBlockOlxSuccess({ olx, blockId }));
  } catch (error) {
    dispatch(actions.libraryBlockFailed({ errorMessage: error.message, blockId }));
    logError(error);
  }
};

export const setLibraryBlockOlx = ({ blockId, olx }) => async (dispatch) => {
  try {
    dispatch(actions.libraryBlockRequest({ blockId }));
    await api.setLibraryBlockOlx(blockId, olx);
    dispatch(actions.libraryBlockOlxSuccess({
      olx: await api.getLibraryBlockOlx(blockId),
      metadata: await api.getLibraryBlock(blockId),
      blockId,
    }));
  } catch (error) {
    dispatch(actions.libraryBlockFailed({ errorMessage: error.message, blockId }));
    logError(error);
  }
};

export const deleteLibraryBlock = ({ blockId }) => async (dispatch) => {
  try {
    dispatch(actions.libraryBlockRequest({ blockId }));
    await api.deleteLibraryBlock(blockId);
    dispatch(detailActions.libraryDetailBlockDeleted({ blockId }));
    dispatch(actions.libraryBlockDeleteSuccess({ blockId }));
  } catch (error) {
    dispatch(actions.libraryBlockFailed({ errorMessage: error.message, blockId }));
    throw error;
  }
};

export const setLibraryBlockError = ({ errorMessage, blockId }) => async (dispatch) => {
  dispatch(actions.libraryBlockFailed({ errorMessage, blockId }));
};

export const clearLibraryBlockError = ({ blockId }) => async (dispatch) => {
  dispatch(actions.libraryBlockClearError({ blockId }));
};

export const focusBlock = ({ blockId }) => async (dispatch) => {
  dispatch(actions.libraryEnsureBlock({ blockId }));
  dispatch(actions.libraryFocusBlock({ blockId }));
};

export const initializeBlock = ({ blockId }) => async (dispatch) => {
  dispatch(actions.libraryEnsureBlock({ blockId }));
};

export const removeBlockCache = ({ blockId }) => async (dispatch) => {
  dispatch(actions.libraryClearBlock({ blockId }));
};
