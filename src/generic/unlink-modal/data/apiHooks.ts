import { useMutation, useQueryClient } from '@tanstack/react-query';
import { courseLibrariesQueryKeys } from '@src/course-libraries';
import { getCourseKey } from '@src/generic/key-utils';

import { courseOutlineQueryKeys } from '@src/course-outline/data/apiHooks';
import { unlinkDownstream } from './api';
import { ParentIds } from '@src/generic/types';

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
        queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseItemId(variables.sectionId) });
      } else if (variables.subsectionId) {
        queryClient.invalidateQueries({ queryKey: courseOutlineQueryKeys.courseItemId(variables.subsectionId) });
      }
    },
  });
};
