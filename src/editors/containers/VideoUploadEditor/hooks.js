import * as requests from '../../data/redux/thunkActions/requests';

export const uploadVideo = async ({ dispatch, supportedFiles }) => {
  const data = { files: [] };
  supportedFiles.forEach((file) => {
    data.files.push({
      file_name: file.name,
      content_type: file.type,
    });
  });
  dispatch(await requests.uploadVideo({
    data,
    onSuccess: async (response) => {
      const { files } = response.json();
      await Promise.all(Object.values(files).map(async (fileObj) => {
        const fileName = fileObj.file_name;
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
          .then((resp) => resp.json())
          .then((responseData) => console.log('File uploaded:', responseData))
          .catch((error) => console.error('Error uploading file:', error));
      }));
    },
  }));
};

export default {
  uploadVideo,
};
