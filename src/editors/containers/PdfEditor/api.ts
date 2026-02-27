import { useMutation, useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { EditorState, selectors } from '@src/editors/data/redux';
import { camelizeKeys } from '@src/editors/utils';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import type { AxiosResponse } from 'axios';
import * as urls from '@src/editors/data/services/cms/urls';
import { useEditorContext } from '@src/editors/EditorContext';

interface UseBlockDataParams {
  blockId: string,
  uniqueId: string,
  handlerName: string,
}

// Unique ID required due to intractable race conditions. See ./contexts.tsx file.
export const useBlockData = <T>({ blockId, uniqueId, handlerName }: UseBlockDataParams) => {
  const studioEndpointUrl = useSelector((state: EditorState) => selectors.app.studioEndpointUrl(state))!;
  const client = getAuthenticatedHttpClient();
  return useQuery<T>({
    queryKey: ['blockData', blockId, uniqueId],
    staleTime: Infinity,
    queryFn: ({ signal }) => client.get(
      urls.xblockHandlerUrl({ blockId, studioEndpointUrl, handlerName }),
      { cancelSource: signal },
    ).then((res: AxiosResponse<unknown>) => camelizeKeys(res.data) as T),
  });
};

export const useCourseAssetUpload = () => {
  const studioEndpointUrl = useSelector((state: EditorState) => selectors.app.studioEndpointUrl(state))!;
  const { learningContextId } = useEditorContext();
  const client = getAuthenticatedHttpClient();
  return useMutation({
    mutationFn: (file: File) => {
      const data = new FormData();
      data.append('file', file);
      return client.post(
        urls.courseAssets({ studioEndpointUrl, learningContextId }),
        data,
      );
    },
  });
};
