import {
  render,
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient, getHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import initializeStore from '../../store';
import { executeThunk } from '../../utils';
import { RequestStatus } from '../../data/constants';
import VideosPage from './VideosPage';
import {
  generateFetchVideosApiResponse,
  generateEmptyApiResponse,
  generateNewVideoApiResponse,
  generateAddVideoApiResponse,
  getStatusValue,
  courseId,
  initialState,
} from './factories/mockApiResponses';

import {
  fetchVideos,
  deleteVideoFile,
  getUsagePaths,
  addVideoThumbnail,
  fetchVideoDownload,
} from './data/thunks';
import * as api from './data/api';
import videoMessages from './messages';
import messages from '../generic/messages';

const { getVideosUrl, getCourseVideosApiUrl, getApiBaseUrl } = api;

let axiosMock;
let axiosUnauthenticateMock;
let store;
let file;
jest.mock('file-saver');

const renderComponent = () => {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <VideosPage courseId={courseId} />
      </AppProvider>
    </IntlProvider>,
  );
};

const mockStore = async (
  status,
) => {
  const fetchVideosUrl = getVideosUrl(courseId);
  const videosData = generateFetchVideosApiResponse();
  axiosMock.onGet(fetchVideosUrl).reply(getStatusValue(status), videosData);

  videosData.previous_uploads.forEach((video) => {
    axiosMock.onGet(`${getVideosUrl(courseId)}/${video.edx_video_id}/usage`).reply(200, { usageLocations: [] });
  });

  renderComponent();
  await executeThunk(fetchVideos(courseId), store.dispatch);

  // Finish loading the expected files into the data table before returning,
  // because loading new files can disrupt things like accessing file menus.
  if (status === RequestStatus.SUCCESSFUL) {
    const numFiles = 3;
    await waitFor(() => {
      expect(screen.getByText(`Showing ${numFiles} of ${numFiles}`)).toBeInTheDocument();
    });
  }
};

const emptyMockStore = async (status) => {
  const fetchVideosUrl = getVideosUrl(courseId);
  axiosMock.onGet(fetchVideosUrl).reply(getStatusValue(status), generateEmptyApiResponse());
  renderComponent();
  await executeThunk(fetchVideos(courseId), store.dispatch);
};

