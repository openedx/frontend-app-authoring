import { useState } from 'react';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { getMessageFromAxiosError } from '@src/generic/saving-error-alert/utils';
import {
  useCreateContentGroup,
  useCreateExperimentConfiguration,
  useDeleteContentGroup,
  useDeleteExperimentConfiguration,
  useEditContentGroup,
  useEditExperimentConfiguration,
  useGetGroupConfigurations,
} from './data/apiHooks';
import { AvailableGroup, OnErrorCallbackFunc } from './types';

export const useGroupConfigurations = () => {
  const { courseId } = useCourseAuthoringContext();
  const [mutationErrorMessage, setMutationErrorMessage] = useState<string>();
  const {
    data: groupConfigurations,
    isPending: isPendingGroupConfigurations,
    failureReason: groupConfigurationsError,
  } = useGetGroupConfigurations(courseId);

  const handleMutationError: OnErrorCallbackFunc = (error) => (
    setMutationErrorMessage(getMessageFromAxiosError(error))
  );

  const createGroupMutation = useCreateContentGroup(courseId, handleMutationError);
  const editGroupMutation = useEditContentGroup(courseId, handleMutationError);
  const deleteGroupMutation = useDeleteContentGroup(courseId, handleMutationError);
  const createExperimentConfigMutation = useCreateExperimentConfiguration(courseId, handleMutationError);
  const editExperimentConfigMutation = useEditExperimentConfiguration(courseId, handleMutationError);
  const deleteExperimentConfigMutaion = useDeleteExperimentConfiguration(courseId, handleMutationError);

  const anyMutationFailed = createGroupMutation.isError || editGroupMutation.isError
    || deleteGroupMutation.isError || createExperimentConfigMutation.isError
    || editExperimentConfigMutation.isError || deleteExperimentConfigMutaion.isError;

  const contentGroupActions = {
    handleCreate: async (group: AvailableGroup, callbackToClose: () => void) => {
      const result = await createGroupMutation.mutateAsync(group);
      if (result) {
        callbackToClose();
      }
    },
    handleEdit: async (group: AvailableGroup, callbackToClose: () => void) => {
      const result = await editGroupMutation.mutateAsync(group);
      if (result) {
        callbackToClose();
      }
    },
    handleDelete: (parentGroupId: number, groupId: number) => {
      deleteGroupMutation.mutate({
        parentGroupId,
        groupId,
      });
    },
  };

  const experimentConfigurationActions = {
    handleCreate: async (configuration: AvailableGroup, callbackToClose: () => void) => {
      const result = await createExperimentConfigMutation.mutateAsync(configuration);
      if (result) {
        callbackToClose();
      }
    },
    handleEdit: async (configuration: AvailableGroup, callbackToClose: () => void) => {
      const result = await editExperimentConfigMutation.mutateAsync(configuration);
      if (result) {
        callbackToClose();
      }
    },
    handleDelete: (configurationId: number) => {
      deleteExperimentConfigMutaion.mutate(configurationId);
    },
  };

  return {
    isLoading: isPendingGroupConfigurations,
    isLoadingDenied: groupConfigurationsError?.response?.status === 403,
    contentGroupActions,
    experimentConfigurationActions,
    groupConfigurations,
    anyMutationFailed,
    mutationErrorMessage,
  };
};
