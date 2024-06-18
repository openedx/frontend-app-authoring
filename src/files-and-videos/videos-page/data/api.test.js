import 'file-saver';
import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient, getHttpClient } from '@edx/frontend-platform/auth';

import {
  getDownload, getVideosUrl, getAllUsagePaths, getCourseVideosApiUrl, uploadVideo, sendVideoUploadStatus,
} from './api';

jest.mock('file-saver');

let axiosMock;
let axiosUnauthenticatedMock;

describe('api.js', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosUnauthenticatedMock = new MockAdapter(getHttpClient());
  });
  describe('getDownload', () => {
    describe('selectedRows length is undefined or less than zero', () => {
      it('should return with no files selected error if selectedRows is empty', async () => {
        const expected = ['No files were selected to download.'];
        const actual = await getDownload([], 'courseId');
        expect(actual).toEqual(expected);
      });
      it('should return with no files selected error if selectedRows is null', async () => {
        const expected = ['No files were selected to download.'];
        const actual = await getDownload(null, 'courseId');
        expect(actual).toEqual(expected);
      });
    });
    describe('selectedRows length is greater than one', () => {
      beforeEach(() => {
        axiosMock.onPut(`${getVideosUrl('SoMEiD')}/download`).reply(200, null);
      });
      it('should not throw error when blob returns null', async () => {
        const expected = [];
        const actual = await getDownload([
          { original: { displayName: 'test1', downloadLink: 'test1.com' } },
          { original: { displayName: 'test2', id: '2', downloadLink: 'test2.com' } },
        ], 'SoMEiD');
        expect(actual).toEqual(expected);
      });
      it('should return error if row does not contain .original attribute', async () => {
        const expected = ['Cannot find download file for video.'];
        const actual = await getDownload([
          { asset: { displayName: 'test1', id: '1' } },
          { original: { displayName: 'test2', id: '2', downloadLink: 'test1.com' } },
        ], 'SoMEiD');
        expect(actual).toEqual(expected);
      });
    });
    describe('selectedRows length equals one', () => {
      it('should return error if original does not contain .downloadLink attribute', async () => {
        const expected = ['Cannot find download file for test2.'];
        const actual = await getDownload([
          { original: { displayName: 'test2', id: '2' } },
        ], 'SoMEiD');
        expect(actual).toEqual(expected);
      });
      it('should return error if row does not contain .original ancestor', async () => {
        const expected = ['Failed to download video.'];
        const actual = await getDownload([
          { asset: { displayName: 'test1', id: '1', download_link: 'test1.com' } },
        ], 'SoMEiD');
        expect(actual).toEqual(expected);
      });
    });
  });
  describe('getAllUsagePaths', () => {
    const courseId = 'random-course-id';
    const videoIds = ['test1'];
    it('returns empty array when no videos are given', async () => {
      const expected = [];
      const actual = await getAllUsagePaths({ courseId, videoIds: [] });
      expect(actual).toEqual(expected);
    });
    it('pushes an empty usageLocations field when video api call fails', async () => {
      axiosMock.onGet(`${getVideosUrl(courseId)}/${videoIds[0]}/usage`, { videoId: videoIds[0] }).reply(404);
      const expected = [];
      const actual = await getAllUsagePaths({ courseId, videoIds });
      expect(actual).toEqual(expected);
    });
    it('sets activeStatus to active', async () => {
      const usageLocations = [{ link: '/test', name: 'test' }];
      axiosMock.onGet(`${getVideosUrl(courseId)}/${videoIds[0]}/usage`, { videoId: videoIds[0] })
        .reply(200, { usageLocations });
      const expected = [{ id: videoIds[0], usageLocations, activeStatus: 'active' }];
      const actual = await getAllUsagePaths({ courseId, videoIds });
      expect(actual).toEqual(expected);
    });
    it('sets activeStatus to inactive', async () => {
      const usageLocations = [];
      axiosMock.onGet(`${getVideosUrl(courseId)}/${videoIds[0]}/usage`, { videoId: videoIds[0] })
        .reply(200, { usageLocations });
      const expected = [{ id: videoIds[0], usageLocations, activeStatus: 'inactive' }];
      const actual = await getAllUsagePaths({ courseId, videoIds });
      expect(actual).toEqual(expected);
    });
  });

  describe('uploadVideo', () => {
    it('PUTs to the provided URL', async () => {
      const mockUrl = 'mock.com';
      const mockFile = { mock: 'file' };
      const mockVideoId = 'id123';
      const mockController = {};
      const mockRef = {
        current: {
          uploadData: {
            id123: {
              progress: 0,
              name: 'test',
              status: 'failed',
            },
          },
        },
      };
      const expectedResult = 'Something';
      axiosUnauthenticatedMock.onPut(mockUrl).reply((config) => {
        const total = 1024; // mocked file size
        const progress = 0.4;
        if (config.onUploadProgress) {
          config.onUploadProgress({ loaded: total * progress, total });
        }
        return [200, expectedResult];
      });
      const { data: actual } = await uploadVideo(mockUrl, mockFile, mockRef, mockVideoId, mockController);
      expect(actual).toEqual(expectedResult);

      expect(mockRef.current.uploadData.id123.progress).toEqual('40.00');
    });
  });
  describe('sendVideoUploadStatus', () => {
    it('Posts to the correct url', async () => {
      const mockCourseId = 'wiZard101';
      const mockEdxVideoId = 'wIzOz.mp3';
      const mockStatus = 'Im mElTinG';
      const mockMessage = 'DinG DOng The WiCked WiTCH isDead';
      const expectedResult = 'Something';
      axiosMock.onPost(`${getCourseVideosApiUrl(mockCourseId)}`)
        .reply(200, expectedResult);
      const actual = await sendVideoUploadStatus(
        mockCourseId,
        mockEdxVideoId,
        mockMessage,
        mockStatus,
      );
      expect(actual.data).toEqual(expectedResult);
      jest.clearAllMocks();
    });
  });
});
