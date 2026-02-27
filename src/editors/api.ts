/* Shared react-query hooks for editors. */
import { useSelector } from 'react-redux';
import { EditorState, selectors } from '@src/editors/data/redux';
import { useEditorContext } from '@src/editors/EditorContext';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useMutation } from '@tanstack/react-query';
import * as urls from '@src/editors/data/services/cms/urls';

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
