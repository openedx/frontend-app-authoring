import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getProcessingNotification } from '../generic/processing-notification/data/selectors';
import { RequestStatus } from '../data/constants';
import {
  fetchGroupConfigurationsQuery,
  createContentGroupQuery,
  editContentGroupQuery,
  deleteContentGroupQuery,
} from './data/thunk';
import { updateSavingStatuses } from './data/slice';
import {
  getGroupConfigurationsData,
  getLoadingStatus,
  getSavingStatus,
} from './data/selectors';

const useGroupConfigurations = (courseId) => {
  const dispatch = useDispatch();
  const groupConfigurations = useSelector(getGroupConfigurationsData);
  const loadingStatus = useSelector(getLoadingStatus);
  const savingStatus = useSelector(getSavingStatus);
  const {
    isShow: isShowProcessingNotification,
    title: processingNotificationTitle,
  } = useSelector(getProcessingNotification);

  const handleInternetConnectionFailed = () => {
    dispatch(updateSavingStatuses({ status: RequestStatus.FAILED }));
  };

  const groupConfigurationsActions = {
    handleCreateContentGroup: (group, callbackToClose) => {
      dispatch(createContentGroupQuery(courseId, group)).then((result) => {
        if (result) {
          callbackToClose();
        }
      });
    },
    handleEditContentGroup: (group, callbackToClose) => {
      dispatch(editContentGroupQuery(courseId, group)).then((result) => {
        if (result) {
          callbackToClose();
        }
      });
    },
    handleDeleteContentGroup: (parentGroupId, groupId) => {
      dispatch(deleteContentGroupQuery(courseId, parentGroupId, groupId));
    },
  };

  useEffect(() => {
    dispatch(fetchGroupConfigurationsQuery(courseId));
  }, [courseId]);

  return {
    isLoading: loadingStatus === RequestStatus.IN_PROGRESS,
    savingStatus,
    groupConfigurationsActions,
    groupConfigurations,
    isShowProcessingNotification,
    processingNotificationTitle,
    handleInternetConnectionFailed,
  };
};

// eslint-disable-next-line import/prefer-default-export
export { useGroupConfigurations };
