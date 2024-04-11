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
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
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
  addVideoFile,
  deleteVideoFile,
  getUsagePaths,
  addVideoThumbnail,
  fetchVideoDownload,
} from './data/thunks';
import { getVideosUrl, getCourseVideosApiUrl, getApiBaseUrl } from './data/api';
import videoMessages from './messages';
import messages from '../generic/messages';

let axiosMock;
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
          uploadingIds: [],
        },
        models: {},
      });
      axiosMock = new MockAdapter(getAuthenticatedHttpClient());
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
        const mockResponseData = { status: '200', ok: true, blob: () => 'Data' };
        const mockFetchResponse = Promise.resolve(mockResponseData);
        global.fetch = jest.fn().mockImplementation(() => mockFetchResponse);

        axiosMock.onPost(getCourseVideosApiUrl(courseId)).reply(204, generateNewVideoApiResponse());
        axiosMock.onGet(getCourseVideosApiUrl(courseId)).reply(200, generateAddVideoApiResponse());
        Object.defineProperty(dropzone, 'files', {
          value: [file],
        });
        fireEvent.drop(dropzone);
        await executeThunk(addVideoFile(courseId, file, []), store.dispatch);
      });
      const addStatus = store.getState().videos.addingStatus;
      expect(addStatus).toEqual(RequestStatus.SUCCESSFUL);

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
      store = initializeStore(initialState);
      axiosMock = new MockAdapter(getAuthenticatedHttpClient());
      file = new File(['(⌐□_□)'], 'download.png', { type: 'image/png' });
    });

    describe('table view', () => {
      it('should render transcript settings button', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        const transcriptSettingsButton = screen.getByText(videoMessages.transcriptSettingsButtonLabel.defaultMessage);
        expect(transcriptSettingsButton).toBeVisible();

        await act(async () => {
          fireEvent.click(transcriptSettingsButton);
        });

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
        await act(async () => {
          fireEvent.click(listButton);
        });
        expect(screen.queryByTestId('grid-card-mOckID1')).toBeNull();

        expect(screen.getByRole('table')).toBeVisible();
      });

      it('should update video thumbnail', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        axiosMock.onPost(`${getApiBaseUrl()}/video_images/${courseId}/mOckID1`).reply(200, { image_url: 'url' });
        const addThumbnailButton = screen.getByTestId('video-thumbnail-mOckID1');
        const thumbnail = new File(['test'], 'sOMEUrl.jpg', { type: 'image/jpg' });
        await act(async () => {
          fireEvent.click(addThumbnailButton);
          await executeThunk(addVideoThumbnail({ file: thumbnail, videoId: 'mOckID1', courseId }), store.dispatch);
        });
        const updateStatus = store.getState().videos.updatingStatus;
        expect(updateStatus).toEqual(RequestStatus.SUCCESSFUL);
      });
      it('should not render thumbnail upload button', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        const addThumbnailButton = screen.queryByTestId('video-thumbnail-mOckID5');

        expect(addThumbnailButton).toBeNull();
      });
      describe('with videos with backend status in_progress', () => {
        it('should render video with in progress status', async () => {
          await mockStore(RequestStatus.IN_PROGRESS);
          expect(screen.getByText('Failed')).toBeVisible();
          expect(screen.queryByText('In Progress')).toBeNull();
        });
      });
    });

    describe('table actions', () => {
      it('should upload a single file', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        const mockResponseData = { status: '200', ok: true, blob: () => 'Data' };
        const mockFetchResponse = Promise.resolve(mockResponseData);
        global.fetch = jest.fn().mockImplementation(() => mockFetchResponse);

        axiosMock.onPost(getCourseVideosApiUrl(courseId)).reply(204, generateNewVideoApiResponse());
        axiosMock.onGet(getCourseVideosApiUrl(courseId)).reply(200, generateAddVideoApiResponse());

        const addFilesButton = screen.getAllByLabelText('file-input')[3];
        const { videoIds } = store.getState().videos;
        await act(async () => {
          userEvent.upload(addFilesButton, file);
          await executeThunk(addVideoFile(courseId, file, videoIds), store.dispatch);
        });
        const addStatus = store.getState().videos.addingStatus;
        expect(addStatus).toEqual(RequestStatus.SUCCESSFUL);
      });

      it('should have disabled action buttons', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        const actionsButton = screen.getByText(messages.actionsButtonLabel.defaultMessage);

        await waitFor(() => {
          fireEvent.click(actionsButton);
        });
        expect(screen.getByText(messages.downloadTitle.defaultMessage).closest('a')).toHaveClass('disabled');

        expect(screen.getByText(messages.deleteTitle.defaultMessage).closest('a')).toHaveClass('disabled');
      });

      it('delete button should be enabled and delete selected file', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        const selectCardButton = screen.getAllByTestId('datatable-select-column-checkbox-cell')[0];
        fireEvent.click(selectCardButton);
        const actionsButton = screen.getByText(messages.actionsButtonLabel.defaultMessage);

        await waitFor(() => {
          fireEvent.click(actionsButton);
        });
        const deleteButton = screen.getByText(messages.deleteTitle.defaultMessage).closest('a');
        expect(deleteButton).not.toHaveClass('disabled');

        axiosMock.onDelete(`${getCourseVideosApiUrl(courseId)}/mOckID1`).reply(204);

        fireEvent.click(deleteButton);
        expect(screen.getByText('Delete video(s) confirmation')).toBeVisible();
        await act(async () => {
          userEvent.click(deleteButton);
        });

        // Wait for the delete confirmation button to appear
        const confirmDeleteButton = await screen.findByRole('button', {
          name: messages.deleteFileButtonLabel.defaultMessage,
        });

        await act(async () => {
          userEvent.click(confirmDeleteButton);
        });

        expect(screen.queryByText('Delete video(s) confirmation')).toBeNull();

        // Check if the video is deleted in the store and UI
        const deleteStatus = store.getState().videos.deletingStatus;
        expect(deleteStatus).toEqual(RequestStatus.SUCCESSFUL);
        expect(screen.queryByTestId('grid-card-mOckID1')).toBeNull();
      });

      it('download button should be enabled and download single selected file', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        const selectCardButton = screen.getAllByTestId('datatable-select-column-checkbox-cell')[0];
        fireEvent.click(selectCardButton);
        const actionsButton = screen.getByText(messages.actionsButtonLabel.defaultMessage);

        await waitFor(() => {
          fireEvent.click(actionsButton);
        });
        const downloadButton = screen.getByText(messages.downloadTitle.defaultMessage).closest('a');
        expect(downloadButton).not.toHaveClass('disabled');

        await act(async () => {
          fireEvent.click(downloadButton);
        });

        const updateStatus = store.getState().videos.updatingStatus;
        expect(updateStatus).toEqual(RequestStatus.SUCCESSFUL);
      });

      it('download button should be enabled and download multiple selected files', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        const selectCardButtons = screen.getAllByTestId('datatable-select-column-checkbox-cell');
        fireEvent.click(selectCardButtons[0]);
        fireEvent.click(selectCardButtons[1]);
        const actionsButton = screen.getByText(messages.actionsButtonLabel.defaultMessage);

        await waitFor(() => {
          fireEvent.click(actionsButton);
        });
        axiosMock.onPut(`${getVideosUrl(courseId)}/download`).reply(200, null);

        const downloadButton = screen.getByText(messages.downloadTitle.defaultMessage).closest('a');
        expect(downloadButton).not.toHaveClass('disabled');

        await act(async () => {
          fireEvent.click(downloadButton);
        });

        const updateStatus = store.getState().videos.updatingStatus;
        expect(updateStatus).toEqual(RequestStatus.SUCCESSFUL);
      });

      describe('Sort and filter button', () => {
        beforeEach(async () => {
          await mockStore(RequestStatus.SUCCESSFUL);
          const sortAndFilterButton = screen.getByText(messages.sortButtonLabel.defaultMessage);

          await waitFor(() => {
            fireEvent.click(sortAndFilterButton);
          });
        });

        describe('sort function', () => {
          it('should be enabled and sort files by name', async () => {
            const sortNameAscendingButton = screen.getByText(messages.sortByNameAscending.defaultMessage);
            fireEvent.click(sortNameAscendingButton);

            await waitFor(() => {
              fireEvent.click(screen.getByText(messages.applySortButton.defaultMessage));
            });

            expect(screen.queryByText(messages.sortModalTitleLabel.defaultMessage)).toBeNull();
          });

          it('sort button should be enabled and sort files by file size', async () => {
            const sortBySizeDescendingButton = screen.getByText(messages.sortBySizeDescending.defaultMessage);
            fireEvent.click(sortBySizeDescendingButton);

            await waitFor(() => {
              fireEvent.click(screen.getByText(messages.applySortButton.defaultMessage));
            });

            expect(screen.queryByText(messages.sortModalTitleLabel.defaultMessage)).toBeNull();
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

            await waitFor(() => {
              fireEvent.click(screen.getByText(messages.applySortButton.defaultMessage));
            });

            const galleryCards = screen.getAllByTestId('grid-card', { exact: false });

            expect(galleryCards).toHaveLength(1);
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
            await waitFor(() => fireEvent.click(clearAllButton));

            expect(transcribedCheckboxFilter).toHaveProperty('checked', false);

            expect(within(sortBySizeDescendingButton).getByLabelText('file size descending radio'))
              .toHaveProperty('checked', false);

            expect(within(sortByNewest).getByLabelText('date added descending radio'))
              .toHaveProperty('checked', true);
          });

          it('should remove Transcribed filter chip', async () => {
            const transcribedCheckboxFilter = screen.getByText(videoMessages.transcribedCheckboxLabel.defaultMessage);
            fireEvent.click(transcribedCheckboxFilter);

            await waitFor(() => {
              fireEvent.click(screen.getByText(messages.applySortButton.defaultMessage));
            });

            const imageFilterChip = screen.getByTestId('icon-after');
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

          await waitFor(() => {
            fireEvent.click(within(videoMenuButton).getByLabelText('file-menu-toggle'));
            fireEvent.click(screen.getByText('Info'));
          });

          expect(screen.getByText(messages.infoTitle.defaultMessage)).toBeVisible();

          const { usageStatus } = store.getState().videos;

          expect(usageStatus).toEqual(RequestStatus.SUCCESSFUL);

          expect(screen.getByText('subsection - unit / block')).toBeVisible();
        });

        it('should open video info modal and show info tab', async () => {
          await mockStore(RequestStatus.SUCCESSFUL);
          const videoMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');

          axiosMock.onGet(`${getVideosUrl(courseId)}/mOckID1/usage`).reply(201, { usageLocations: [] });
          await waitFor(() => {
            fireEvent.click(within(videoMenuButton).getByLabelText('file-menu-toggle'));
            fireEvent.click(screen.getByText('Info'));
          });

          expect(screen.getByText(messages.usageNotInUseMessage.defaultMessage)).toBeVisible();

          const infoTab = screen.getAllByRole('tab')[0];
          expect(infoTab).toBeVisible();

          expect(infoTab).toHaveClass('active');
        });

        it('should open video info modal and show transcript tab', async () => {
          await mockStore(RequestStatus.SUCCESSFUL);
          const videoMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');

          axiosMock.onGet(`${getVideosUrl(courseId)}/mOckID1/usage`).reply(201, { usageLocations: [] });
          await waitFor(() => {
            fireEvent.click(within(videoMenuButton).getByLabelText('file-menu-toggle'));
            fireEvent.click(screen.getByText('Info'));
          });

          expect(screen.getByText(messages.usageNotInUseMessage.defaultMessage)).toBeVisible();

          const transcriptTab = screen.getAllByRole('tab')[1];
          await act(async () => {
            fireEvent.click(transcriptTab);
          });
          expect(transcriptTab).toBeVisible();

          expect(transcriptTab).toHaveClass('active');
        });

        it('should show transcript error', async () => {
          await mockStore(RequestStatus.SUCCESSFUL);
          const videoMenuButton = screen.getByTestId('file-menu-dropdown-mOckID3');

          axiosMock.onGet(`${getVideosUrl(courseId)}/mOckID3/usage`).reply(201, { usageLocations: [] });
          await waitFor(() => {
            fireEvent.click(within(videoMenuButton).getByLabelText('file-menu-toggle'));
            fireEvent.click(screen.getByText('Info'));
          });

          const transcriptTab = screen.getAllByRole('tab')[1];
          await act(async () => {
            fireEvent.click(transcriptTab);
          });

          expect(screen.getByText('Transcript (1)')).toBeVisible();
        });
      });

      it('download button should download file', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);

        const videoMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');

        await waitFor(() => {
          fireEvent.click(within(videoMenuButton).getByLabelText('file-menu-toggle'));
          fireEvent.click(screen.getByText('Download'));
        });

        const updateStatus = store.getState().videos.updatingStatus;

        expect(updateStatus).toEqual(RequestStatus.SUCCESSFUL);
      });

      it('delete button should delete file', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);

        const fileMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');

        await waitFor(() => {
          axiosMock.onDelete(`${getCourseVideosApiUrl(courseId)}/mOckID1`).reply(204);
          fireEvent.click(within(fileMenuButton).getByLabelText('file-menu-toggle'));
          fireEvent.click(screen.getByTestId('open-delete-confirmation-button'));
          expect(screen.getByText('Delete video(s) confirmation')).toBeVisible();

          fireEvent.click(screen.getByText(messages.deleteFileButtonLabel.defaultMessage));
          expect(screen.queryByText('Delete video(s) confirmation')).toBeNull();

          executeThunk(deleteVideoFile(courseId, 'mOckID1', 5), store.dispatch);
        });
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

        const addFilesButton = screen.getAllByLabelText('file-input')[3];
        await act(async () => {
          userEvent.upload(addFilesButton, file);
          await executeThunk(addVideoFile(courseId, file), store.dispatch);
        });
        const addStatus = store.getState().videos.addingStatus;
        expect(addStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getByText('Error')).toBeVisible();
      });

      it('404 add file should show error', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        axiosMock.onPost(getCourseVideosApiUrl(courseId)).reply(404);

        const addFilesButton = screen.getAllByLabelText('file-input')[3];
        await act(async () => {
          userEvent.upload(addFilesButton, file);
          await executeThunk(addVideoFile(courseId, file), store.dispatch);
        });
        const addStatus = store.getState().videos.addingStatus;
        expect(addStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getByText('Error')).toBeVisible();
      });

      it('404 add thumbnail should show error', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        axiosMock.onPost(`${getApiBaseUrl()}/video_images/${courseId}/mOckID1`).reply(404);

        const addThumbnailButton = screen.getByTestId('video-thumbnail-mOckID1');
        const thumbnail = new File(['test'], 'sOMEUrl.jpg', { type: 'image/jpg' });
        await act(async () => {
          fireEvent.click(addThumbnailButton);
          await executeThunk(addVideoThumbnail({ file: thumbnail, videoId: 'mOckID1', courseId }), store.dispatch);
        });
        const updateStatus = store.getState().videos.updatingStatus;
        expect(updateStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getByText('Error')).toBeVisible();
      });

      it('404 upload file to server should show error', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        const mockResponseData = { status: '404', ok: false, blob: () => 'Data' };
        const mockFetchResponse = Promise.reject(mockResponseData);
        global.fetch = jest.fn().mockImplementation(() => mockFetchResponse);

        axiosMock.onPost(getCourseVideosApiUrl(courseId)).reply(204, generateNewVideoApiResponse());
        axiosMock.onGet(getCourseVideosApiUrl(courseId)).reply(200, generateAddVideoApiResponse());
        const addFilesButton = screen.getAllByLabelText('file-input')[3];
        await act(async () => {
          userEvent.upload(addFilesButton, file);
          await executeThunk(addVideoFile(courseId, file), store.dispatch);
        });
        const addStatus = store.getState().videos.addingStatus;
        expect(addStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getByText('Error')).toBeVisible();
      });

      it('404 delete should show error', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);

        const videoMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');

        await waitFor(() => {
          axiosMock.onDelete(`${getCourseVideosApiUrl(courseId)}/mOckID1`).reply(404);
          fireEvent.click(within(videoMenuButton).getByLabelText('file-menu-toggle'));
          fireEvent.click(screen.getByTestId('open-delete-confirmation-button'));
          expect(screen.getByText('Delete video(s) confirmation')).toBeVisible();

          fireEvent.click(screen.getByText(messages.deleteFileButtonLabel.defaultMessage));
          expect(screen.queryByText('Delete video(s) confirmation')).toBeNull();

          executeThunk(deleteVideoFile(courseId, 'mOckID1', 5), store.dispatch);
        });
        const deleteStatus = store.getState().videos.deletingStatus;
        expect(deleteStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();

        expect(screen.getByText('Error')).toBeVisible();
      });

      it('404 usage path fetch should show error', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);

        const videoMenuButton = screen.getByTestId('file-menu-dropdown-mOckID3');

        axiosMock.onGet(`${getVideosUrl(courseId)}/mOckID3/usage`).reply(404);
        await waitFor(() => {
          fireEvent.click(within(videoMenuButton).getByLabelText('file-menu-toggle'));
          fireEvent.click(screen.getByText('Info'));
          executeThunk(getUsagePaths({
            courseId,
            video: { id: 'mOckID3', displayName: 'mOckID3' },
          }), store.dispatch);
        });
        const { usageStatus } = store.getState().videos;
        expect(usageStatus).toEqual(RequestStatus.FAILED);
      });

      it('multiple video files fetch failure should show error', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);

        const selectCardButtons = screen.getAllByTestId('datatable-select-column-checkbox-cell');
        fireEvent.click(selectCardButtons[0]);
        fireEvent.click(selectCardButtons[2]);
        const actionsButton = screen.getByText(messages.actionsButtonLabel.defaultMessage);
        expect(actionsButton).toBeVisible();

        await waitFor(() => {
          fireEvent.click(actionsButton);
        });
        const downloadButton = screen.getByText(messages.downloadTitle.defaultMessage).closest('a');
        expect(downloadButton).not.toHaveClass('disabled');

        axiosMock.onPut(`${getVideosUrl(courseId)}/download`).reply(404);

        await waitFor(() => {
          fireEvent.click(downloadButton);
          executeThunk(fetchVideoDownload([{ original: { displayName: 'mOckID1', id: '2', downloadLink: 'test' } }]), store.dispatch);
        });

        const updateStatus = store.getState().videos.updatingStatus;
        expect(updateStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getByText('Error')).toBeVisible();
      });
    });
  });
});
