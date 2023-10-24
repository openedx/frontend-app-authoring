import {
  render,
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReactDOM from 'react-dom';

import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import initializeStore from '../../store';
import { executeThunk } from '../../utils';
import { RequestStatus } from '../../data/constants';
import Videos from './Videos';
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
} from './data/thunks';
import { getVideosUrl, getCoursVideosApiUrl, getApiBaseUrl } from './data/api';
import videoMessages from './messages';
import messages from '../messages';

let axiosMock;
let store;
let file;
ReactDOM.createPortal = jest.fn(node => node);
jest.mock('file-saver');

const renderComponent = () => {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <Videos courseId={courseId} />
      </AppProvider>
    </IntlProvider>,
  );
};

const mockStore = async (
  status,
) => {
  const fetchVideosUrl = getVideosUrl(courseId);
  axiosMock.onGet(fetchVideosUrl).reply(getStatusValue(status), generateFetchVideosApiResponse());
  await executeThunk(fetchVideos(courseId), store.dispatch);
};

const emptyMockStore = async (status) => {
  const fetchVideosUrl = getVideosUrl(courseId);
  axiosMock.onGet(fetchVideosUrl).reply(getStatusValue(status), generateEmptyApiResponse());
  await executeThunk(fetchVideos(courseId), store.dispatch);
};

