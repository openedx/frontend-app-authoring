import { getXpertSettings, postXpertSettings, getXpertPluginConfigurable } from './api';

import { updateSavingStatus, updateLoadingStatus } from '../../data/slice';
import { RequestStatus } from '../../../data/constants';

import { addModel, updateModel } from '../../../generic/model-store';

export function updateXpertSettings(courseId, state) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));
    try {
      const { response } = await postXpertSettings(courseId, state);
      const { success, enabled } = response;
      if (success) {
        dispatch(updateModel({ modelType: 'XpertSettings', model: { id: 'xpert-unit-summary', enabled } }));
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
    let enabled = false;
    dispatch(updateLoadingStatus({ status: RequestStatus.PENDING }));
    try {
      const { response } = await getXpertPluginConfigurable(courseId);
      enabled = response?.enabled;
    } catch (e) {
      enabled = false;
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
    let enabled = false;
    dispatch(updateLoadingStatus({ status: RequestStatus.PENDING }));

    try {
      const { response } = await getXpertSettings(courseId);
      enabled = response?.enabled;
    } catch (e) {
      enabled = false;
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
