import { RequestStatus } from '../../data/constants';
import {
  addModel,
  addModels,
  removeModel,
  updateModel,
} from '../../generic/model-store';
import {
  getAssets,
  addAsset,
  deleteAsset,
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
  updateErrors,
} from './slice';

import { getWrapperType } from './utils';

export function fetchAssets(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ courseId, status: RequestStatus.IN_PROGRESS }));

    try {
      const { totalCount } = await getAssets(courseId);
      const { assets } = await getAssets(courseId, totalCount);
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
      } else {
        dispatch(updateLoadingStatus({ courseId, status: RequestStatus.FAILED }));
      }
    }
  };
}

export function deleteAssetFile(courseId, id, totalCount) {
  return async (dispatch) => {
    dispatch(updateDeletingStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      await deleteAsset(courseId, id);
      dispatch(deleteAssetSuccess({ assetId: id }));
      dispatch(removeModel({ modelType: 'assets', id }));
      dispatch(setTotalCount({ totalCount: totalCount - 1 }));
      dispatch(updateDeletingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateErrors({ error: 'delete', message: `Failed to delete file id ${id}.` }));
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
      if (error.response && error.response.status === 413) {
        const message = error.response.data.error;
        dispatch(updateErrors({ error: 'upload', message }));
      } else {
        dispatch(updateErrors({ error: 'upload', message: `Failed to add ${file.name}.` }));
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
      const lockStatus = locked ? 'lock' : 'unlock';
      dispatch(updateErrors({ error: 'lock', message: `Failed to ${lockStatus} file id ${assetId}.` }));
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  };
}
