import {
  render,
  act,
  fireEvent,
  screen,
  within,
} from '@testing-library/react';

import {
  initializeMockApp,
} from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import initializeStore from '../store';
import { executeThunk } from '../utils';
import { RequestStatus } from '../data/constants';
import CustomPageCard from './CustomPageCard';
import {
  generateUpdateVisibilityApiResponse,
  courseId,
  initialState,
  generateXblockData,
} from './factories/mockApiResponses';

import { deleteSingleCustomPage, updateCustomPageVisibility } from './data/thunks';
import { getApiBaseUrl } from './data/api';
import messages from './messages';
import CustomPagesProvider from './CustomPagesProvider';

const defaultProps = {
  courseId,
  page: {
    id: 'mOckID1',
    name: 'test',
    courseStaffOnly: false,
  },
  dispatch: jest.fn(),
  deletePageStatus: '',
  setCurrentPage: jest.fn(),
};

let axiosMock;
let store;

const renderComponent = (courseStaffOnly) => {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <CustomPagesProvider courseId={courseId}>
          <CustomPageCard {...defaultProps} page={{ ...defaultProps.page, courseStaffOnly }} />
        </CustomPagesProvider>
      </AppProvider>
    </IntlProvider>,
  );
};

const mockStore = async ({
  blockId,
  visibility,
}) => {
  const xblockEditUrl = `${getApiBaseUrl()}/xblock/${blockId}`;

  axiosMock.onDelete(xblockEditUrl).reply(204);
  axiosMock.onPut(xblockEditUrl).reply(200, generateUpdateVisibilityApiResponse(blockId, visibility));
  axiosMock.onGet(xblockEditUrl).reply(200, generateXblockData(blockId));

  await executeThunk(deleteSingleCustomPage({
    blockId,
    closeConfirmation: jest.fn(),
  }), store.dispatch);
  await executeThunk(updateCustomPageVisibility({
    blockId,
    metadata: { courseStaffOnly: visibility },
  }), store.dispatch);
};

describe('CustomPageCard', () => {
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
  });
  it('should have title from redux store', async () => {
    renderComponent();
    const { getByText } = within(screen.getByTestId('card-title'));
    expect(getByText('test')).toBeInTheDocument();
  });
  it('should contain icon row', () => {
    renderComponent();
    expect(screen.getByTestId('edit-modal-icon')).toBeVisible();
    expect(screen.getByTestId('visibility-toggle-icon')).toBeVisible();
    expect(screen.getByTestId('delete-modal-icon')).toBeVisible();
  });
  it('should open delete confirmation modal and handle cancel', () => {
    renderComponent();
    const deleteButton = screen.getByTestId('delete-modal-icon');
    fireEvent.click(deleteButton);
    expect(screen.getByText(messages.deleteConfirmationTitle.defaultMessage)).toBeVisible();
    const cancelButton = screen.getByText(messages.cancelButtonLabel.defaultMessage);
    fireEvent.click(cancelButton);
    expect(screen.queryByText(messages.deleteConfirmationTitle.defaultMessage)).toBeNull();
  });
  it('should open delete confirmation modal and handle delete', async () => {
    renderComponent();
    const deleteButton = screen.getByTestId('delete-modal-icon');
    fireEvent.click(deleteButton);
    expect(screen.getByText(messages.deleteConfirmationTitle.defaultMessage)).toBeVisible();
    expect(screen.queryByTestId('delete-confirmation-alert-modal')).toBeNull();
    const confirmButton = screen.getByText(messages.deletePageLabel.defaultMessage);
    await mockStore({ blockId: 'mOckID1' });
    await act(async () => { fireEvent.click(confirmButton); });
    const deleteStatus = store.getState().customPages.deletingStatus;
    expect(deleteStatus).toEqual(RequestStatus.SUCCESSFUL);
  });
  it('should open edit modal', async () => {
    renderComponent();
    const editButton = screen.getByTestId('edit-modal-icon');
    await mockStore({ blockId: 'mOckID1' });
    await act(async () => { fireEvent.click(editButton); });
    expect(defaultProps.setCurrentPage).toHaveBeenCalled();
  });
  it('should open update courseStaffOnly to true', async () => {
    renderComponent(false);
    const visibilityButton = screen.getByTestId('visibility-toggle-icon');
    await mockStore({ blockId: 'mOckID1', visibility: true });
    await act(async () => { fireEvent.click(visibilityButton); });
    const { courseStaffOnly } = store.getState().models.customPages[defaultProps.page.id];
    expect(courseStaffOnly).toBeTruthy();
  });
  it('should open update courseStaffOnly to false', async () => {
    renderComponent(true);
    const visibilityButton = screen.getByTestId('visibility-toggle-icon');
    await mockStore({ blockId: 'mOckID1', visibility: false });
    await act(async () => { fireEvent.click(visibilityButton); });
    const { courseStaffOnly } = store.getState().models.customPages[defaultProps.page.id];
    expect(courseStaffOnly).toBeFalsy();
  });
});
