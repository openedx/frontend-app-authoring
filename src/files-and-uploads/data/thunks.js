import { RequestStatus } from '../../data/constants';
import {
  addModel,
  addModels,
  removeModel,
  removeModels,
  updateModel,
 } from '../../generic/model-store';
import {
  getAssets,
  addAsset,
  deleteAsset,
  getNextPageAssets,
  updateLockStatus,
} from './api';
import {
  setAssetIds,
  setTotalCount,
  updateLoadingStatus,
  updateSavingStatus,
  deleteAssetSuccess,
  updateDeletingStatus,
  addAssetSuccess,
  updateAddingStatus,
} from './slice';

import { getWrapperType } from './utils';

/* eslint-disable import/prefer-default-export */
export function fetchAssets(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ courseId, status: RequestStatus.IN_PROGRESS }));

    try {
      const { assets, totalCount } = await getAssets(courseId);
      const assetsWithWraperType = getWrapperType(assets);
      dispatch(addModels({ modelType: 'assets', models: assetsWithWraperType }));
      dispatch(setAssetIds({
        assetIds: assets.map(asset => asset.id),
      }));
      dispatch(setTotalCount({ totalCount }));
      dispatch(updateLoadingStatus({ courseId, status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateLoadingStatus({ status: RequestStatus.DENIED }));
      }
      dispatch(updateLoadingStatus({ courseId, status: RequestStatus.FAILED }));
    }
  };
}

export function deleteAssetFile(courseId, id, totalCount) {
  return async (dispatch) => {
    dispatch(updateDeletingStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      // assetIds.forEach(async (id) => {
        await deleteAsset(courseId, id);
        dispatch(deleteAssetSuccess({ assetId: id }));
        dispatch(removeModel({ modelType: 'assets', id }));
      // });
      dispatch(setTotalCount({ totalCount: totalCount - 1 }));
      dispatch(updateDeletingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateDeletingStatus({ status: RequestStatus.DENIED }));
      }
      dispatch(updateDeletingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function addAssetFile(courseId, file, totalCount) {
  return async (dispatch) => {
    dispatch(updateAddingStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const { asset } = await addAsset(courseId, file);
      const [assetsWithWraperType] = getWrapperType([asset]);
      dispatch(addModel({
        modelType: 'assets',
        model: { ...assetsWithWraperType },
      }));
      dispatch(addAssetSuccess({
        assetId: asset.id,
      }));
      dispatch(setTotalCount({ totalCount: totalCount + 1 }));
      dispatch(updateAddingStatus({ courseId, status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateAddingStatus({ status: RequestStatus.DENIED }));
      }
      dispatch(updateAddingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function updateAssetLock({ assetId, courseId, locked }) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      await updateLockStatus({ assetId, courseId, locked });
      dispatch(updateModel({
        modelType: 'assets',
        model: {
          id: assetId,
          locked,
        },
      }));
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}

export function updatePageView(courseId, pageNumber, assetIds) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ status: RequestStatus.IN_PROGRESS }));
    try {
      const { assets, totalCount } = await getNextPageAssets(courseId, pageNumber);
      const previousIds = assetIds;
      const assetsWithWraperType = getWrapperType(assets);

      dispatch(addModels({ modelType: 'assets', models: assetsWithWraperType }));
      dispatch(setAssetIds({
        assetIds: assets.map(asset => asset.id),
      }));
      dispatch(removeModels({
        modelType: 'assets',
        ids: previousIds,
      }));
      dispatch(setTotalCount({ totalCount }));
      dispatch(updateLoadingStatus({ courseId, status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateLoadingStatus({ status: RequestStatus.FAILED }));
    }
  };
}
