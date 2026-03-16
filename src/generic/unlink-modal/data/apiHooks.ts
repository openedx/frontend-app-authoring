import { useMutation, useQueryClient } from '@tanstack/react-query';
import { courseLibrariesQueryKeys } from '@src/course-libraries';
import { getCourseKey } from '@src/generic/key-utils';

import { courseOutlineQueryKeys } from '@src/course-outline/data/apiHooks';
import { ParentIds } from '@src/generic/types';
import { unlinkDownstream } from './api';

export const useUnlinkDownstream = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: {
      downstreamBlockId: string;
    } & ParentIds) => unlinkDownstream(variables.downstreamBlockId),
    onSuccess: (_, variables) => {
      const courseKey = getCourseKey(variables.downstreamBlockId);
      queryClient.invalidateQueries({
        queryKey: courseLibrariesQueryKeys.courseLibraries(courseKey),
      });
      queryClient.invalidateQueries({
        queryKey: courseOutlineQueryKeys.courseDetails(courseKey),
      });
      if (variables.sectionId) {
        // This will handle updating all children block cache data as section data contains
        // xblock data of all of its children
        queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseItemId(variables.sectionId) });
      }
    },
  });
};
