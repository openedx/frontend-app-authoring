import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RequestStatus } from '../data/constants';
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
import { useGetGroupConfigurations } from './data/apiHooks';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';

const useGroupConfigurations = () => {
  const dispatch = useDispatch();
  const { courseId } = useCourseAuthoringContext();
  const {
    data: groupConfigurations,
    isPending: isPendingGroupConfigurations,
    failureReason: groupConfigurationsError,
  } = useGetGroupConfigurations(courseId);

  const savingStatus = useSelector(getSavingStatus);

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
    isLoading: isPendingGroupConfigurations,
    isLoadingDenied: groupConfigurationsError?.response?.status === 403,
    savingStatus,
    contentGroupActions,
    experimentConfigurationActions,
    groupConfigurations,
    handleInternetConnectionFailed,
  };
};

export { useGroupConfigurations };
