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
import { saveAs } from 'file-saver';

import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import initializeStore from '../store';
import { executeThunk } from '../utils';
import { RequestStatus } from '../data/constants';
import FilesAndUploads from './FilesAndUploads';
import {
  generateFetchAssetApiResponse,
  generateEmptyApiResponse,
  generateNewAssetApiResponse,
  getStatusValue,
  courseId,
  initialState,
} from './factories/mockApiResponses';

import {
  fetchAssets,
  addAssetFile,
  deleteAssetFile,
  updateAssetLock,
  getUsagePaths,
} from './data/thunks';
import { getAssetsUrl } from './data/api';
import messages from './messages';

let axiosMock;
let store;
let file;
ReactDOM.createPortal = jest.fn(node => node);
jest.mock('file-saver');

const renderComponent = () => {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <FilesAndUploads courseId={courseId} />
      </AppProvider>
    </IntlProvider>,
  );
};

const mockStore = async (
  status,
) => {
  const fetchAssetsUrl = `${getAssetsUrl(courseId)}?page_size=50`;
  axiosMock.onGet(fetchAssetsUrl).reply(getStatusValue(status), generateFetchAssetApiResponse());
  await executeThunk(fetchAssets(courseId), store.dispatch);
};

const emptyMockStore = async (status) => {
  const fetchAssetsUrl = getAssetsUrl(courseId);
  axiosMock.onGet(fetchAssetsUrl).reply(getStatusValue(status), generateEmptyApiResponse());
  await executeThunk(fetchAssets(courseId), store.dispatch);
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
        assets: {
          ...initialState.assets,
          assetIds: [],
        },
        models: {},
      });
      axiosMock = new MockAdapter(getAuthenticatedHttpClient());
      file = new File(['(⌐□_□)'], 'download.png', { type: 'image/png' });
    });

    it('should return placeholder component', async () => {
      renderComponent();
      await mockStore(RequestStatus.DENIED);
      expect(screen.getByTestId('under-construction-placeholder')).toBeVisible();
    });

    it('should have Files title', async () => {
      renderComponent();
      await emptyMockStore(RequestStatus.SUCCESSFUL);
      expect(screen.getByText('Files')).toBeVisible();
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
        axiosMock.onPost(getAssetsUrl(courseId)).reply(204, generateNewAssetApiResponse());
        Object.defineProperty(dropzone, 'files', {
          value: [file],
        });
        fireEvent.drop(dropzone);
        await executeThunk(addAssetFile(courseId, file, 0), store.dispatch);
      });
      const addStatus = store.getState().assets.addingStatus;
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

    afterEach(() => {
      saveAs.mockClear();
    });

    describe('table view', () => {
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
    });

    describe('table actions', () => {
      it('should upload a single file', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        axiosMock.onPost(getAssetsUrl(courseId)).reply(200, generateNewAssetApiResponse());
        const addFilesButton = screen.getByLabelText('file-input');
        await act(async () => {
          userEvent.upload(addFilesButton, file);
          await executeThunk(addAssetFile(courseId, file, 1), store.dispatch);
        });
        const addStatus = store.getState().assets.addingStatus;
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

        axiosMock.onDelete(`${getAssetsUrl(courseId)}mOckID1`).reply(204);

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

        // Check if the asset is deleted in the store and UI
        const deleteStatus = store.getState().assets.deletingStatus;
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

        fireEvent.click(downloadButton);
        expect(saveAs).toHaveBeenCalled();
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
        const mockResponseData = { ok: true, blob: () => 'Data' };
        const mockFetchResponse = Promise.resolve(mockResponseData);
        const downloadButton = screen.getByText(messages.downloadTitle.defaultMessage).closest('a');
        expect(downloadButton).not.toHaveClass('disabled');

        global.fetch = jest.fn().mockImplementation(() => mockFetchResponse);
        fireEvent.click(downloadButton);
        expect(fetch).toHaveBeenCalledTimes(2);
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
      it('should open asset info', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();

        const assetMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');
        expect(assetMenuButton).toBeVisible();

        axiosMock.onGet(`${getAssetsUrl(courseId)}mOckID1/usage`).reply(201, { usageLocations: ['subsection - unit / block'] });
        await waitFor(() => {
          fireEvent.click(within(assetMenuButton).getByLabelText('asset-menu-toggle'));
          fireEvent.click(screen.getByText('Info'));
          executeThunk(getUsagePaths({
            courseId,
            asset: { id: 'mOckID1', displayName: 'mOckID1' },
            setSelectedRows: jest.fn(),
          }), store.dispatch);
          expect(screen.getAllByLabelText('mOckID1')[0]).toBeVisible();
        });

        const { usageStatus } = store.getState().assets;
        expect(usageStatus).toEqual(RequestStatus.SUCCESSFUL);
        expect(screen.getByText('subsection - unit / block')).toBeVisible();
      });

      it('should open asset info and handle lock checkbox', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();
        const assetMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');
        expect(assetMenuButton).toBeVisible();

        axiosMock.onPut(`${getAssetsUrl(courseId)}mOckID1`).reply(201, { locked: false });
        axiosMock.onGet(`${getAssetsUrl(courseId)}mOckID1/usage`).reply(201, { usageLocations: [] });
        await waitFor(() => {
          fireEvent.click(within(assetMenuButton).getByLabelText('asset-menu-toggle'));
          fireEvent.click(screen.getByText('Info'));
          executeThunk(getUsagePaths({
            courseId,
            asset: { id: 'mOckID1', displayName: 'mOckID1' },
            setSelectedRows: jest.fn(),
          }), store.dispatch);
          expect(screen.getAllByLabelText('mOckID1')[0]).toBeVisible();

          fireEvent.click(screen.getByLabelText('Checkbox'));
          executeThunk(updateAssetLock({
            courseId,
            assetId: 'mOckID1',
            locked: false,
          }), store.dispatch);
        });
        expect(screen.getByText(messages.usageNotInUseMessage.defaultMessage)).toBeVisible();

        const updateStatus = store.getState().assets.updatingStatus;
        expect(updateStatus).toEqual(RequestStatus.SUCCESSFUL);
      });

      it('should unlock asset', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();

        const assetMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');
        expect(assetMenuButton).toBeVisible();

        await waitFor(() => {
          axiosMock.onPut(`${getAssetsUrl(courseId)}mOckID1`).reply(201, { locked: false });
          fireEvent.click(within(assetMenuButton).getByLabelText('asset-menu-toggle'));
          fireEvent.click(screen.getByText('Unlock'));
          executeThunk(updateAssetLock({
            courseId,
            assetId: 'mOckID1',
            locked: false,
          }), store.dispatch);
        });
        const updateStatus = store.getState().assets.updatingStatus;
        expect(updateStatus).toEqual(RequestStatus.SUCCESSFUL);
      });

      it('should lock asset', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        expect(screen.getByTestId('grid-card-mOckID3')).toBeVisible();

        const assetMenuButton = screen.getByTestId('file-menu-dropdown-mOckID3');
        expect(assetMenuButton).toBeVisible();

        await waitFor(() => {
          axiosMock.onPut(`${getAssetsUrl(courseId)}mOckID3`).reply(201, { locked: true });
          fireEvent.click(within(assetMenuButton).getByLabelText('asset-menu-toggle'));
          fireEvent.click(screen.getByText('Lock'));
          executeThunk(updateAssetLock({
            courseId,
            assetId: 'mOckID3',
            locked: true,
          }), store.dispatch);
        });
        const updateStatus = store.getState().assets.updatingStatus;
        expect(updateStatus).toEqual(RequestStatus.SUCCESSFUL);
      });

      it('download button should download file', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();

        const assetMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');
        expect(assetMenuButton).toBeVisible();

        await waitFor(() => {
          fireEvent.click(within(assetMenuButton).getByLabelText('asset-menu-toggle'));
          fireEvent.click(screen.getByText('Download'));
        });
        expect(saveAs).toHaveBeenCalled();
      });

      it('delete button should delete file', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();

        const assetMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');
        expect(assetMenuButton).toBeVisible();

        await waitFor(() => {
          axiosMock.onDelete(`${getAssetsUrl(courseId)}mOckID1`).reply(204);
          fireEvent.click(within(assetMenuButton).getByLabelText('asset-menu-toggle'));
          fireEvent.click(screen.getByTestId('open-delete-confirmation-button'));
          expect(screen.getByText(messages.deleteConfirmationTitle.defaultMessage)).toBeVisible();

          fireEvent.click(screen.getByText(messages.deleteFileButtonLabel.defaultMessage));
          expect(screen.queryByText(messages.deleteConfirmationTitle.defaultMessage)).toBeNull();

          executeThunk(deleteAssetFile(courseId, 'mOckID1', 5), store.dispatch);
        });
        const deleteStatus = store.getState().assets.deletingStatus;
        expect(deleteStatus).toEqual(RequestStatus.SUCCESSFUL);

        expect(screen.queryByTestId('grid-card-mOckID1')).toBeNull();
      });
    });

    describe('api errors', () => {
      it('invalid file size should show error', async () => {
        const errorMessage = 'File download.png exceeds maximum size of 20 MB.';
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        axiosMock.onPost(getAssetsUrl(courseId)).reply(413, { error: errorMessage });
        const addFilesButton = screen.getByLabelText('file-input');
        await act(async () => {
          userEvent.upload(addFilesButton, file);
          await executeThunk(addAssetFile(courseId, file, 1), store.dispatch);
        });
        const addStatus = store.getState().assets.addingStatus;
        expect(addStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getByText('Error')).toBeVisible();
      });

      it('404 upload should show error', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        axiosMock.onPost(getAssetsUrl(courseId)).reply(404);
        const addFilesButton = screen.getByLabelText('file-input');
        await act(async () => {
          userEvent.upload(addFilesButton, file);
          await executeThunk(addAssetFile(courseId, file, 1), store.dispatch);
        });
        const addStatus = store.getState().assets.addingStatus;
        expect(addStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getByText('Error')).toBeVisible();
      });

      it('404 delete should show error', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();

        const assetMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');
        expect(assetMenuButton).toBeVisible();

        await waitFor(() => {
          axiosMock.onDelete(`${getAssetsUrl(courseId)}mOckID1`).reply(404);
          fireEvent.click(within(assetMenuButton).getByLabelText('asset-menu-toggle'));
          fireEvent.click(screen.getByTestId('open-delete-confirmation-button'));
          expect(screen.getByText(messages.deleteConfirmationTitle.defaultMessage)).toBeVisible();

          fireEvent.click(screen.getByText(messages.deleteFileButtonLabel.defaultMessage));
          expect(screen.queryByText(messages.deleteConfirmationTitle.defaultMessage)).toBeNull();

          executeThunk(deleteAssetFile(courseId, 'mOckID1', 5), store.dispatch);
        });
        const deleteStatus = store.getState().assets.deletingStatus;
        expect(deleteStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();

        expect(screen.getByText('Error')).toBeVisible();
      });

      it('404 usage path fetch should show error', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        expect(screen.getByTestId('grid-card-mOckID3')).toBeVisible();

        const assetMenuButton = screen.getByTestId('file-menu-dropdown-mOckID3');
        expect(assetMenuButton).toBeVisible();

        axiosMock.onGet(`${getAssetsUrl(courseId)}mOckID3/usage`).reply(404);
        await waitFor(() => {
          fireEvent.click(within(assetMenuButton).getByLabelText('asset-menu-toggle'));
          fireEvent.click(screen.getByText('Info'));
          executeThunk(getUsagePaths({
            courseId,
            asset: { id: 'mOckID3', displayName: 'mOckID3' },
            setSelectedRows: jest.fn(),
          }), store.dispatch);
        });
        const { usageStatus } = store.getState().assets;
        expect(usageStatus).toEqual(RequestStatus.FAILED);
      });

      it('404 lock update should show error', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        expect(screen.getByTestId('grid-card-mOckID3')).toBeVisible();

        const assetMenuButton = screen.getByTestId('file-menu-dropdown-mOckID3');
        expect(assetMenuButton).toBeVisible();

        await waitFor(() => {
          axiosMock.onPut(`${getAssetsUrl(courseId)}mOckID3`).reply(404);
          fireEvent.click(within(assetMenuButton).getByLabelText('asset-menu-toggle'));
          fireEvent.click(screen.getByText('Lock'));
          executeThunk(updateAssetLock({
            courseId,
            assetId: 'mOckID3',
            locked: true,
          }), store.dispatch);
        });
        const updateStatus = store.getState().assets.updatingStatus;
        expect(updateStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getByText('Error')).toBeVisible();
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
        const mockResponseData = { ok: false };
        const mockFetchResponse = Promise.resolve(mockResponseData);
        const downloadButton = screen.getByText(messages.downloadTitle.defaultMessage).closest('a');
        expect(downloadButton).not.toHaveClass('disabled');

        global.fetch = jest.fn().mockImplementation(() => mockFetchResponse);
        await waitFor(() => {
          fireEvent.click(downloadButton);
          expect(fetch).toHaveBeenCalledTimes(2);
        });

        const updateStatus = store.getState().assets.updatingStatus;
        expect(updateStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getByText('Error')).toBeVisible();
      });
    });
  });
});
