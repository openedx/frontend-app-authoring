/* Shared react-query hooks for editors. */
import { useSelector } from 'react-redux';
import { EditorState, selectors } from '@src/editors/data/redux';
import { useEditorContext } from '@src/editors/EditorContext';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useMutation } from '@tanstack/react-query';
import * as urls from '@src/editors/data/services/cms/urls';

export const useAssetUpload = ({ blockId, isLibrary }: { blockId: string, isLibrary: boolean }) => {
  const studioEndpointUrl = useSelector((state: EditorState) => selectors.app.studioEndpointUrl(state))!;
  const { learningContextId } = useEditorContext();
  const client = getAuthenticatedHttpClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const data = new FormData();
      if (isLibrary) {
        data.append('content', file);
        return client.put(
          urls.libraryAssets({
            studioEndpointUrl, learningContextId, blockId, assetName: file.name,
          }),
          data,
        );
      }
      data.append('file', file);
      return client.post(
        urls.courseAssets({ studioEndpointUrl, learningContextId }),
        data,
      );
    },
  });
};
