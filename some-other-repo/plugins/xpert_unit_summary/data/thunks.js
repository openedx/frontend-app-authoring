import { updateSavingStatus, updateLoadingStatus, updateResetStatus } from 'CourseAuthoring/pages-and-resources/data/slice';
import { RequestStatus } from 'CourseAuthoring/data/constants';
import { addModel, updateModel } from 'CourseAuthoring/generic/model-store';

import {
  getXpertSettings, postXpertSettings, getXpertPluginConfigurable, deleteXpertSettings,
} from './api';

export function updateXpertSettings(courseId, state) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));
    try {
      const { response } = await postXpertSettings(courseId, state);
      const { success } = response;
      if (success) {
        dispatch(updateModel({ modelType: 'XpertSettings', model: { id: 'xpert-unit-summary', enabled: state.enabled } }));
        dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
        return true;
      }
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      return false;
    } catch (error) {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}

export function fetchXpertPluginConfigurable(courseId) {
  return async (dispatch) => {
    let enabled;
    dispatch(updateLoadingStatus({ status: RequestStatus.PENDING }));
    try {
      const { response } = await getXpertPluginConfigurable(courseId);
      enabled = response?.enabled;
    } catch (e) {
      enabled = undefined;
    }

    dispatch(addModel({
      modelType: 'XpertSettings.enabled',
      model: {
        id: 'xpert-unit-summary',
        enabled,
      },
    }));
  };
}

export function fetchXpertSettings(courseId) {
  return async (dispatch) => {
    let enabled;
    dispatch(updateLoadingStatus({ status: RequestStatus.PENDING }));

    try {
      const { response } = await getXpertSettings(courseId);
      enabled = response?.enabled;
    } catch (e) {
      enabled = undefined;
    }

    dispatch(addModel({
      modelType: 'XpertSettings',
      model: {
        id: 'xpert-unit-summary',
        enabled,
      },
    }));

    dispatch(updateLoadingStatus({ status: RequestStatus.SUCCESSFUL }));
  };
}

export function removeXpertSettings(courseId) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));

    try {
      const { response } = await deleteXpertSettings(courseId);
      const { success } = response;
      if (success) {
        const model = { id: 'xpert-unit-summary', enabled: undefined };
        dispatch(updateModel({ modelType: 'XpertSettings', model }));
        dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
        return true;
      }
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      return false;
    } catch (error) {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}

export function resetXpertSettings(courseId, state) {
  return async (dispatch) => {
    dispatch(updateResetStatus({ status: RequestStatus.PENDING }));
    try {
      const { response } = await postXpertSettings(courseId, state);
      const { success } = response;
      if (success) {
        dispatch(updateResetStatus({ status: RequestStatus.SUCCESSFUL }));
        return true;
      }
      dispatch(updateResetStatus({ status: RequestStatus.FAILED }));
      return false;
    } catch (error) {
      dispatch(updateResetStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}