describe('FilesAndUploads', () => {
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
      file = new File(['(⌐□_□)'], 'download.mp4', { type: 'video/mp4' });
    });

    it('should return placeholder component', async () => {
      renderComponent();
      await mockStore(RequestStatus.DENIED);
      expect(screen.getByTestId('under-construction-placeholder')).toBeVisible();
    });

    it('should not render transcript settings button', async () => {
      renderComponent();
      await emptyMockStore(RequestStatus.SUCCESSFUL);
      expect(screen.queryByText(videoMessages.transcriptSettingsButtonLabel.defaultMessage));
    });

    it('should have Video uploads title', async () => {
      renderComponent();
      await emptyMockStore(RequestStatus.SUCCESSFUL);
      expect(screen.getByText(videoMessages.heading.defaultMessage)).toBeVisible();
    });

    it('should render dropzone', async () => {
      renderComponent();
      await emptyMockStore(RequestStatus.SUCCESSFUL);
      expect(screen.getByTestId('files-dropzone')).toBeVisible();

      expect(screen.queryByTestId('files-data-table')).toBeNull();
    });

    it('should upload a single file', async () => {
      renderComponent();
      await emptyMockStore(RequestStatus.SUCCESSFUL);
      const dropzone = screen.getByTestId('files-dropzone');
      await act(async () => {
        const mockResponseData = { status: '200', ok: true, blob: () => 'Data' };
        const mockFetchResponse = Promise.resolve(mockResponseData);
        global.fetch = jest.fn().mockImplementation(() => mockFetchResponse);

        axiosMock.onPost(getCoursVideosApiUrl(courseId)).reply(204, generateNewVideoApiResponse());
        axiosMock.onGet(getCoursVideosApiUrl(courseId)).reply(200, generateAddVideoApiResponse());

        Object.defineProperty(dropzone, 'files', {
          value: [file],
        });
        fireEvent.drop(dropzone);
        await executeThunk(addVideoFile(courseId, file), store.dispatch);
      });
      const addStatus = store.getState().videos.addingStatus;
      expect(addStatus).toEqual(RequestStatus.SUCCESSFUL);

      expect(screen.queryByTestId('files-dropzone')).toBeNull();

      expect(screen.getByTestId('files-data-table')).toBeVisible();
    });
  });

  describe('valid assets', () => {
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
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        const transcriptSettingsButton = screen.getByText(videoMessages.transcriptSettingsButtonLabel.defaultMessage);
        expect(transcriptSettingsButton).toBeVisible();

        await act(async () => {
          fireEvent.click(transcriptSettingsButton);
        });

        expect(screen.getByLabelText('close settings')).toBeVisible();
      });

      it('should render table with gallery card', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        expect(screen.getByTestId('files-data-table')).toBeVisible();

        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();
      });

      it('should switch table to list view', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
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
        renderComponent();
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
    });

    describe('table actions', () => {
      it('should upload a single file', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        const mockResponseData = { status: '200', ok: true, blob: () => 'Data' };
        const mockFetchResponse = Promise.resolve(mockResponseData);
        global.fetch = jest.fn().mockImplementation(() => mockFetchResponse);

        axiosMock.onPost(getCoursVideosApiUrl(courseId)).reply(204, generateNewVideoApiResponse());
        axiosMock.onGet(getCoursVideosApiUrl(courseId)).reply(200, generateAddVideoApiResponse());

        const addFilesButton = screen.getAllByLabelText('file-input')[3];
        await act(async () => {
          userEvent.upload(addFilesButton, file);
          await executeThunk(addVideoFile(courseId, file), store.dispatch);
        });
        const addStatus = store.getState().videos.addingStatus;
        expect(addStatus).toEqual(RequestStatus.SUCCESSFUL);
      });

      it('should have disabled action buttons', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        const actionsButton = screen.getByText(messages.actionsButtonLabel.defaultMessage);
        expect(actionsButton).toBeVisible();

        await waitFor(() => {
          fireEvent.click(actionsButton);
        });
        expect(screen.getByText(messages.downloadTitle.defaultMessage).closest('a')).toHaveClass('disabled');

        expect(screen.getByText(messages.deleteTitle.defaultMessage).closest('a')).toHaveClass('disabled');
      });

      it('delete button should be enabled and delete selected file', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        const selectCardButton = screen.getAllByTestId('datatable-select-column-checkbox-cell')[0];
        fireEvent.click(selectCardButton);
        const actionsButton = screen.getByText(messages.actionsButtonLabel.defaultMessage);
        expect(actionsButton).toBeVisible();

        await waitFor(() => {
          fireEvent.click(actionsButton);
        });
        const deleteButton = screen.getByText(messages.deleteTitle.defaultMessage).closest('a');
        expect(deleteButton).not.toHaveClass('disabled');

        axiosMock.onDelete(`${getCoursVideosApiUrl(courseId)}/mOckID1`).reply(204);

        fireEvent.click(deleteButton);
        expect(screen.getByText(messages.deleteConfirmationTitle.defaultMessage)).toBeVisible();
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

        expect(screen.queryByText(messages.deleteConfirmationTitle.defaultMessage)).toBeNull();

        // Check if the video is deleted in the store and UI
        const deleteStatus = store.getState().videos.deletingStatus;
        expect(deleteStatus).toEqual(RequestStatus.SUCCESSFUL);
        expect(screen.queryByTestId('grid-card-mOckID1')).toBeNull();
      });

      it('download button should be enabled and download single selected file', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        const selectCardButton = screen.getAllByTestId('datatable-select-column-checkbox-cell')[0];
        fireEvent.click(selectCardButton);
        const actionsButton = screen.getByText(messages.actionsButtonLabel.defaultMessage);
        expect(actionsButton).toBeVisible();

        await waitFor(() => {
          fireEvent.click(actionsButton);
        });
        const downloadButton = screen.getByText(messages.downloadTitle.defaultMessage).closest('a');
        expect(downloadButton).not.toHaveClass('disabled');

        axiosMock.onGet(`${getVideosUrl(courseId)}/mOckID1`).reply(200, { download_link: 'http://download.org' });

        await act(async () => {
          fireEvent.click(downloadButton);
        });

        const updateStatus = store.getState().videos.updatingStatus;
        expect(updateStatus).toEqual(RequestStatus.SUCCESSFUL);
      });

      it('download button should be enabled and download multiple selected files', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        const selectCardButtons = screen.getAllByTestId('datatable-select-column-checkbox-cell');
        fireEvent.click(selectCardButtons[0]);
        fireEvent.click(selectCardButtons[1]);
        const actionsButton = screen.getByText(messages.actionsButtonLabel.defaultMessage);
        expect(actionsButton).toBeVisible();

        await waitFor(() => {
          fireEvent.click(actionsButton);
        });
        axiosMock.onGet(`${getVideosUrl(courseId)}/mOckID1`).reply(200, { download_link: 'http://download.org' });
        axiosMock.onGet(`${getVideosUrl(courseId)}/mOckID5`).reply(200, { download_link: 'http://download.org' });

        const downloadButton = screen.getByText(messages.downloadTitle.defaultMessage).closest('a');
        expect(downloadButton).not.toHaveClass('disabled');

        await act(async () => {
          fireEvent.click(downloadButton);
        });

        const updateStatus = store.getState().videos.updatingStatus;
        expect(updateStatus).toEqual(RequestStatus.SUCCESSFUL);
      });

      it('sort button should be enabled and sort files by name', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        const sortsButton = screen.getByText(messages.sortButtonLabel.defaultMessage);
        expect(sortsButton).toBeVisible();

        await waitFor(() => {
          fireEvent.click(sortsButton);
          expect(screen.getByText(messages.sortModalTitleLabel.defaultMessage)).toBeVisible();
        });

        const sortNameAscendingButton = screen.getByText(messages.sortByNameAscending.defaultMessage);
        fireEvent.click(sortNameAscendingButton);
        fireEvent.click(screen.getByText(messages.applySortButton.defaultMessage));
        expect(screen.queryByText(messages.sortModalTitleLabel.defaultMessage)).toBeNull();
      });

      it('sort button should be enabled and sort files by file size', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        const sortsButton = screen.getByText(messages.sortButtonLabel.defaultMessage);
        expect(sortsButton).toBeVisible();

        await waitFor(() => {
          fireEvent.click(sortsButton);
          expect(screen.getByText(messages.sortModalTitleLabel.defaultMessage)).toBeVisible();
        });

        const sortBySizeDescendingButton = screen.getByText(messages.sortBySizeDescending.defaultMessage);
        fireEvent.click(sortBySizeDescendingButton);
        fireEvent.click(screen.getByText(messages.applySortButton.defaultMessage));
        expect(screen.queryByText(messages.sortModalTitleLabel.defaultMessage)).toBeNull();
      });
    });

    describe('card menu actions', () => {
      it('should open video info', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();

        const videoMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');
        expect(videoMenuButton).toBeVisible();

        axiosMock.onGet(`${getVideosUrl(courseId)}/mOckID1/usage`)
          .reply(201, { usageLocations: ['subsection - unit / block'] });
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
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();
        const videoMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');
        expect(videoMenuButton).toBeVisible();

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
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();
        const videoMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');
        expect(videoMenuButton).toBeVisible();

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

      it('download button should download file', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();

        const videoMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');
        expect(videoMenuButton).toBeVisible();

        axiosMock.onGet(`${getVideosUrl(courseId)}/mOckID1`).reply(200, { download_link: 'test' });
        await waitFor(() => {
          fireEvent.click(within(videoMenuButton).getByLabelText('file-menu-toggle'));
          fireEvent.click(screen.getByText('Download'));
        });

        const updateStatus = store.getState().videos.updatingStatus;

        expect(updateStatus).toEqual(RequestStatus.SUCCESSFUL);
      });

      it('delete button should delete file', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();

        const fileMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');
        expect(fileMenuButton).toBeVisible();

        await waitFor(() => {
          axiosMock.onDelete(`${getCoursVideosApiUrl(courseId)}/mOckID1`).reply(204);
          fireEvent.click(within(fileMenuButton).getByLabelText('file-menu-toggle'));
          fireEvent.click(screen.getByTestId('open-delete-confirmation-button'));
          expect(screen.getByText(messages.deleteConfirmationTitle.defaultMessage)).toBeVisible();

          fireEvent.click(screen.getByText(messages.deleteFileButtonLabel.defaultMessage));
          expect(screen.queryByText(messages.deleteConfirmationTitle.defaultMessage)).toBeNull();

          executeThunk(deleteVideoFile(courseId, 'mOckID1', 5), store.dispatch);
        });
        const deleteStatus = store.getState().videos.deletingStatus;
        expect(deleteStatus).toEqual(RequestStatus.SUCCESSFUL);

        expect(screen.queryByTestId('grid-card-mOckID1')).toBeNull();
      });
    });

    describe('api errors', () => {
      it('invalid file size should show error', async () => {
        const errorMessage = 'File download.png exceeds maximum size of 5 GB.';
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        axiosMock.onPost(getCoursVideosApiUrl(courseId)).reply(413, { error: errorMessage });
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
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        axiosMock.onPost(getCoursVideosApiUrl(courseId)).reply(404);
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
        renderComponent();
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
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        const mockResponseData = { status: '404', ok: false, blob: () => 'Data' };
        const mockFetchResponse = Promise.reject(mockResponseData);
        global.fetch = jest.fn().mockImplementation(() => mockFetchResponse);

        axiosMock.onPost(getCoursVideosApiUrl(courseId)).reply(204, generateNewVideoApiResponse());
        axiosMock.onGet(getCoursVideosApiUrl(courseId)).reply(200, generateAddVideoApiResponse());
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
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();

        const videoMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');
        expect(videoMenuButton).toBeVisible();

        await waitFor(() => {
          axiosMock.onDelete(`${getCoursVideosApiUrl(courseId)}/mOckID1`).reply(404);
          fireEvent.click(within(videoMenuButton).getByLabelText('file-menu-toggle'));
          fireEvent.click(screen.getByTestId('open-delete-confirmation-button'));
          expect(screen.getByText(messages.deleteConfirmationTitle.defaultMessage)).toBeVisible();

          fireEvent.click(screen.getByText(messages.deleteFileButtonLabel.defaultMessage));
          expect(screen.queryByText(messages.deleteConfirmationTitle.defaultMessage)).toBeNull();

          executeThunk(deleteVideoFile(courseId, 'mOckID1', 5), store.dispatch);
        });
        const deleteStatus = store.getState().videos.deletingStatus;
        expect(deleteStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();

        expect(screen.getByText('Error')).toBeVisible();
      });

      it('404 usage path fetch should show error', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        expect(screen.getByTestId('grid-card-mOckID3')).toBeVisible();

        const videoMenuButton = screen.getByTestId('file-menu-dropdown-mOckID3');
        expect(videoMenuButton).toBeVisible();

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

      it('multiple asset file fetch failure should show error', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        const selectCardButtons = screen.getAllByTestId('datatable-select-column-checkbox-cell');
        fireEvent.click(selectCardButtons[0]);
        fireEvent.click(selectCardButtons[1]);
        const actionsButton = screen.getByText(messages.actionsButtonLabel.defaultMessage);
        expect(actionsButton).toBeVisible();

        await waitFor(() => {
          fireEvent.click(actionsButton);
        });
        const downloadButton = screen.getByText(messages.downloadTitle.defaultMessage).closest('a');
        expect(downloadButton).not.toHaveClass('disabled');

        axiosMock.onGet(`${getVideosUrl(courseId)}/mOckID1`).reply(404);
        await waitFor(() => {
          fireEvent.click(downloadButton);
        });

        const updateStatus = store.getState().videos.updatingStatus;
        expect(updateStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getByText('Error')).toBeVisible();
      });
    });
  });
});
