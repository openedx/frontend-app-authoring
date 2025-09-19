import { useMutation, useQueryClient } from '@tanstack/react-query';
import { courseLibrariesQueryKeys } from '@src/course-libraries';
import { getCourseKey } from '@src/generic/key-utils';

import { unlinkDownstream } from './api';

export const useUnlinkDownstream = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unlinkDownstream,
    onSuccess: (_, contentId: string) => {
      const courseKey = getCourseKey(contentId);
      queryClient.invalidateQueries({
        queryKey: courseLibrariesQueryKeys.courseLibraries(courseKey),
      });
    },
  });
};
