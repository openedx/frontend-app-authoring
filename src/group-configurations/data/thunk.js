import { RequestStatus } from '../../data/constants';
import { NOTIFICATION_MESSAGES } from '../../constants';
import {
  hideProcessingNotification,
  showProcessingNotification,
} from '../../generic/processing-notification/data/slice';
import { handleResponseErrors } from '../../generic/saving-error-alert';
import {
  getGroupConfigurations,
  createContentGroup,
  editContentGroup,
  deleteContentGroup,
  createExperimentConfiguration,
  editExperimentConfiguration,
  deleteExperimentConfiguration,
} from './api';
import {
  fetchGroupConfigurations,
  updateLoadingStatus,
  updateSavingStatuses,
  updateGroupConfigurationsSuccess,
  deleteGroupConfigurationsSuccess,
  updateExperimentConfigurationSuccess,
  deleteExperimentConfigurationSuccess,
} from './slice';

export function fetchGroupConfigurationsQuery(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const groupConfigurations = await getGroupConfigurations(courseId);
      dispatch(fetchGroupConfigurations({ groupConfigurations }));
      dispatch(updateLoadingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateLoadingStatus({ status: RequestStatus.DENIED }));
      } else {
        dispatch(updateLoadingStatus({ courseId, status: RequestStatus.FAILED }));
      }
    }
  };
}

export function createContentGroupQuery(courseId, group) {
  return async (dispatch) => {
    dispatch(updateSavingStatuses({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      const data = await createContentGroup(courseId, group);
      dispatch(updateGroupConfigurationsSuccess({ data }));
      dispatch(updateSavingStatuses({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      return handleResponseErrors(error, dispatch, updateSavingStatuses);
    } finally {
      dispatch(hideProcessingNotification());
    }
  };
}

export function editContentGroupQuery(courseId, group) {
  return async (dispatch) => {
    dispatch(updateSavingStatuses({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      const data = await editContentGroup(courseId, group);
      dispatch(updateGroupConfigurationsSuccess({ data }));
      dispatch(updateSavingStatuses({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      return handleResponseErrors(error, dispatch, updateSavingStatuses);
    } finally {
      dispatch(hideProcessingNotification());
    }
  };
}

export function deleteContentGroupQuery(courseId, parentGroupId, groupId) {
  return async (dispatch) => {
    dispatch(updateSavingStatuses({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.deleting));

    try {
      await deleteContentGroup(courseId, parentGroupId, groupId);
      dispatch(deleteGroupConfigurationsSuccess({ parentGroupId, groupId }));
      dispatch(updateSavingStatuses({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      handleResponseErrors(error, dispatch, updateSavingStatuses);
    } finally {
      dispatch(hideProcessingNotification());
    }
  };
}

export function createExperimentConfigurationQuery(courseId, newConfiguration) {
  return async (dispatch) => {
    dispatch(updateSavingStatuses({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      const configuration = await createExperimentConfiguration(
        courseId,
        newConfiguration,
      );
      dispatch(updateExperimentConfigurationSuccess({ configuration }));
      dispatch(updateSavingStatuses({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      return handleResponseErrors(error, dispatch, updateSavingStatuses);
    } finally {
      dispatch(hideProcessingNotification());
    }
  };
}

export function editExperimentConfigurationQuery(
  courseId,
  editedConfiguration,
) {
  return async (dispatch) => {
    dispatch(updateSavingStatuses({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      const configuration = await editExperimentConfiguration(
        courseId,
        editedConfiguration,
      );
      dispatch(updateExperimentConfigurationSuccess({ configuration }));
      dispatch(updateSavingStatuses({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      return handleResponseErrors(error, dispatch, updateSavingStatuses);
    } finally {
      dispatch(hideProcessingNotification());
    }
  };
}

export function deleteExperimentConfigurationQuery(courseId, configurationId) {
  return async (dispatch) => {
    dispatch(updateSavingStatuses({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.deleting));

    try {
      await deleteExperimentConfiguration(courseId, configurationId);
      dispatch(deleteExperimentConfigurationSuccess({ configurationId }));
      dispatch(updateSavingStatuses({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      handleResponseErrors(error, dispatch, updateSavingStatuses);
    } finally {
      dispatch(hideProcessingNotification());
    }
  };
}
