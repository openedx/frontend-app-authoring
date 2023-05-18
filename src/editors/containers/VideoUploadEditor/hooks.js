import * as requests from '../../data/redux/thunkActions/requests';
import * as module from './hooks';
import { selectors } from '../../data/redux';
import store from '../../data/store';
import * as appHooks from '../../hooks';

export const {
  navigateTo,
} = appHooks;

export const uploadVideo = async ({ dispatch, supportedFiles }) => {
  const data = { files: [] };
  supportedFiles.forEach((file) => {
    data.files.push({
      file_name: file.name,
      content_type: file.type,
    });
  });
  const onFileUploadedHook = module.onFileUploaded();
  dispatch(await requests.uploadVideo({
    data,
    onSuccess: async (response) => {
      const { files } = response.data;
      await Promise.all(Object.values(files).map(async (fileObj) => {
        const fileName = fileObj.file_name;
        const edxVideoId = fileObj.edx_video_id;
        const uploadUrl = fileObj.upload_url;
        const uploadFile = supportedFiles.find((file) => file.name === fileName);

        if (!uploadFile) {
          console.error(`Could not find file object with name "${fileName}" in supportedFiles array.`);
          return;
        }
        const formData = new FormData();
        formData.append('uploaded-file', uploadFile);
        await fetch(uploadUrl, {
          method: 'PUT',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
          .then(() => onFileUploadedHook(edxVideoId))
          .catch((error) => console.error('Error uploading file:', error));
      }));
    },
  }));
};

export const onFileUploaded = () => {
  const state = store.getState();
  const learningContextId = selectors.app.learningContextId(state);
  const blockId = selectors.app.blockId(state);
  return (edxVideoId) => navigateTo(`/course/${learningContextId}/editor/video/${blockId}?selectedVideoId=${edxVideoId}`);
};

export const onUrlUploaded = () => {
  const state = store.getState();
  const learningContextId = selectors.app.learningContextId(state);
  const blockId = selectors.app.blockId(state);
  return (videoUrl) => navigateTo(`/course/${learningContextId}/editor/video/${blockId}?selectedVideoUrl=${videoUrl}`);
};

export default {
  uploadVideo,
};
