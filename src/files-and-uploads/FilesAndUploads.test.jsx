import {
  render,
  act,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react';
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
  const addAssetUrl = getAssetsUrl(courseId);

  axiosMock.onGet(fetchAssetsUrl).reply(getStatusValue(status), generateFetchAssetApiResponse());
  axiosMock.onPost(addAssetUrl).reply(200, generateNewAssetApiResponse());

  await executeThunk(fetchAssets(courseId), store.dispatch);
  await executeThunk(addAssetFile(courseId, file, 1), store.dispatch);
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
        fireEvent.change(dropzone, {
          target: { files: [file] },
        });
        await executeThunk(addAssetFile(courseId, file, 0), store.dispatch);
      });
      const addStatus = store.getState().assets.addingStatus;
      expect(addStatus).toEqual(RequestStatus.SUCCESSFUL);
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
        const addFilesButton = screen.getByText(messages.addFilesButtonLabel.defaultMessage);
        await act(async () => {
          fireEvent.change(addFilesButton, {
            target: { files: [file] },
          });
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
      it('should have enabled action buttons', async () => {
        renderComponent();
        await mockStore(RequestStatus.SUCCESSFUL);
        const selectCardButton = screen.getAllByTestId('datatable-select-column-checkbox-cell')[0];
        fireEvent.click(selectCardButton);
        const actionsButton = screen.getByText(messages.actionsButtonLabel.defaultMessage);
        expect(actionsButton).toBeVisible();
        await waitFor(() => {
          fireEvent.click(actionsButton);
        });
        expect(screen.getByText(messages.downloadTitle.defaultMessage).closest('a')).toBeVisible();
        expect(screen.getByText(messages.deleteTitle.defaultMessage).closest('a')).toBeVisible();
        expect(screen.getByText(messages.downloadTitle.defaultMessage).closest('a')).not.toHaveClass('disabled');
        expect(screen.getByText(messages.deleteTitle.defaultMessage).closest('a')).not.toHaveClass('disabled');
      });
    });
    // it('should open asset info', async () => {
    //   renderComponent();
    //   await mockStore(RequestStatus.SUCCESSFUL);
    //   expect(screen.getByTestId('grid-card-mOckID1')).toBeVisible();
    //   const assetMenuButton = screen.getByTestId('file-menu-dropdown-mOckID1');
    //   expect(assetMenuButton).toBeVisible();
    //   await waitFor(() => {
    //     fireEvent.click(assetMenuButton);
    //   });
    //   expect(screen.getByText(messages.infoTitle.defaultMessage).closest('a')).toBeVisible();
    //   console.log('after wait for');
    //   fireEvent.click(screen.getByText('Info'));
    //   expect(screen.queryByText('test')).toBeVisible();
    // });
  });
});
