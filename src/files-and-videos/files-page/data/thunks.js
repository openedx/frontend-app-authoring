import { isEmpty } from 'lodash';
import { camelCaseObject } from '@edx/frontend-platform';

import { RequestStatus } from '../../../data/constants';
import {
  addModel,
  addModels,
  removeModel,
  updateModel,
} from '../../../generic/model-store';
import {
  getAssets,
  getAssetUsagePaths,
  addAsset,
  deleteAsset,
  updateLockStatus,
  getDownload,
} from './api';
import {
  setAssetIds,
  setSortedAssetIds,
  updateLoadingStatus,
  deleteAssetSuccess,
  addAssetSuccess,
  updateErrors,
  clearErrors,
  updateEditStatus,
} from './slice';

import { updateFileValues } from './utils';

export function fetchAddtionalAsstets(courseId, totalCount) {
  return async (dispatch) => {
    let remainingAssetCount = totalCount;
    let page = 1;

    /* eslint-disable no-await-in-loop */
    while (remainingAssetCount > 0) {
      try {
        const { assets } = await getAssets(courseId, page);
        const parsedAssets = updateFileValues(assets);
        dispatch(addModels({ modelType: 'assets', models: parsedAssets }));
        dispatch(setAssetIds({
          assetIds: assets.map(asset => asset.id),
        }));
        remainingAssetCount -= 50;
        page += 1;
      } catch (error) {
        remainingAssetCount = 0;
        dispatch(updateErrors({ error: 'loading', message: 'Failed to load remaining files.' }));
        dispatch(updateLoadingStatus({ status: RequestStatus.PARTIAL_FAILURE }));
      }
    }
  };
}

export function fetchAssets(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ courseId, status: RequestStatus.IN_PROGRESS }));

    try {
      const { assets, totalCount } = await getAssets(courseId);
      const parsedAssets = updateFileValues(assets);
      dispatch(addModels({ modelType: 'assets', models: parsedAssets }));
      dispatch(setAssetIds({
        assetIds: assets.map(asset => asset.id),
      }));
      if (totalCount > 50) {
        dispatch(fetchAddtionalAsstets(courseId, totalCount - 50));
      }
      dispatch(updateLoadingStatus({ courseId, status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateLoadingStatus({ status: RequestStatus.DENIED }));
      } else {
        dispatch(updateErrors({ error: 'loading', message: 'Failed to load all files.' }));
        dispatch(updateLoadingStatus({ courseId, status: RequestStatus.FAILED }));
      }
    }
  };
}

export function updateAssetOrder(courseId, assetIds) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ courseId, status: RequestStatus.IN_PROGRESS }));
    dispatch(setSortedAssetIds({ assetIds }));
    dispatch(updateLoadingStatus({ courseId, status: RequestStatus.SUCCESSFUL }));
  };
}

export function deleteAssetFile(courseId, id) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'delete', status: RequestStatus.IN_PROGRESS }));

    try {
      await deleteAsset(courseId, id);
      dispatch(deleteAssetSuccess({ assetId: id }));
      dispatch(removeModel({ modelType: 'assets', id }));
      dispatch(updateEditStatus({ editType: 'delete', status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateErrors({ error: 'delete', message: `Failed to delete file id ${id}.` }));
      dispatch(updateEditStatus({ editType: 'delete', status: RequestStatus.FAILED }));
    }
  };
}

export function addAssetFile(courseId, file) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'add', status: RequestStatus.IN_PROGRESS }));

    try {
      const { asset } = await addAsset(courseId, file);
      const [parsedAssets] = updateFileValues([asset]);
      dispatch(addModel({
        modelType: 'assets',
        model: { ...parsedAssets },
      }));
      dispatch(addAssetSuccess({
        assetId: asset.id,
      }));
      dispatch(updateEditStatus({ editType: 'add', status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      if (error.response && error.response.status === 413) {
        const message = error.response.data.error;
        dispatch(updateErrors({ error: 'add', message }));
      } else {
        dispatch(updateErrors({ error: 'add', message: `Failed to add ${file.name}.` }));
      }
      dispatch(updateEditStatus({ editType: 'add', status: RequestStatus.FAILED }));
    }
  };
}

export function updateAssetLock({ assetId, courseId, locked }) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'lock', status: RequestStatus.IN_PROGRESS }));

    try {
      await updateLockStatus({ assetId, courseId, locked });
      dispatch(updateModel({
        modelType: 'assets',
        model: {
          id: assetId,
          locked,
          lockStatus: locked,
        },
      }));
      dispatch(updateEditStatus({ editType: 'lock', status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      const lockStatus = locked ? 'lock' : 'unlock';
      dispatch(updateErrors({ error: 'lock', message: `Failed to ${lockStatus} file id ${assetId}.` }));
      dispatch(updateEditStatus({ editType: 'lock', status: RequestStatus.FAILED }));
    }
  };
}

export function resetErrors({ errorType }) {
  return (dispatch) => { dispatch(clearErrors({ error: errorType })); };
}

export function getUsagePaths({ asset, courseId }) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'usageMetrics', status: RequestStatus.IN_PROGRESS }));
    try {
      const { usageLocations } = await getAssetUsagePaths({ assetId: asset.id, courseId });
      const assetLocations = usageLocations[asset.id];
      const activeStatus = assetLocations?.length > 0 ? 'active' : 'inactive';
      dispatch(updateModel({
        modelType: 'assets',
        model: {
          id: asset.id,
          usageLocations: camelCaseObject(assetLocations),
          activeStatus,
        },
      }));
      dispatch(updateEditStatus({ editType: 'usageMetrics', status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateErrors({ error: 'usageMetrics', message: `Failed to get usage metrics for ${asset.displayName}.` }));
      dispatch(updateEditStatus({ editType: 'usageMetrics', status: RequestStatus.FAILED }));
    }
  };
}

export function fetchAssetDownload({ selectedRows, courseId }) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'download', status: RequestStatus.IN_PROGRESS }));
    const errors = await getDownload(selectedRows, courseId);
    if (isEmpty(errors)) {
      dispatch(updateEditStatus({ editType: 'download', status: RequestStatus.SUCCESSFUL }));
    } else {
      errors.forEach(error => {
        dispatch(updateErrors({ error: 'download', message: error }));
      });
      dispatch(updateEditStatus({ editType: 'download', status: RequestStatus.FAILED }));
    }
  };
}
