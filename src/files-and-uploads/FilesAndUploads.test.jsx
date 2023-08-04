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
} from './data/thunks';
import { getAssetsUrl } from './data/api';
import messages from './messages';

let axiosMock;
let store;
let file;
ReactDOM.createPortal = jest.fn(node => node);

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
    it('should have Files and uploads title', async () => {
      renderComponent();
      await emptyMockStore(RequestStatus.SUCCESSFUL);
      expect(screen.getByText('Files and uploads')).toBeVisible();
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
        expect(screen.queryByTestId('list-card-mOckID1')).toBeNull();
        const listButton = screen.getByLabelText('List');
        await act(async () => {
          fireEvent.click(listButton);
        });
        expect(screen.queryByTestId('grid-card-mOckID1')).toBeNull();
        expect(screen.getByTestId('list-card-mOckID1')).toBeVisible();
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
        await act(async () => {
          fireEvent.click(deleteButton);
          await executeThunk(deleteAssetFile(courseId, 'mOckID1', 5), store.dispatch);
        });
        const deleteStatus = store.getState().assets.deletingStatus;
        expect(deleteStatus).toEqual(RequestStatus.SUCCESSFUL);
        expect(screen.queryByTestId('grid-card-mOckID1')).toBeNull();
      });
    });
    describe('card menu actions', () => {
      it('should open asset info', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();
        const assetMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');
        expect(assetMenuButton).toBeVisible();
        await waitFor(() => {
          fireEvent.click(within(assetMenuButton).getByLabelText('asset-menu-toggle'));
          fireEvent.click(screen.getByText('Info'));
          expect(screen.getAllByLabelText('mOckID1')[0]).toBeVisible();
        });
      });
      it('should open asset info and handle lock checkbox', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();
        const assetMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');
        expect(assetMenuButton).toBeVisible();
        axiosMock.onPut(`${getAssetsUrl(courseId)}mOckID1`).reply(201, { locked: false });
        await waitFor(() => {
          fireEvent.click(within(assetMenuButton).getByLabelText('asset-menu-toggle'));
          fireEvent.click(screen.getByText('Info'));
          expect(screen.getAllByLabelText('mOckID1')[0]).toBeVisible();
          fireEvent.click(screen.getByLabelText('Checkbox'));
          executeThunk(updateAssetLock({
            courseId,
            assetId: 'mOckID1',
            locked: false,
          }), store.dispatch);
        });
        const saveStatus = store.getState().assets.savingStatus;
        expect(saveStatus).toEqual(RequestStatus.SUCCESSFUL);
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
        const saveStatus = store.getState().assets.savingStatus;
        expect(saveStatus).toEqual(RequestStatus.SUCCESSFUL);
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
        const saveStatus = store.getState().assets.savingStatus;
        expect(saveStatus).toEqual(RequestStatus.SUCCESSFUL);
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
          fireEvent.click(screen.getByText('Delete'));
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
          fireEvent.click(screen.getByText('Delete'));
          executeThunk(deleteAssetFile(courseId, 'mOckID1', 5), store.dispatch);
        });
        const deleteStatus = store.getState().assets.deletingStatus;
        expect(deleteStatus).toEqual(RequestStatus.FAILED);
        expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();
        expect(screen.getByText('Error')).toBeVisible();
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
        const saveStatus = store.getState().assets.savingStatus;
        expect(saveStatus).toEqual(RequestStatus.FAILED);
        expect(screen.getByText('Error')).toBeVisible();
      });
    });
  });
});
