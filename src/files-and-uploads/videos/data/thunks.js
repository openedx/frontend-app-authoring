// import { isEmpty } from 'lodash';
import { RequestStatus } from '../../../data/constants';
import {
  // addModel,
  addModels,
  removeModel,
  // updateModel,
} from '../../../generic/model-store';
import {
  getVideos,
  deleteVideo,
} from './api';
import {
  setVideoIds,
  setPageSettings,
  setTotalCount,
  updateLoadingStatus,
  deleteVideoSuccess,
  // addAssetSuccess,
  updateErrors,
  // clearErrors,
  updateEditStatus,
} from './slice';

import { updateFileValues } from './utils';

export function fetchVideos(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ courseId, status: RequestStatus.IN_PROGRESS }));

    try {
      const { previousUploads, ...data } = await getVideos(courseId);
      const parsedVideos = updateFileValues(previousUploads);
      dispatch(addModels({ modelType: 'videos', models: parsedVideos }));
      dispatch(setVideoIds({
        videoIds: parsedVideos.map(video => video.id),
      }));
      dispatch(setPageSettings({ ...data }));
      dispatch(setTotalCount({ totalCount: parsedVideos.length }));
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

export function updateAssetOrder(courseId, videoIds) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ courseId, status: RequestStatus.IN_PROGRESS }));
    dispatch(setVideoIds({ videoIds }));
    dispatch(updateLoadingStatus({ courseId, status: RequestStatus.SUCCESSFUL }));
  };
}

export function deleteVideoFile(courseId, id, totalCount) {
  return async (dispatch) => {
    dispatch(updateEditStatus({ editType: 'delete', status: RequestStatus.IN_PROGRESS }));

    try {
      await deleteVideo(courseId, id);
      dispatch(deleteVideoSuccess({ videoId: id }));
      dispatch(removeModel({ modelType: 'videos', id }));
      dispatch(setTotalCount({ totalCount: totalCount - 1 }));

      dispatch(updateEditStatus({ editType: 'delete', status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateErrors({ error: 'delete', message: `Failed to delete file id ${id}.` }));
      dispatch(updateEditStatus({ editType: 'delete', status: RequestStatus.FAILED }));
    }
  };
}

// export function addAssetFile(courseId, file, totalCount) {
//   return async (dispatch) => {
//     dispatch(updateEditStatus({ editType: 'add', status: RequestStatus.IN_PROGRESS }));

//     try {
//       const { asset } = await addAsset(courseId, file);
//       // const [parsedAssest] = updateFileValues([asset]);
//       dispatch(addModel({
//         modelType: 'videos',
//         model: { ...parsedAssest },
//       }));
//       dispatch(addAssetSuccess({
//         assetId: asset.id,
//       }));
//       dispatch(setTotalCount({ totalCount: totalCount + 1 }));
//       dispatch(updateEditStatus({ editType: 'add', status: RequestStatus.SUCCESSFUL }));
//     } catch (error) {
//       if (error.response && error.response.status === 413) {
//         const message = error.response.data.error;
//         dispatch(updateErrors({ error: 'add', message }));
//       } else {
//         dispatch(updateErrors({ error: 'add', message: `Failed to add ${file.name}.` }));
//       }
//       dispatch(updateEditStatus({ editType: 'add', status: RequestStatus.FAILED }));
//     }
//   };
// }

// export function updateAssetLock({ assetId, courseId, locked }) {
//   return async (dispatch) => {
//     dispatch(updateEditStatus({ editType: 'lock', status: RequestStatus.IN_PROGRESS }));

//     try {
//       await updateLockStatus({ assetId, courseId, locked });
//       dispatch(updateModel({
//         modelType: 'assets',
//         model: {
//           id: assetId,
//           locked,
//         },
//       }));
//       dispatch(updateEditStatus({ editType: 'lock', status: RequestStatus.SUCCESSFUL }));
//     } catch (error) {
//       const lockStatus = locked ? 'lock' : 'unlock';
//       dispatch(updateErrors({ error: 'lock', message: `Failed to ${lockStatus} file id ${assetId}.` }));
//       dispatch(updateEditStatus({ editType: 'lock', status: RequestStatus.FAILED }));
//     }
//   };
// }

// export function resetErrors({ errorType }) {
//   return (dispatch) => { dispatch(clearErrors({ error: errorType })); };
// }

// export function getUsagePaths({ asset, courseId, setSelectedRows }) {
//   return async (dispatch) => {
//     dispatch(updateEditStatus({ editType: 'usageMetrics', status: RequestStatus.IN_PROGRESS }));

//     try {
//       const { usageLocations } = await getAssetUsagePaths({ assetId: asset.id, courseId });
//       setSelectedRows([{ original: { ...asset, usageLocations } }]);
//       dispatch(updateEditStatus({ editType: 'usageMetrics', status: RequestStatus.SUCCESSFUL }));
//     } catch (error) {
//       dispatch(updateErrors({
// error: 'usageMetrics',
// message: `Failed to get usage metrics for ${asset.displayName}.` }));
//       dispatch(updateEditStatus({ editType: 'usageMetrics', status: RequestStatus.FAILED }));
//     }
//   };
// }

// export function fetchAssetDownload({ selectedRows, courseId }) {
//   return async (dispatch) => {
//     dispatch(updateEditStatus({ editType: 'download', status: RequestStatus.IN_PROGRESS }));
//     const errors = await getDownload(selectedRows, courseId);
//     if (isEmpty(errors)) {
//       dispatch(updateEditStatus({ editType: 'download', status: RequestStatus.SUCCESSFUL }));
//     } else {
//       errors.forEach(error => {
//         dispatch(updateErrors({ error: 'download', message: error }));
//       });
//       dispatch(updateEditStatus({ editType: 'download', status: RequestStatus.FAILED }));
//     }
//   };
// }
