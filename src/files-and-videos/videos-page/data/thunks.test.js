import { addVideoFile } from './thunks';
import * as api from './api';

describe('addVideoFile', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  const courseId = 'course-123';
  const mockFile = {
    name: 'mockName',

  };

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('Should dispatch failed status if  url cannot be created.', async () => {
    jest.spyOn(api, 'addVideo').mockResolvedValue({
      status: 404,
    });

    await addVideoFile(courseId, mockFile)(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      payload: {
        editType: 'add',
        status: 'failed',
      },
      type: 'videos/updateEditStatus',
    });
  });
  it('Failed video upload dispatches updateEditStatus with failed', async () => {
    jest.spyOn(api, 'addVideo').mockResolvedValue({
      status: 200,
      data: {
        files: [
          { edxVideoId: 'iD', uploadUrl: 'a Url' },
        ],
      },
    });
    jest.spyOn(api, 'uploadVideo').mockResolvedValue({
      status: 404,
    });
    await addVideoFile(courseId, mockFile)(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      payload: {
        editType: 'add',
        status: 'failed',
      },
      type: 'videos/updateEditStatus',
    });
  });
  it('should handle successful upload with progress bar', async () => {
    const mockPutToServerResponse = {
      body: {
        getReader: jest.fn(() => ({
          read: jest.fn().mockResolvedValueOnce({ done: true }),
        })),
      },
      headers: new Map([['Content-Length', '100']]),
    };
    jest.spyOn(api, 'addVideo').mockResolvedValue({
      status: 200,
      data: {
        files: [
          { edxVideoId: 'iD', uploadUrl: 'a Url' },
        ],
      },
    });
    jest.spyOn(api, 'sendVideoUploadStatus').mockResolvedValue({ status: 200 });
    jest.spyOn(api, 'uploadVideo').mockResolvedValue(mockPutToServerResponse);

    await addVideoFile(courseId, mockFile)(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      payload: { uploadNewVideoProgress: 100 },
      type: 'videos/updateVideoUploadProgress',
    });
  });
  it('should handle successful upload with progress bar', async () => {
    const mockPutToServerResponse = {
      body: {
        getReader: jest.fn(() => ({
          read: jest.fn().mockResolvedValueOnce({
            value: {
              byteLength: 50,

            },
          }),
        })),
      },
      headers: new Map([['Content-Length', '100']]),
    };
    jest.spyOn(api, 'addVideo').mockResolvedValue({
      status: 200,
      data: {
        files: [
          { edxVideoId: 'iD', uploadUrl: 'a Url' },
        ],
      },
    });
    jest.spyOn(api, 'sendVideoUploadStatus').mockResolvedValue({ status: 200 });
    jest.spyOn(api, 'uploadVideo').mockResolvedValue(mockPutToServerResponse);

    await addVideoFile(courseId, mockFile)(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      payload: { uploadNewVideoProgress: 50 },
      type: 'videos/updateVideoUploadProgress',
    });
  });
});
