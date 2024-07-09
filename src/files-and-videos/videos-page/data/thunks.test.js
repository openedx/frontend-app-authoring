import { addVideoFile } from './thunks';
import * as api from './api';

describe('addVideoFile', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  const courseId = 'course-123';
  const mockFile = {
    name: 'mockName',
  };
  const uploadingIdsRef = { current: { uploadData: {} } };

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('Should dispatch failed if url cannot be created.', async () => {
    jest.spyOn(api, 'addVideo').mockResolvedValue({
      status: 404,
    });

    await addVideoFile(courseId, [mockFile], undefined, uploadingIdsRef)(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      payload: {
        fileName: mockFile.name,
      },
      type: 'videos/failAddVideo',
    });
  });
  it('Failed video upload dispatches updateEditStatus with failed, and sends the failure to the api', async () => {
    const videoStatusMock = jest.spyOn(api, 'sendVideoUploadStatus').mockResolvedValue({
      status: 200,
    });
    const mockEdxVideoId = 'iD';
    jest.spyOn(api, 'addVideo').mockResolvedValue({
      status: 200,
      data: {
        files: [
          { edxVideoId: mockEdxVideoId, uploadUrl: 'a Url' },
        ],
      },
    });
    jest.spyOn(api, 'uploadVideo').mockResolvedValue({
      status: 404,
    });
    await addVideoFile(courseId, [mockFile], undefined, uploadingIdsRef)(dispatch, getState);
    expect(videoStatusMock).toHaveBeenCalledWith(courseId, mockEdxVideoId, 'Upload failed', 'upload_failed');
    expect(dispatch).toHaveBeenCalledWith({
      payload: {
        error: 'add',
        message: `Failed to upload ${mockFile.name}.`,
      },

      type: 'videos/updateErrors',
    });
  });
  it('Successful video upload sends the success to the api', async () => {
    const videoStatusMock = jest.spyOn(api, 'sendVideoUploadStatus').mockResolvedValue({
      status: 200,
    });
    const mockEdxVideoId = 'iD';
    jest.spyOn(api, 'addVideo').mockResolvedValue({
      status: 200,
      data: {
        files: [
          { edxVideoId: mockEdxVideoId, uploadUrl: 'a Url' },
        ],
      },
    });
    jest.spyOn(api, 'uploadVideo').mockResolvedValue({
      status: 200,
    });
    await addVideoFile(courseId, [mockFile], undefined, uploadingIdsRef)(dispatch, getState);
    expect(videoStatusMock).toHaveBeenCalledWith(courseId, mockEdxVideoId, 'Upload completed', 'upload_completed');
  });
});
