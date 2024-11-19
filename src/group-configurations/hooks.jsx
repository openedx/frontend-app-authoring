import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RequestStatus } from '../data/constants';
import { getProcessingNotification } from '../generic/processing-notification/data/selectors';
import {
  getGroupConfigurationsData,
  getLoadingStatus,
  getSavingStatus,
  getErrorMessage,
} from './data/selectors';
import { updateSavingStatuses } from './data/slice';
import {
  createContentGroupQuery,
  createExperimentConfigurationQuery,
  deleteContentGroupQuery,
  deleteExperimentConfigurationQuery,
  editContentGroupQuery,
  editExperimentConfigurationQuery,
  fetchGroupConfigurationsQuery,
} from './data/thunk';

const useGroupConfigurations = (courseId) => {
  const dispatch = useDispatch();
  const groupConfigurations = useSelector(getGroupConfigurationsData);
  const loadingStatus = useSelector(getLoadingStatus);
  const savingStatus = useSelector(getSavingStatus);
  const errorMessage = useSelector(getErrorMessage);
  const {
    isShow: isShowProcessingNotification,
    title: processingNotificationTitle,
  } = useSelector(getProcessingNotification);

  const handleInternetConnectionFailed = () => {
    dispatch(updateSavingStatuses({ status: RequestStatus.FAILED }));
  };

  const contentGroupActions = {
    handleCreate: (group, callbackToClose) => {
      dispatch(createContentGroupQuery(courseId, group)).then((result) => {
        if (result) {
          callbackToClose();
        }
      });
    },
    handleEdit: (group, callbackToClose) => {
      dispatch(editContentGroupQuery(courseId, group)).then((result) => {
        if (result) {
          callbackToClose();
        }
      });
    },
    handleDelete: (parentGroupId, groupId) => {
      dispatch(deleteContentGroupQuery(courseId, parentGroupId, groupId));
    },
  };

  const experimentConfigurationActions = {
    handleCreate: (configuration, callbackToClose) => {
      dispatch(
        createExperimentConfigurationQuery(courseId, configuration),
      ).then((result) => {
        if (result) {
          callbackToClose();
        }
      });
    },
    handleEdit: (configuration, callbackToClose) => {
      dispatch(editExperimentConfigurationQuery(courseId, configuration)).then(
        (result) => {
          if (result) {
            callbackToClose();
          }
        },
      );
    },
    handleDelete: (configurationId) => {
      dispatch(deleteExperimentConfigurationQuery(courseId, configurationId));
    },
  };

  useEffect(() => {
    dispatch(fetchGroupConfigurationsQuery(courseId));
  }, [courseId]);

  return {
    isLoading: loadingStatus === RequestStatus.IN_PROGRESS,
    isLoadingDenied: loadingStatus === RequestStatus.DENIED,
    savingStatus,
    contentGroupActions,
    experimentConfigurationActions,
    errorMessage,
    groupConfigurations,
    isShowProcessingNotification,
    processingNotificationTitle,
    handleInternetConnectionFailed,
  };
};

export { useGroupConfigurations };
