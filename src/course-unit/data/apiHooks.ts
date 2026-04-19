import { useConfigureUnit } from '@src/course-outline/data/apiHooks';
import { ConfigureUnitData } from '@src/course-outline/data/types';
import { fetchCourseSectionVerticalDataSuccess, updateCourseVerticalChildren } from '@src/course-unit/data/slice';
import { ParentIds } from '@src/generic/types';
import { DefaultError, useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';

import {
  acceptLibraryBlockChanges,
  getCourseContainerChildren,
  getVerticalData,
  ignoreLibraryBlockChanges,
} from './api';

/**
 * Hook that provides a "mutation" that can be used to accept library block changes.
 */
// eslint-disable-next-line import/prefer-default-export
export const useAcceptLibraryBlockChanges = () =>
  useMutation({
    mutationFn: acceptLibraryBlockChanges,
  });

/**
 * Hook that provides a "mutation" that can be used to ignore library block changes.
 */
// eslint-disable-next-line import/prefer-default-export
export const useIgnoreLibraryBlockChanges = () =>
  useMutation({
    mutationFn: ignoreLibraryBlockChanges,
  });

/**
 * Wrapper around useConfigureUnit that updates unit data after processing
 */
export const useConfigureUnitWithPageUpdates = () => {
  const mutationFn = useConfigureUnit();
  const dispatch = useDispatch();
  return {
    ...mutationFn,
    mutate: (
      mutationArgs: ConfigureUnitData & ParentIds,
      options?: UseMutationOptions<
        object,
        DefaultError,
        ConfigureUnitData & ParentIds
      >,
    ) =>
      mutationFn.mutate(mutationArgs, {
        ...options,
        onSuccess: async (...onMutateArgs) => {
          const courseSectionVerticalData = await getVerticalData(onMutateArgs[1].unitId);
          dispatch(fetchCourseSectionVerticalDataSuccess(courseSectionVerticalData));
          const courseVerticalChildrenData = await getCourseContainerChildren(onMutateArgs[1].unitId);
          dispatch(updateCourseVerticalChildren(courseVerticalChildrenData));
          options?.onSuccess?.(...onMutateArgs);
        },
      }),
  };
};