describe('Videos page', () => {
  describe('empty state', () => {
    beforeEach(async () => {
      initializeMockApp({
        authenticatedUser: {
          userId: 3,
          username: 'abc123',
          administrator: false,
          roles: [],
        },
      });
      store = initializeStore({
        ...initialState,
        videos: {
          ...initialState.videos,
          videoIds: [],
        },
        models: {},
      });
      axiosMock = new MockAdapter(getAuthenticatedHttpClient());
      axiosUnauthenticateMock = new MockAdapter(getHttpClient());
      file = new File(['(⌐□_□)'], 'download.mp4', { type: 'video/mp4' });
    });

    it('should return placeholder component', async () => {
      await mockStore(RequestStatus.DENIED);
      expect(screen.getByTestId('under-construction-placeholder')).toBeVisible();
    });

    it('should not render transcript settings button', async () => {
      await emptyMockStore(RequestStatus.SUCCESSFUL);
      expect(screen.queryByText(videoMessages.transcriptSettingsButtonLabel.defaultMessage));
    });

    it('should have Video uploads title', async () => {
      await emptyMockStore(RequestStatus.SUCCESSFUL);
      expect(screen.getByText(videoMessages.heading.defaultMessage)).toBeVisible();
    });

    it('should render dropzone', async () => {
      await emptyMockStore(RequestStatus.SUCCESSFUL);
      expect(screen.getByTestId('files-dropzone')).toBeVisible();

      expect(screen.queryByTestId('files-data-table')).toBeNull();
    });

    it('should upload a single file', async () => {
      await emptyMockStore(RequestStatus.SUCCESSFUL);
      const dropzone = screen.getByTestId('files-dropzone');
      await act(async () => {
        axiosMock.onPost(getCourseVideosApiUrl(courseId)).reply(204, generateNewVideoApiResponse());
        axiosUnauthenticateMock.onPut('http://testing.org').reply(200);
        axiosMock.onGet(getCourseVideosApiUrl(courseId)).reply(200, generateAddVideoApiResponse());
        Object.defineProperty(dropzone, 'files', {
          value: [file],
        });
        fireEvent.drop(dropzone);
      });

      expect(screen.queryByTestId('files-dropzone')).toBeNull();
      expect(screen.getByTestId('files-data-table')).toBeVisible();
    });
  });

  describe('valid videos', () => {
    beforeEach(async () => {
      initializeMockApp({
        authenticatedUser: {
          userId: 3,
          username: 'abc123',
          administrator: false,
          roles: [],
        },
      });
      store = initializeStore({ ...initialState });
      axiosMock = new MockAdapter(getAuthenticatedHttpClient());
      axiosUnauthenticateMock = new MockAdapter(getHttpClient());
      file = new File(['(⌐□_□)'], 'download.png', { type: 'image/png' });
    });

    describe('table view', () => {
      it('should render transcript settings button', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        const transcriptSettingsButton = screen.getByText(videoMessages.transcriptSettingsButtonLabel.defaultMessage);
        expect(transcriptSettingsButton).toBeVisible();

        fireEvent.click(transcriptSettingsButton);

        expect(screen.getByLabelText('close settings')).toBeVisible();
      });

      it('should render table with gallery card', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        expect(screen.getByTestId('files-data-table')).toBeVisible();

        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();
      });

      it('should switch table to list view', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        axiosMock.onGet(`${getVideosUrl(courseId)}/mOckID1/usage`)
          .reply(201, {
            usageLocations: [{
              display_location: 'subsection - unit / block',
              url: 'base/unit_id#block_id',
            }],
          });
        expect(screen.getByTestId('files-data-table')).toBeVisible();

        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();

        expect(screen.queryByRole('table')).toBeNull();

        const listButton = screen.getByLabelText('List');
        fireEvent.click(listButton);
        expect(screen.queryByTestId('grid-card-mOckID1')).toBeNull();

        expect(screen.getByRole('table')).toBeVisible();
      });

      it('should update video thumbnail', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        axiosMock.onPost(`${getApiBaseUrl()}/video_images/${courseId}/mOckID1`).reply(200, { image_url: 'url' });
        const addThumbnailButton = screen.getByTestId('video-thumbnail-mOckID1');
        const thumbnail = new File(['test'], 'sOMEUrl.jpg', { type: 'image/jpg' });
        fireEvent.click(addThumbnailButton);
        await executeThunk(addVideoThumbnail({ file: thumbnail, videoId: 'mOckID1', courseId }), store.dispatch);
        const updateStatus = store.getState().videos.updatingStatus;
        expect(updateStatus).toEqual(RequestStatus.SUCCESSFUL);
      });
      it('should no render thumbnail upload button', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        const addThumbnailButton = screen.queryByTestId('video-thumbnail-mOckID5');

        expect(addThumbnailButton).toBeNull();
      });
      describe('with videos with backend status in_progress', () => {
        it('should render video with in progress status', async () => {
          await mockStore(RequestStatus.IN_PROGRESS);
          expect(screen.getByText('Failed')).toBeVisible();
          expect(screen.queryByText('In Progress')).not.toBeInTheDocument();
        });
      });
    });

    describe('table actions', () => {
      describe('file upload', () => {
        it('should upload a single file', async () => {
          await mockStore(RequestStatus.SUCCESSFUL);

          axiosMock.onPost(getCourseVideosApiUrl(courseId)).reply(204, generateNewVideoApiResponse());
          axiosUnauthenticateMock.onPut('http://testing.org').reply(200);
          axiosMock.onGet(getCourseVideosApiUrl(courseId)).reply(200, generateAddVideoApiResponse());

          const addFilesButton = screen.getAllByLabelText('file-input')[3];
          await act(async () => {
            userEvent.upload(addFilesButton, file);
          });
          const addStatus = store.getState().videos.addingStatus;
          expect(addStatus).toEqual(RequestStatus.SUCCESSFUL);
        });

        it('when uploads are in progress, should show dialog and set them to failed on page leave', async () => {
          await mockStore(RequestStatus.SUCCESSFUL);

          axiosMock.onPost(getCourseVideosApiUrl(courseId)).reply(204, generateNewVideoApiResponse());
          axiosUnauthenticateMock.onPut('http://testing.org').reply(200);
          axiosMock.onGet(getCourseVideosApiUrl(courseId)).reply(200, generateAddVideoApiResponse());

          const uploadSpy = jest.spyOn(api, 'uploadVideo');
          const setFailedSpy = jest.spyOn(api, 'sendVideoUploadStatus').mockImplementation(() => {});
          uploadSpy.mockResolvedValue(new Promise(() => {}));

          const addFilesButton = screen.getAllByLabelText('file-input')[3];
          await act(async () => {
            userEvent.upload(addFilesButton, file);
          });
          await waitFor(() => {
            const addStatus = store.getState().videos.addingStatus;
            expect(addStatus).toEqual(RequestStatus.IN_PROGRESS);
            expect(uploadSpy).toHaveBeenCalled();
            expect(screen.getByText(videoMessages.videoUploadTrackerModalTitle.defaultMessage)).toBeVisible();
          });
          await act(async () => {
            window.dispatchEvent(new Event('beforeunload'));
          });
          await waitFor(() => {
            expect(setFailedSpy).toHaveBeenCalledWith(courseId, expect.any(String), expect.any(String), 'upload_failed');
          });
          uploadSpy.mockRestore();
          setFailedSpy.mockRestore();
        });

        it('should cancel all in-progress and set them to failed', async () => {
          await mockStore(RequestStatus.SUCCESSFUL);

          axiosMock.onPost(getCourseVideosApiUrl(courseId)).reply(204, generateNewVideoApiResponse());
          axiosUnauthenticateMock.onPut('http://testing.org').reply(200);
          axiosMock.onGet(getCourseVideosApiUrl(courseId)).reply(200, generateAddVideoApiResponse());

          const uploadSpy = jest.spyOn(api, 'uploadVideo');
          const setFailedSpy = jest.spyOn(api, 'sendVideoUploadStatus').mockImplementation(() => {});
          uploadSpy.mockResolvedValue(new Promise(() => {}));

          const addFilesButton = screen.getAllByLabelText('file-input')[3];
          await act(async () => {
            userEvent.upload(addFilesButton, file);
          });

          await waitFor(() => {
            const addStatus = store.getState().videos.addingStatus;
            expect(addStatus).toEqual(RequestStatus.IN_PROGRESS);

            expect(uploadSpy).toHaveBeenCalled();

            expect(screen.getByText(videoMessages.videoUploadTrackerModalTitle.defaultMessage)).toBeVisible();
          });

          await act(async () => {
            const cancelButton = screen.getByText(videoMessages.videoUploadTrackerAlertCancelLabel.defaultMessage);
            fireEvent.click(cancelButton);
          });
          await waitFor(() => {
            const addStatus = store.getState().videos.addingStatus;
            expect(setFailedSpy).toHaveBeenCalledWith(courseId, expect.any(String), expect.any(String), 'upload_failed');

            expect(addStatus).toEqual(RequestStatus.FAILED);

            expect(screen.getByText('Upload error')).toBeVisible();
          });
          uploadSpy.mockRestore();
          setFailedSpy.mockRestore();
        });
      });

      it('should have disabled action buttons', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        const actionsButton = screen.getByText(messages.actionsButtonLabel.defaultMessage);

        fireEvent.click(actionsButton);
        await waitFor(() => {
          expect(screen.getByText(messages.downloadTitle.defaultMessage).closest('a')).toHaveClass('disabled');

          expect(screen.getByText(messages.deleteTitle.defaultMessage).closest('a')).toHaveClass('disabled');
        });
      });

      it('delete button should be enabled and delete selected file', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);

        const [selectCardButton] = await screen.findAllByTestId('datatable-select-column-checkbox-cell');
        fireEvent.click(selectCardButton);

        const actionsButton = screen.getByText(messages.actionsButtonLabel.defaultMessage);
        expect(actionsButton).toBeVisible();
        fireEvent.click(actionsButton);

        const deleteButton = screen.getByText(messages.deleteTitle.defaultMessage).closest('a');
        expect(deleteButton).not.toHaveClass('disabled');

        axiosMock.onDelete(`${getCourseVideosApiUrl(courseId)}/mOckID1`).reply(204);

        fireEvent.click(deleteButton);
        expect(screen.getByText('Delete mOckID1.mp4')).toBeVisible();
        fireEvent.click(deleteButton);

        // Wait for the delete confirmation button to appear
        const confirmDeleteButton = await screen.findByRole('button', {
          name: messages.deleteFileButtonLabel.defaultMessage,
        });
        fireEvent.click(confirmDeleteButton);

        expect(screen.queryByText('Delete mOckID1.mp4')).toBeNull();

        // Check if the video is deleted in the store and UI
        await waitFor(() => {
          const deleteStatus = store.getState().videos.deletingStatus;
          expect(deleteStatus).toEqual(RequestStatus.SUCCESSFUL);
        });
        expect(screen.queryByTestId('grid-card-mOckID1')).toBeNull();
      });

      it('download button should be enabled and download multiple selected files', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        const selectCardButtons = screen.getAllByTestId('datatable-select-column-checkbox-cell');
        fireEvent.click(selectCardButtons[0]);
        fireEvent.click(selectCardButtons[1]);
        const actionsButton = screen.getByText(messages.actionsButtonLabel.defaultMessage);

        fireEvent.click(actionsButton);
        axiosMock.onPut(`${getVideosUrl(courseId)}/download`).reply(200, null);

        const downloadButton = screen.getByText(messages.downloadTitle.defaultMessage).closest('a');
        expect(downloadButton).not.toHaveClass('disabled');

        await act(async () => {
          fireEvent.click(downloadButton);
        });
      });

      describe('Sort and filter button', () => {
        beforeEach(async () => {
          await mockStore(RequestStatus.SUCCESSFUL);
          const sortAndFilterButton = screen.getByText(messages.sortButtonLabel.defaultMessage);

          fireEvent.click(sortAndFilterButton);
        });

        describe('sort function', () => {
          it('should be enabled and sort files by name', async () => {
            const sortNameAscendingButton = screen.getByText(messages.sortByNameAscending.defaultMessage);
            fireEvent.click(sortNameAscendingButton);

            fireEvent.click(screen.getByText(messages.applySortButton.defaultMessage));

            await waitFor(() => {
              expect(screen.queryByText(messages.sortModalTitleLabel.defaultMessage)).toBeNull();
            });
          });

          it('sort button should be enabled and sort files by file size', async () => {
            const sortBySizeDescendingButton = screen.getByText(messages.sortBySizeDescending.defaultMessage);
            fireEvent.click(sortBySizeDescendingButton);

            fireEvent.click(screen.getByText(messages.applySortButton.defaultMessage));

            await waitFor(() => {
              expect(screen.queryByText(messages.sortModalTitleLabel.defaultMessage)).toBeNull();
            });
          });
        });

        describe('filter function', () => {
          it('should filter videos with transcripts', async () => {
            const notTranscribedCheckboxFilter = screen.getByText(
              videoMessages.notTranscribedCheckboxLabel.defaultMessage,
            );
            const transcribedCheckboxFilter = screen.getByText(videoMessages.transcribedCheckboxLabel.defaultMessage);
            fireEvent.click(transcribedCheckboxFilter);
            fireEvent.click(notTranscribedCheckboxFilter);
            fireEvent.click(transcribedCheckboxFilter);

            fireEvent.click(screen.getByText(messages.applySortButton.defaultMessage));

            await waitFor(() => {
              const galleryCards = screen.getAllByTestId('grid-card', { exact: false });
              expect(galleryCards).toHaveLength(1);
            });
          });

          it('should clearAll selections', async () => {
            const sortByNewest = screen.getByText(messages.sortByNewest.defaultMessage);
            const sortBySizeDescendingButton = screen.getByText(messages.sortBySizeDescending.defaultMessage);
            const transcribedCheckboxFilter = screen.getByLabelText(
              videoMessages.transcribedCheckboxLabel.defaultMessage,
            );

            fireEvent.click(sortBySizeDescendingButton);
            fireEvent.click(transcribedCheckboxFilter);

            const clearAllButton = screen.getByText('Clear all');
            fireEvent.click(clearAllButton);

            expect(transcribedCheckboxFilter).toHaveProperty('checked', false);

            expect(within(sortBySizeDescendingButton).getByLabelText('file size descending radio'))
              .toHaveProperty('checked', false);

            expect(within(sortByNewest).getByLabelText('date added descending radio'))
              .toHaveProperty('checked', true);
          });

          it('should remove Transcribed filter chip', async () => {
            const transcribedCheckboxFilter = screen.getByText(videoMessages.transcribedCheckboxLabel.defaultMessage);
            fireEvent.click(transcribedCheckboxFilter);

            fireEvent.click(screen.getByText(messages.applySortButton.defaultMessage));

            const imageFilterChip = await screen.findByRole('button', { name: 'Remove this filter' });
            fireEvent.click(imageFilterChip);

            expect(screen.queryByText(videoMessages.transcribedCheckboxLabel.defaultMessage)).toBeNull();
          });
        });
      });
    });

    describe('card menu actions', () => {
      describe('Info', () => {
        it('should open video info', async () => {
          await mockStore(RequestStatus.SUCCESSFUL);

          const videoMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');

          axiosMock.onGet(`${getVideosUrl(courseId)}/mOckID1/usage`)
            .reply(200, {
              usageLocations: [{
                display_location: 'subsection - unit / block',
                url: 'base/unit_id#block_id',
              }],
            });

          fireEvent.click(within(videoMenuButton).getByLabelText('file-menu-toggle'));
          fireEvent.click(screen.getByText('Info'));

          await waitFor(() => {
            expect(screen.getByText(messages.infoTitle.defaultMessage)).toBeVisible();
          });

          const { usageStatus } = store.getState().videos;

          expect(usageStatus).toEqual(RequestStatus.SUCCESSFUL);

          expect(screen.getByText('subsection - unit / block')).toBeVisible();
        });

        it('should open video info modal and show info tab', async () => {
          await mockStore(RequestStatus.SUCCESSFUL);
          const videoMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');

          axiosMock.onGet(`${getVideosUrl(courseId)}/mOckID1/usage`).reply(201, { usageLocations: [] });
          fireEvent.click(within(videoMenuButton).getByLabelText('file-menu-toggle'));
          fireEvent.click(screen.getByText('Info'));
          await waitFor(() => {
            expect(screen.getByText(messages.usageNotInUseMessage.defaultMessage)).toBeVisible();
          });

          const infoTab = screen.getAllByRole('tab')[0];
          expect(infoTab).toBeVisible();

          expect(infoTab).toHaveClass('active');
        });

        it('should open video info modal and show transcript tab', async () => {
          await mockStore(RequestStatus.SUCCESSFUL);
          const videoMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');

          axiosMock.onGet(`${getVideosUrl(courseId)}/mOckID1/usage`).reply(201, { usageLocations: [] });
          fireEvent.click(within(videoMenuButton).getByLabelText('file-menu-toggle'));
          fireEvent.click(screen.getByText('Info'));
          await waitFor(() => {
            expect(screen.getByText(messages.usageNotInUseMessage.defaultMessage)).toBeVisible();
          });

          const transcriptTab = screen.getAllByRole('tab')[1];
          fireEvent.click(transcriptTab);
          expect(transcriptTab).toBeVisible();

          expect(transcriptTab).toHaveClass('active');
        });

        it('should show transcript error', async () => {
          await mockStore(RequestStatus.SUCCESSFUL);
          const videoMenuButton = screen.getByTestId('file-menu-dropdown-mOckID3');

          axiosMock.onGet(`${getVideosUrl(courseId)}/mOckID3/usage`).reply(201, { usageLocations: [] });
          fireEvent.click(within(videoMenuButton).getByLabelText('file-menu-toggle'));
          fireEvent.click(screen.getByText('Info'));

          const transcriptTab = await screen.getAllByRole('tab')[1];
          fireEvent.click(transcriptTab);

          expect(screen.getByText('Transcript (1)')).toBeVisible();
        });
      });

      it('download button should download file', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);

        const videoMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');

        fireEvent.click(within(videoMenuButton).getByLabelText('file-menu-toggle'));
        fireEvent.click(screen.getByText('Download'));

        await waitFor(() => {
          const updateStatus = store.getState().videos.updatingStatus;
          expect(updateStatus).toEqual(RequestStatus.SUCCESSFUL);
        });
      });

      it('delete button should delete file', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);

        const fileMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');

        axiosMock.onDelete(`${getCourseVideosApiUrl(courseId)}/mOckID1`).reply(204);
        fireEvent.click(within(fileMenuButton).getByLabelText('file-menu-toggle'));
        fireEvent.click(screen.getByTestId('open-delete-confirmation-button'));
        await waitFor(() => {
          expect(screen.getByText('Delete mOckID1.mp4')).toBeVisible();
        });

        fireEvent.click(screen.getByText(messages.deleteFileButtonLabel.defaultMessage));
        await waitFor(() => {
          expect(screen.queryByText('Delete mOckID1.mp4')).toBeNull();
        });
        await executeThunk(deleteVideoFile(courseId, 'mOckID1', 5), store.dispatch);
        const deleteStatus = store.getState().videos.deletingStatus;
        expect(deleteStatus).toEqual(RequestStatus.SUCCESSFUL);

        expect(screen.queryByTestId('grid-card-mOckID1')).toBeNull();
      });
    });

    describe('api errors', () => {
      it('404 intitial fetch should show error', async () => {
        await mockStore(RequestStatus.FAILED);

        const { loadingStatus } = store.getState().videos;
        expect(loadingStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getByText('Error')).toBeVisible();
      });

      it('invalid file size should show error', async () => {
        const errorMessage = 'File download.png exceeds maximum size of 5 GB.';
        await mockStore(RequestStatus.SUCCESSFUL);
        axiosMock.onPost(getCourseVideosApiUrl(courseId)).reply(413, { error: errorMessage });
        axiosMock.onGet(getCourseVideosApiUrl(courseId)).reply(200, generateAddVideoApiResponse());

        const addFilesButton = screen.getAllByLabelText('file-input')[3];
        await act(async () => {
          userEvent.upload(addFilesButton, file);
        });
        await waitFor(() => {
          const addStatus = store.getState().videos.addingStatus;
          expect(addStatus).toEqual(RequestStatus.FAILED);

          expect(screen.getByText('Upload error')).toBeVisible();
        });
      });

      it('404 add file should show error', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        axiosMock.onPost(getCourseVideosApiUrl(courseId)).reply(404);
        axiosMock.onGet(getCourseVideosApiUrl(courseId)).reply(200, generateAddVideoApiResponse());

        const addFilesButton = screen.getAllByLabelText('file-input')[3];
        await act(async () => {
          userEvent.upload(addFilesButton, file);
        });
        await waitFor(() => {
          const addStatus = store.getState().videos.addingStatus;
          expect(addStatus).toEqual(RequestStatus.FAILED);

          expect(screen.getByText('Upload error')).toBeVisible();
        });
      });

      it('404 add thumbnail should show error', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        axiosMock.onPost(`${getApiBaseUrl()}/video_images/${courseId}/mOckID1`).reply(404);

        const addThumbnailButton = screen.getByTestId('video-thumbnail-mOckID1');
        const thumbnail = new File(['test'], 'sOMEUrl.jpg', { type: 'image/jpg' });
        fireEvent.click(addThumbnailButton);
        await executeThunk(addVideoThumbnail({ file: thumbnail, videoId: 'mOckID1', courseId }), store.dispatch);
        const updateStatus = store.getState().videos.updatingStatus;
        expect(updateStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getByText('Error')).toBeVisible();
      });

      it('404 upload file to server should show error', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        axiosMock.onPost(getCourseVideosApiUrl(courseId)).reply(204, generateNewVideoApiResponse());
        axiosUnauthenticateMock.onPut('http://testing.org').reply(404);
        axiosMock.onGet(getCourseVideosApiUrl(courseId)).reply(200, generateAddVideoApiResponse());
        const addFilesButton = screen.getAllByLabelText('file-input')[3];
        await act(async () => {
          userEvent.upload(addFilesButton, file);
        });
        await waitFor(() => {
          const addStatus = store.getState().videos.addingStatus;
          expect(addStatus).toEqual(RequestStatus.FAILED);

          expect(screen.getByText('Upload error')).toBeVisible();
        });
      });

      it('404 delete should show error', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);

        const videoMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');

        axiosMock.onDelete(`${getCourseVideosApiUrl(courseId)}/mOckID1`).reply(404);
        fireEvent.click(within(videoMenuButton).getByLabelText('file-menu-toggle'));
        fireEvent.click(screen.getByTestId('open-delete-confirmation-button'));
        await waitFor(async () => {
          expect(screen.getByText('Delete mOckID1.mp4')).toBeVisible();
        });

        fireEvent.click(screen.getByText(messages.deleteFileButtonLabel.defaultMessage));
        await waitFor(async () => {
          expect(screen.queryByText('Delete mOckID1.mp4')).toBeNull();
        });

        await waitFor(() => {
          const deleteStatus = store.getState().videos.deletingStatus;
          expect(deleteStatus).toEqual(RequestStatus.FAILED);
        });

        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();

        expect(screen.getByText('Error')).toBeVisible();
      });

      it('404 usage path fetch should show error', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);

        const videoMenuButton = screen.getByTestId('file-menu-dropdown-mOckID3');

        axiosMock.onGet(`${getVideosUrl(courseId)}/mOckID3/usage`).reply(404);
        fireEvent.click(within(videoMenuButton).getByLabelText('file-menu-toggle'));
        fireEvent.click(screen.getByText('Info'));
        await executeThunk(getUsagePaths({
          courseId,
          video: { id: 'mOckID3', displayName: 'mOckID3' },
        }), store.dispatch);
        await waitFor(() => {
          const { usageStatus } = store.getState().videos;
          expect(usageStatus).toEqual(RequestStatus.FAILED);
        });
      });

      it('multiple video files fetch failure should show error', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);

        const selectCardButtons = screen.getAllByTestId('datatable-select-column-checkbox-cell');
        fireEvent.click(selectCardButtons[0]);
        fireEvent.click(selectCardButtons[2]);
        const actionsButton = screen.getByText(messages.actionsButtonLabel.defaultMessage);
        expect(actionsButton).toBeVisible();

        fireEvent.click(actionsButton);
        const downloadButton = await screen.getByText(messages.downloadTitle.defaultMessage).closest('a');
        expect(downloadButton).not.toHaveClass('disabled');

        axiosMock.onPut(`${getVideosUrl(courseId)}/download`).reply(404);
        fireEvent.click(downloadButton);
        await executeThunk(fetchVideoDownload([{ original: { displayName: 'mOckID1', id: '2', downloadLink: 'test' } }]), store.dispatch);

        const updateStatus = store.getState().videos.updatingStatus;
        expect(updateStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getByText('Error')).toBeVisible();
      });
    });
  });
});
