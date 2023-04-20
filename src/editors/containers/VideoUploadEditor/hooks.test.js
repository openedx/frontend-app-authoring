import hooks from './hooks';
import * as requests from '../../data/redux/thunkActions/requests';

jest.mock('../../data/redux/thunkActions/requests');

describe('uploadVideo', () => {
  const dispatch = jest.fn();
  const supportedFiles = [
    new File(['content1'], 'file1.mp4', { type: 'video/mp4' }),
    new File(['content2'], 'file2.mov', { type: 'video/quicktime' }),
  ];

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should dispatch uploadVideo action with correct data and onSuccess callback', async () => {
    requests.uploadVideo.mockImplementation(() => 'requests.uploadVideo');
    const data = {
      files: [
        { file_name: 'file1.mp4', content_type: 'video/mp4' },
        { file_name: 'file2.mov', content_type: 'video/quicktime' },
      ],
    };

    await hooks.uploadVideo({ dispatch, supportedFiles });

    expect(requests.uploadVideo).toHaveBeenCalledWith({ data, onSuccess: expect.any(Function) });
    expect(dispatch).toHaveBeenCalledWith('requests.uploadVideo');
  });

  it('should call fetch with correct arguments for each file', async () => {
    const mockResponseData = { success: true };
    const mockFetchResponse = Promise.resolve({ data: mockResponseData });
    global.fetch = jest.fn().mockImplementation(() => mockFetchResponse);
    const response = {
      files: [
        { file_name: 'file1.mp4', upload_url: 'http://example.com/put_video1' },
        { file_name: 'file2.mov', upload_url: 'http://example.com/put_video2' },
      ],
    };
    const spyConsoleLog = jest.spyOn(console, 'log');
    const mockRequestResponse = { data: response };
    requests.uploadVideo.mockImplementation(async ({ onSuccess }) => {
      await onSuccess(mockRequestResponse);
    });

    await hooks.uploadVideo({ dispatch, supportedFiles });

    expect(fetch).toHaveBeenCalledTimes(2);
    response.files.forEach(({ upload_url: uploadUrl }, index) => {
      expect(fetch.mock.calls[index][0]).toEqual(uploadUrl);
    });
    supportedFiles.forEach((file, index) => {
      expect(fetch.mock.calls[index][1].body.get('uploaded-file')).toBe(file);
    });
  });

  it('should log an error if fetch failed to upload a file', async () => {
    const error = new Error('Uh-oh!');
    global.fetch = jest.fn().mockRejectedValue(error);
    const response = {
      files: [
        { file_name: 'file1.mp4', upload_url: 'http://example.com/put_video1' },
        { file_name: 'file2.mov', upload_url: 'http://example.com/put_video2' },
      ],
    };
    const spyConsoleError = jest.spyOn(console, 'error');
    const mockRequestResponse = { data: response };
    requests.uploadVideo.mockImplementation(async ({ onSuccess }) => {
      await onSuccess(mockRequestResponse);
    });

    await hooks.uploadVideo({ dispatch, supportedFiles });
  });

  it('should log an error if file object is not found in supportedFiles array', () => {
    const response = {
      files: [
        { file_name: 'file2.mov', upload_url: 'http://example.com/put_video2' },
      ],
    };
    const mockRequestResponse = { data: response };
    const spyConsoleError = jest.spyOn(console, 'error');
    requests.uploadVideo.mockImplementation(({ onSuccess }) => {
      onSuccess(mockRequestResponse);
    });

    hooks.uploadVideo({ dispatch, supportedFiles: [supportedFiles[0]] });

    expect(spyConsoleError).toHaveBeenCalledWith('Could not find file object with name "file2.mov" in supportedFiles array.');
  });
});
