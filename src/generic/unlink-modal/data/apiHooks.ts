import { useMutation, useQueryClient } from '@tanstack/react-query';
import { courseLibrariesQueryKeys } from '@src/course-libraries';
import { getCourseKey } from '@src/generic/key-utils';

import { unlinkDownstream } from './api';
import { courseOutlineQueryKeys } from '@src/course-outline/data/apiHooks';

export const useUnlinkDownstream = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unlinkDownstream,
    onSuccess: (_, contentId: string) => {
      const courseKey = getCourseKey(contentId);
      queryClient.invalidateQueries({
        queryKey: courseLibrariesQueryKeys.courseLibraries(courseKey),
      });
      queryClient.invalidateQueries({
        queryKey: courseOutlineQueryKeys.course(courseKey),
      });
    },
  });
};
