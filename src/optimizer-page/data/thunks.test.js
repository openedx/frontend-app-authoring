import Cookies from 'universal-cookie';
import { fetchExportStatus } from './thunks';
import * as api from './api';
import { EXPORT_STAGES } from './constants';

jest.mock('universal-cookie', () => jest.fn().mockImplementation(() => ({
  get: jest.fn().mockImplementation(() => ({ completed: false })),
})));

jest.mock('../utils', () => ({
  setExportCookie: jest.fn(),
}));

describe('fetchExportStatus thunk', () => {
  const dispatch = jest.fn();
  const getState = jest.fn();
  const courseId = 'course-123';
  const exportStatus = EXPORT_STAGES.COMPRESSING;
  const exportOutput = 'export output';
  const exportError = 'export error';
  let mockGetExportStatus;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetExportStatus = jest.spyOn(api, 'getExportStatus').mockResolvedValue({
      exportStatus,
      exportOutput,
      exportError,
    });
  });

  it('should dispatch updateCurrentStage with export status', async () => {
    mockGetExportStatus.mockResolvedValue({
      exportStatus,
      exportOutput,
      exportError,
    });

    await fetchExportStatus(courseId)(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      payload: exportStatus,
      type: 'exportPage/updateCurrentStage',
    });
  });

  it('should dispatch updateError on export error', async () => {
    mockGetExportStatus.mockResolvedValue({
      exportStatus,
      exportOutput,
      exportError,
    });

    await fetchExportStatus(courseId)(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      payload: {
        msg: exportError,
        unitUrl: null,
      },
      type: 'exportPage/updateError',
    });
  });

  it('should dispatch updateIsErrorModalOpen with true if export error', async () => {
    mockGetExportStatus.mockResolvedValue({
      exportStatus,
      exportOutput,
      exportError,
    });

    await fetchExportStatus(courseId)(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      payload: true,
      type: 'exportPage/updateIsErrorModalOpen',
    });
  });

  it('should not dispatch updateIsErrorModalOpen if no export error', async () => {
    mockGetExportStatus.mockResolvedValue({
      exportStatus,
      exportOutput,
      exportError: null,
    });

    await fetchExportStatus(courseId)(dispatch, getState);

    expect(dispatch).not.toHaveBeenCalledWith({
      payload: false,
      type: 'exportPage/updateIsErrorModalOpen',
    });
  });

  it("should dispatch updateDownloadPath if there's export output", async () => {
    mockGetExportStatus.mockResolvedValue({
      exportStatus,
      exportOutput,
      exportError,
    });

    await fetchExportStatus(courseId)(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      payload: exportOutput,
      type: 'exportPage/updateDownloadPath',
    });
  });

  it('should dispatch updateSuccessDate with current date if export status is success', async () => {
    mockGetExportStatus.mockResolvedValue({
      exportStatus:
        EXPORT_STAGES.SUCCESS,
      exportOutput,
      exportError,
    });

    await fetchExportStatus(courseId)(dispatch, getState);

    expect(dispatch).toHaveBeenCalledWith({
      payload: expect.any(Number),
      type: 'exportPage/updateSuccessDate',
    });
  });

  it('should not dispatch updateSuccessDate with current date if last-export cookie is already set', async () => {
    mockGetExportStatus.mockResolvedValue({
      exportStatus:
        EXPORT_STAGES.SUCCESS,
      exportOutput,
      exportError,
    });

    Cookies.mockImplementation(() => ({
      get: jest.fn().mockReturnValueOnce({ completed: true }),
    }));

    await fetchExportStatus(courseId)(dispatch, getState);

    expect(dispatch).not.toHaveBeenCalledWith({
      payload: expect.any,
      type: 'exportPage/updateSuccessDate',
    });
  });
});
