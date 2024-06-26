import {
  render,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReactDOM from 'react-dom';
import { saveAs } from 'file-saver';

import { camelCaseObject, initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import initializeStore from '../../store';
import { executeThunk } from '../../utils';
import { RequestStatus } from '../../data/constants';
import FilesPage from './FilesPage';
import {
  generateFetchAssetApiResponse,
  generateEmptyApiResponse,
  generateNewAssetApiResponse,
  getStatusValue,
  courseId,
  initialState,
  generateNextPageResponse,
} from './factories/mockApiResponses';

import {
  fetchAssets,
  addAssetFile,
  deleteAssetFile,
  updateAssetLock,
  getUsagePaths,
  validateAssetFiles,
} from './data/thunks';
import { getAssetsUrl } from './data/api';
import messages from '../generic/messages';
import filesPageMessages from './messages';
import { updateFileValues } from './data/utils';

let axiosMock;
let store;
let file;
ReactDOM.createPortal = jest.fn(node => node);
jest.mock('file-saver');

const renderComponent = () => {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <FilesPage courseId={courseId} />
      </AppProvider>
    </IntlProvider>,
  );
};

const mockStore = async (
  status,
  skipNextPageFetch,
) => {
  const fetchAssetsUrl = `${getAssetsUrl(courseId)}?page=0`;
  axiosMock.onGet(fetchAssetsUrl).reply(getStatusValue(status), generateFetchAssetApiResponse());
  if (!skipNextPageFetch) {
    const nextPageUrl = `${getAssetsUrl(courseId)}?page=1`;
    axiosMock.onGet(nextPageUrl).reply(getStatusValue(status), generateNextPageResponse());
  }
  renderComponent();
  await executeThunk(fetchAssets(courseId), store.dispatch);

  // Finish loading the expected files into the data table before returning,
  // because loading new files can disrupt things like accessing file menus.
  if (status === RequestStatus.SUCCESSFUL) {
    const numFiles = skipNextPageFetch ? 13 : 15;
    await waitFor(() => {
      expect(screen.getByText(`Showing ${numFiles} of ${numFiles}`)).toBeInTheDocument();
    });
  }
};

const emptyMockStore = async (status) => {
  const fetchAssetsUrl = `${getAssetsUrl(courseId)}?page=0`;
  axiosMock.onGet(fetchAssetsUrl).reply(getStatusValue(status), generateEmptyApiResponse());
  renderComponent();
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
      await mockStore(RequestStatus.DENIED);

      expect(screen.getByTestId('under-construction-placeholder')).toBeVisible();
    });

    it('should have Files title', async () => {
      await emptyMockStore(RequestStatus.SUCCESSFUL);

      expect(screen.getByText('Files')).toBeVisible();
    });

    it('should render dropzone', async () => {
      await emptyMockStore(RequestStatus.SUCCESSFUL);

      expect(screen.getByTestId('files-dropzone')).toBeVisible();

      expect(screen.queryByTestId('files-data-table')).toBeNull();
    });

    it('should upload a single file', async () => {
      await emptyMockStore(RequestStatus.SUCCESSFUL);
      const dropzone = screen.getByTestId('files-dropzone');
      axiosMock.onGet(`${getAssetsUrl(courseId)}?display_name=download.png&page_size=1`).reply(200, { assets: [] });
      axiosMock.onPost(getAssetsUrl(courseId)).reply(204, generateNewAssetApiResponse());
      Object.defineProperty(dropzone, 'files', {
        value: [file],
      });
      fireEvent.drop(dropzone);
      await executeThunk(validateAssetFiles(courseId, [file]), store.dispatch);
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
        await mockStore(RequestStatus.SUCCESSFUL);

        expect(screen.getByTestId('files-data-table')).toBeVisible();

        await waitFor(() => {
          expect(screen.getAllByTestId('grid-card-mOckID1')[0]).toBeVisible();
        });
      });

      it('should switch table to list view', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        expect(screen.getByTestId('files-data-table')).toBeVisible();

        await waitFor(() => {
          expect(screen.getAllByTestId('grid-card-mOckID1')[0]).toBeVisible();
        });

        expect(screen.queryByRole('table')).toBeNull();

        const listButton = screen.getByLabelText('List');
        fireEvent.click(listButton);
        expect(screen.queryByTestId('grid-card-mOckID1')).toBeNull();

        expect(screen.getByRole('table')).toBeVisible();
      });
    });

    describe('table actions', () => {
      describe('upload a single file', () => {
        it('should upload without duplication modal', async () => {
          await mockStore(RequestStatus.SUCCESSFUL);
          axiosMock.onGet(`${getAssetsUrl(courseId)}?display_name=download.png&page_size=1`).reply(200, { assets: [] });
          axiosMock.onPost(getAssetsUrl(courseId)).reply(200, generateNewAssetApiResponse());
          const addFilesButton = screen.getByLabelText('file-input');
          userEvent.upload(addFilesButton, file);
          await executeThunk(validateAssetFiles(courseId, [file]), store.dispatch);
          await waitFor(() => {
            const addStatus = store.getState().assets.addingStatus;
            expect(addStatus).toEqual(RequestStatus.SUCCESSFUL);
          });
        });

        it('should show duplicate file modal', async () => {
          file = new File(['(⌐□_□)'], 'mOckID6', { type: 'image/png' });

          await mockStore(RequestStatus.SUCCESSFUL);
          axiosMock.onGet(
            `${getAssetsUrl(courseId)}?display_name=mOckID6&page_size=1`,
          ).reply(200, { assets: [{ display_name: 'mOckID6' }] });
          const addFilesButton = screen.getByLabelText('file-input');
          userEvent.upload(addFilesButton, file);
          await executeThunk(validateAssetFiles(courseId, [file]), store.dispatch);
          expect(screen.getByText(filesPageMessages.overwriteConfirmMessage.defaultMessage)).toBeVisible();
        });

        it('should overwrite duplicate file', async () => {
          file = new File(['(⌐□_□)'], 'mOckID6', { type: 'image/png' });

          await mockStore(RequestStatus.SUCCESSFUL);
          axiosMock.onGet(
            `${getAssetsUrl(courseId)}?display_name=mOckID6&page_size=1`,
          ).reply(200, { assets: [{ display_name: 'mOckID6' }] });
          const { asset: newDefaultAssetResponse } = generateNewAssetApiResponse();
          const responseData = {
            asset: {
              ...newDefaultAssetResponse, id: 'mOckID6',
            },
          };

          axiosMock.onPost(getAssetsUrl(courseId)).reply(200, responseData);
          const addFilesButton = screen.getByLabelText('file-input');
          userEvent.upload(addFilesButton, file);
          await executeThunk(validateAssetFiles(courseId, [file]), store.dispatch);

          const overwriteButton = screen.getByText(filesPageMessages.confirmOverwriteButtonLabel.defaultMessage);
          fireEvent.click(overwriteButton);

          expect(screen.queryByText(filesPageMessages.overwriteConfirmMessage.defaultMessage)).toBeNull();
          await waitFor(() => {
            const assetData = store.getState().models.assets.mOckID6;
            const { asset: responseAssetData } = responseData;
            const [defaultData] = updateFileValues([camelCaseObject(responseAssetData)]);

            expect(assetData).toEqual(defaultData);
          });
        });

        it('should keep original file', async () => {
          file = new File(['(⌐□_□)'], 'mOckID6', { type: 'image/png' });

          await mockStore(RequestStatus.SUCCESSFUL);
          axiosMock.onGet(
            `${getAssetsUrl(courseId)}?display_name=mOckID6&page_size=1`,
          ).reply(200, { assets: [{ display_name: 'mOckID6' }] });
          const addFilesButton = screen.getByLabelText('file-input');
          userEvent.upload(addFilesButton, file);
          await executeThunk(validateAssetFiles(courseId, [file]), store.dispatch);

          const cancelButton = screen.getByText(filesPageMessages.cancelOverwriteButtonLabel.defaultMessage);
          fireEvent.click(cancelButton);

          const assetData = store.getState().models.assets.mOckID6;
          const defaultAssets = generateFetchAssetApiResponse().assets;
          const [defaultData] = updateFileValues([defaultAssets[4]]);

          expect(screen.queryByText(filesPageMessages.overwriteConfirmMessage.defaultMessage)).toBeNull();
          expect(assetData).toEqual(defaultData);
        });
      });

      it('should have disabled action buttons', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);

        const actionsButton = await screen.getByText(messages.actionsButtonLabel.defaultMessage);
        fireEvent.click(actionsButton);
        expect(screen.getByText(messages.downloadTitle.defaultMessage).closest('a')).toHaveClass('disabled');

        expect(screen.getByText(messages.deleteTitle.defaultMessage).closest('a')).toHaveClass('disabled');
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

        axiosMock.onDelete(`${getAssetsUrl(courseId)}mOckID1`).reply(204);

        fireEvent.click(deleteButton);
        expect(screen.getByText('Delete mOckID1')).toBeVisible();
        fireEvent.click(deleteButton);

        // Wait for the delete confirmation button to appear
        const confirmDeleteButton = await screen.findByRole('button', {
          name: messages.deleteFileButtonLabel.defaultMessage,
        });
        fireEvent.click(confirmDeleteButton);

        expect(screen.queryByText('Delete mOckID1')).toBeNull();

        // Check if the asset is deleted in the store and UI
        await waitFor(() => {
          const deleteStatus = store.getState().assets.deletingStatus;
          expect(deleteStatus).toEqual(RequestStatus.SUCCESSFUL);
        });
        expect(screen.queryByTestId('grid-card-mOckID1')).toBeNull();
      });

      it('download button should be enabled and download single selected file', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        const selectCardButton = screen.getAllByTestId('datatable-select-column-checkbox-cell')[0];
        fireEvent.click(selectCardButton);
        const actionsButton = screen.getByText(messages.actionsButtonLabel.defaultMessage);
        expect(actionsButton).toBeVisible();

        fireEvent.click(actionsButton);
        const downloadButton = screen.getByText(messages.downloadTitle.defaultMessage).closest('a');
        expect(downloadButton).not.toHaveClass('disabled');

        fireEvent.click(downloadButton);
        expect(saveAs).toHaveBeenCalled();
      });

      it('download button should be enabled and download multiple selected files', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        const selectCardButtons = screen.getAllByTestId('datatable-select-column-checkbox-cell');
        fireEvent.click(selectCardButtons[0]);
        fireEvent.click(selectCardButtons[1]);
        const actionsButton = screen.getByText(messages.actionsButtonLabel.defaultMessage);
        expect(actionsButton).toBeVisible();

        fireEvent.click(actionsButton);
        const mockResponseData = { ok: true, blob: () => 'Data' };
        const mockFetchResponse = Promise.resolve(mockResponseData);
        const downloadButton = screen.getByText(messages.downloadTitle.defaultMessage).closest('a');
        expect(downloadButton).not.toHaveClass('disabled');

        global.fetch = jest.fn().mockImplementation(() => mockFetchResponse);
        fireEvent.click(downloadButton);
        expect(fetch).toHaveBeenCalledTimes(2);
      });

      it('sort button should be enabled and sort files by name', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        const sortsButton = screen.getByText(messages.sortButtonLabel.defaultMessage);
        expect(sortsButton).toBeVisible();

        fireEvent.click(sortsButton);
        await waitFor(() => {
          expect(screen.getByText(messages.sortModalTitleLabel.defaultMessage)).toBeVisible();
        });

        const sortNameAscendingButton = screen.getByText(messages.sortByNameAscending.defaultMessage);
        fireEvent.click(sortNameAscendingButton);

        fireEvent.click(screen.getByText(messages.applySortButton.defaultMessage));
        await waitFor(() => {
          expect(screen.queryByText(messages.sortModalTitleLabel.defaultMessage)).toBeNull();
        });
      });

      it('sort button should be enabled and sort files by file size', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        const sortsButton = screen.getByText(messages.sortButtonLabel.defaultMessage);
        expect(sortsButton).toBeVisible();

        fireEvent.click(sortsButton);
        await waitFor(() => {
          expect(screen.getByText(messages.sortModalTitleLabel.defaultMessage)).toBeVisible();
        });

        const sortBySizeDescendingButton = screen.getByText(messages.sortBySizeDescending.defaultMessage);
        fireEvent.click(sortBySizeDescendingButton);

        fireEvent.click(screen.getByText(messages.applySortButton.defaultMessage));
        await waitFor(() => {
          expect(screen.queryByText(messages.sortModalTitleLabel.defaultMessage)).toBeNull();
        });
      });
    });

    describe('card menu actions', () => {
      it('should open asset info', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);

        const [assetMenuButton] = await screen.getAllByTestId('file-menu-dropdown-mOckID1');

        axiosMock.onGet(`${getAssetsUrl(courseId)}mOckID1/usage`)
          .reply(201, {
            usage_locations: {
              mOckID1: [{
                display_location: 'subsection - unit / block',
                url: 'base/unit_id#block_id',
              }],
            },
          });
        fireEvent.click(within(assetMenuButton).getByLabelText('file-menu-toggle'));
        fireEvent.click(screen.getByText('Info'));

        await executeThunk(getUsagePaths({
          courseId,
          asset: { id: 'mOckID1', displayName: 'mOckID1' },
          setSelectedRows: jest.fn(),
        }), store.dispatch);
        await waitFor(() => {
          expect(screen.getAllByLabelText('mOckID1')[0]).toBeVisible();
        });

        const { usageStatus } = store.getState().assets;
        expect(usageStatus).toEqual(RequestStatus.SUCCESSFUL);
        expect(screen.getByText('subsection - unit / block')).toBeVisible();
      });

      it('should open asset info and handle lock checkbox', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        const assetMenuButton = screen.getAllByTestId('file-menu-dropdown-mOckID1')[0];

        axiosMock.onPut(`${getAssetsUrl(courseId)}mOckID1`).reply(201, { locked: false });
        axiosMock.onGet(`${getAssetsUrl(courseId)}mOckID1/usage`).reply(201, { usage_locations: { mOckID1: [] } });
        fireEvent.click(within(assetMenuButton).getByLabelText('file-menu-toggle'));
        fireEvent.click(screen.getByText('Info'));
        await executeThunk(getUsagePaths({
          courseId,
          asset: { id: 'mOckID1', displayName: 'mOckID1' },
          setSelectedRows: jest.fn(),
        }), store.dispatch);
        await waitFor(() => {
          expect(screen.getAllByLabelText('mOckID1')[0]).toBeVisible();
        });

        fireEvent.click(screen.getByLabelText('Checkbox'));
        await executeThunk(updateAssetLock({
          courseId,
          assetId: 'mOckID1',
          locked: false,
        }), store.dispatch);
        expect(screen.getByText(messages.usageNotInUseMessage.defaultMessage)).toBeVisible();

        const updateStatus = store.getState().assets.updatingStatus;
        expect(updateStatus).toEqual(RequestStatus.SUCCESSFUL);
      });

      it('should unlock asset', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);

        const assetMenuButton = screen.getAllByTestId('file-menu-dropdown-mOckID1')[0];

        axiosMock.onPut(`${getAssetsUrl(courseId)}mOckID1`).reply(201, { locked: false });
        fireEvent.click(within(assetMenuButton).getByLabelText('file-menu-toggle'));
        fireEvent.click(await screen.getByText('Unlock'));
        await executeThunk(updateAssetLock({
          courseId,
          assetId: 'mOckID1',
          locked: false,
        }), store.dispatch);
        await waitFor(() => {
          const updateStatus = store.getState().assets.updatingStatus;
          expect(updateStatus).toEqual(RequestStatus.SUCCESSFUL);
        });
      });

      it('should lock asset', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);

        const assetMenuButton = screen.getAllByTestId('file-menu-dropdown-mOckID3')[0];

        axiosMock.onPut(`${getAssetsUrl(courseId)}mOckID3`).reply(201, { locked: true });
        fireEvent.click(within(assetMenuButton).getByLabelText('file-menu-toggle'));
        fireEvent.click(await screen.getByText('Lock'));
        await executeThunk(updateAssetLock({
          courseId,
          assetId: 'mOckID3',
          locked: true,
        }), store.dispatch);
        await waitFor(() => {
          const updateStatus = store.getState().assets.updatingStatus;
          expect(updateStatus).toEqual(RequestStatus.SUCCESSFUL);
        });
      });

      it('download button should download file', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);

        const assetMenuButton = screen.getAllByTestId('file-menu-dropdown-mOckID1')[0];

        fireEvent.click(within(assetMenuButton).getByLabelText('file-menu-toggle'));
        fireEvent.click(screen.getByText('Download'));
        expect(saveAs).toHaveBeenCalled();
      });

      it('delete button should delete file', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);

        const assetMenuButton = screen.getAllByTestId('file-menu-dropdown-mOckID1')[0];

        axiosMock.onDelete(`${getAssetsUrl(courseId)}mOckID1`).reply(204);
        fireEvent.click(within(assetMenuButton).getByLabelText('file-menu-toggle'));
        const confirmDelete = await screen.getByTestId('open-delete-confirmation-button');
        fireEvent.click(confirmDelete);
        await waitFor(() => {
          expect(screen.getByText('Delete mOckID1')).toBeVisible();
        });

        fireEvent.click(screen.getByText(messages.deleteFileButtonLabel.defaultMessage));
        await waitFor(() => {
          expect(screen.queryByText('Delete mOckID1')).toBeNull();
        });
        await executeThunk(deleteAssetFile(courseId, 'mOckID1', 5), store.dispatch);
        const deleteStatus = store.getState().assets.deletingStatus;
        expect(deleteStatus).toEqual(RequestStatus.SUCCESSFUL);

        expect(screen.queryByTestId('grid-card-mOckID1')).toBeNull();
      });
    });

    describe('api errors', () => {
      it('404 intitial fetch should show error', async () => {
        await mockStore(RequestStatus.FAILED);
        const { loadingStatus } = store.getState().assets;
        expect(screen.getByText('Error')).toBeVisible();

        expect(loadingStatus).toEqual(RequestStatus.FAILED);
        expect(screen.getByText('Failed to load all files.')).toBeVisible();
      });

      it('404 intitial fetch should show error', async () => {
        await mockStore(RequestStatus.SUCCESSFUL, true);
        const { loadingStatus } = store.getState().assets;
        expect(screen.getByText('Error')).toBeVisible();

        expect(loadingStatus).toEqual(RequestStatus.PARTIAL_FAILURE);
        expect(screen.getByText('Failed to load remaining files.')).toBeVisible();
      });

      it('invalid file size should show error', async () => {
        const errorMessage = 'File download.png exceeds maximum size of 20 MB.';
        await mockStore(RequestStatus.SUCCESSFUL);
        axiosMock.onGet(`${getAssetsUrl(courseId)}?display_name=download.png&page_size=1`).reply(200, { assets: [] });
        axiosMock.onPost(getAssetsUrl(courseId)).reply(413, { error: errorMessage });
        const addFilesButton = screen.getByLabelText('file-input');
        userEvent.upload(addFilesButton, file);
        await waitFor(() => {
          const addStatus = store.getState().assets.addingStatus;
          expect(addStatus).toEqual(RequestStatus.FAILED);
        });

        expect(screen.getByText('Upload error')).toBeVisible();
      });

      it('404 validation should show error', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        axiosMock.onGet(`${getAssetsUrl(courseId)}?display_name=download.png&page_size=1`).reply(404);
        const addFilesButton = screen.getByLabelText('file-input');
        userEvent.upload(addFilesButton, file);
        await executeThunk(addAssetFile(courseId, file, 1), store.dispatch);
        const addStatus = store.getState().assets.addingStatus;
        expect(addStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getByText('Upload error')).toBeVisible();
      });

      it('404 upload should show error', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        axiosMock.onGet(`${getAssetsUrl(courseId)}?display_name=download.png&page_size=1`).reply(200, { assets: [] });
        axiosMock.onPost(getAssetsUrl(courseId)).reply(404);
        const addFilesButton = screen.getByLabelText('file-input');
        userEvent.upload(addFilesButton, file);
        await executeThunk(addAssetFile(courseId, file, 1), store.dispatch);
        const addStatus = store.getState().assets.addingStatus;
        expect(addStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getByText('Upload error')).toBeVisible();
      });

      it('404 delete should show error', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);

        const assetMenuButton = screen.getAllByTestId('file-menu-dropdown-mOckID3')[0];

        axiosMock.onDelete(`${getAssetsUrl(courseId)}mOckID3`).reply(404);
        fireEvent.click(within(assetMenuButton).getByLabelText('file-menu-toggle'));
        const confirmDelete = await screen.getByTestId('open-delete-confirmation-button');
        fireEvent.click(confirmDelete);
        await waitFor(() => {
          expect(screen.getByText('Delete mOckID3')).toBeVisible();
        });

        fireEvent.click(screen.getByText(messages.deleteFileButtonLabel.defaultMessage));
        await waitFor(() => {
          expect(screen.queryByText('Delete mOckID3')).toBeNull();
        });
        await executeThunk(deleteAssetFile(courseId, 'mOckID3', 5), store.dispatch);
        const deleteStatus = store.getState().assets.deletingStatus;
        expect(deleteStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getAllByTestId('grid-card-mOckID3')[0]).toBeVisible();

        expect(screen.getByText('Error')).toBeVisible();
      });

      it('404 usage path fetch should show error', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);

        const assetMenuButton = screen.getAllByTestId('file-menu-dropdown-mOckID3')[0];

        axiosMock.onGet(`${getAssetsUrl(courseId)}mOckID3/usage`).reply(404);
        fireEvent.click(within(assetMenuButton).getByLabelText('file-menu-toggle'));
        fireEvent.click(screen.getByText('Info'));
        await executeThunk(getUsagePaths({
          courseId,
          asset: { id: 'mOckID3', displayName: 'mOckID3' },
          setSelectedRows: jest.fn(),
        }), store.dispatch);
        await waitFor(() => {
          const { usageStatus } = store.getState().assets;
          expect(usageStatus).toEqual(RequestStatus.FAILED);
        });
      });

      it('404 lock update should show error', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);

        const assetMenuButton = screen.getAllByTestId('file-menu-dropdown-mOckID3')[0];

        axiosMock.onPut(`${getAssetsUrl(courseId)}mOckID3`).reply(404);
        fireEvent.click(within(assetMenuButton).getByLabelText('file-menu-toggle'));
        fireEvent.click(screen.getByText('Lock'));
        await executeThunk(updateAssetLock({
          courseId,
          assetId: 'mOckID3',
          locked: true,
        }), store.dispatch);
        await waitFor(() => {
          const updateStatus = store.getState().assets.updatingStatus;
          expect(updateStatus).toEqual(RequestStatus.FAILED);
        });
        expect(screen.getByText('Error')).toBeVisible();
      });

      it('multiple asset file fetch failure should show error', async () => {
        await mockStore(RequestStatus.SUCCESSFUL);
        const selectCardButtons = screen.getAllByTestId('datatable-select-column-checkbox-cell');
        fireEvent.click(selectCardButtons[0]);
        fireEvent.click(selectCardButtons[1]);
        const actionsButton = screen.getByText(messages.actionsButtonLabel.defaultMessage);
        expect(actionsButton).toBeVisible();

        fireEvent.click(actionsButton);
        const mockResponseData = { ok: false };
        const mockFetchResponse = Promise.resolve(mockResponseData);
        const downloadButton = screen.getByText(messages.downloadTitle.defaultMessage).closest('a');
        expect(downloadButton).not.toHaveClass('disabled');

        global.fetch = jest.fn().mockImplementation(() => mockFetchResponse);
        fireEvent.click(downloadButton);
        await waitFor(() => {
          expect(fetch).toHaveBeenCalledTimes(2);
        });

        const updateStatus = store.getState().assets.updatingStatus;
        expect(updateStatus).toEqual(RequestStatus.FAILED);

        expect(screen.getByText('Error')).toBeVisible();
      });
    });
  });
});
