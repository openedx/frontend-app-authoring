import { courseOutlineQueryKeys } from '@src/course-outline/data/apiHooks';
import { fetchCourseSectionVerticalDataSuccess, updateCourseVerticalChildren, updateQueryPendingStatus, updateSavingStatus } from '@src/course-unit/data/slice';
import { getNotificationMessage } from './utils';
import { RequestStatus } from '@src/data/constants';
import { hideProcessingNotification, showProcessingNotification } from '@src/generic/processing-notification/data/slice';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

import {
  acceptLibraryBlockChanges,
  getCourseContainerChildren,
  getVerticalData,
  handleCourseUnitVisibilityAndData,
  ignoreLibraryBlockChanges,
} from './api';
import { handleResponseErrors } from '@src/generic/saving-error-alert';

/**
 * Hook that provides a "mutation" that can be used to accept library block changes.
 */
// eslint-disable-next-line import/prefer-default-export
export const useAcceptLibraryBlockChanges = () => useMutation({
  mutationFn: acceptLibraryBlockChanges,
});

/**
 * Hook that provides a "mutation" that can be used to ignore library block changes.
 */
// eslint-disable-next-line import/prefer-default-export
export const useIgnoreLibraryBlockChanges = () => useMutation({
  mutationFn: ignoreLibraryBlockChanges,
});

export const useEditCourseUnitVisibilityAndData = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: handleCourseUnitVisibilityAndData,
    onMutate: (variables) => {
      dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
      dispatch(updateQueryPendingStatus(true));
      dispatch(showProcessingNotification(
        getNotificationMessage(variables.type, variables.isVisible, true)
      ));
    },
    onSuccess: async (_data, variables) => {
      const courseSectionVerticalData = await getVerticalData(variables.unitId);
      dispatch(fetchCourseSectionVerticalDataSuccess(courseSectionVerticalData));
      const courseVerticalChildrenData = await getCourseContainerChildren(variables.unitId);
      dispatch(updateCourseVerticalChildren(courseVerticalChildrenData));
      dispatch(hideProcessingNotification());
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    },
    onSettled: async (_data, _err, variables) => {
      queryClient.invalidateQueries({
        queryKey: courseOutlineQueryKeys.courseItemId(variables.unitId),
      });
    },
    onError: (error) => {
      dispatch(hideProcessingNotification());
      handleResponseErrors(error, dispatch, updateSavingStatus);
    },
  });
}
