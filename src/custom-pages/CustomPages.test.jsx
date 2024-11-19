import ReactDOM from 'react-dom';

import {
  initializeMocks,
  fireEvent,
  screen,
  act,
  render,
} from '../testUtils';
import { executeThunk } from '../utils';
import { RequestStatus } from '../data/constants';
import { getApiWaffleFlagsUrl } from '../data/api';
import { fetchWaffleFlags } from '../data/thunks';
import CustomPages from './CustomPages';
import {
  generateFetchPageApiResponse,
  generateNewPageApiResponse,
  getStatusValue,
  courseId,
} from './factories/mockApiResponses';

import {
  addSingleCustomPage,
  fetchCustomPages,
  updatePageOrder,
} from './data/thunks';
import { getApiBaseUrl, getTabHandlerUrl } from './data/api';
import messages from './messages';

let axiosMock;
let store;
ReactDOM.createPortal = jest.fn(node => node);

const renderComponent = () => {
  render(<CustomPages courseId={courseId} />);
};

const mockStore = async (status) => {
  const xblockAddUrl = `${getApiBaseUrl()}/xblock/`;
  const reorderUrl = `${getTabHandlerUrl(courseId)}/reorder`;
  const fetchPagesUrl = `${getTabHandlerUrl(courseId)}`;

  axiosMock.onGet(fetchPagesUrl).reply(getStatusValue(status), generateFetchPageApiResponse());
  axiosMock.onPost(reorderUrl).reply(204);
  axiosMock.onPut(xblockAddUrl).reply(200, generateNewPageApiResponse());

  await executeThunk(fetchCustomPages(courseId), store.dispatch);
  await executeThunk(addSingleCustomPage(courseId), store.dispatch);
  await executeThunk(updatePageOrder(courseId, [{ id: 'mOckID2' }, { id: 'mOckID1' }]), store.dispatch);
};

describe('CustomPages', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();
    store = mocks.reduxStore;
    axiosMock = mocks.axiosMock;
    axiosMock
      .onGet(getApiWaffleFlagsUrl(courseId))
      .reply(200, {
        useNewGradingPage: true,
        useNewCertificatesPage: true,
        useNewScheduleDetailsPage: true,
        useNewCourseOutlinePage: true,
      });
    await executeThunk(fetchWaffleFlags(courseId), store.dispatch);
  });
  it('should ', async () => {
    renderComponent();
    await mockStore(RequestStatus.DENIED);
    expect(screen.getByTestId('under-construction-placeholder')).toBeVisible();
  });
  it('should have breadecrumbs', async () => {
    renderComponent();
    await mockStore(RequestStatus.SUCCESSFUL);
    expect(screen.getByLabelText('Custom Page breadcrumbs')).toBeVisible();
  });
  it('should contain header row with title, add button and view live button', async () => {
    renderComponent();
    await mockStore(RequestStatus.SUCCESSFUL);
    expect(screen.getByText(messages.heading.defaultMessage)).toBeVisible();
    expect(screen.getByTestId('header-add-button')).toBeVisible();
    expect(screen.getByTestId('header-view-live-button')).toBeVisible();
  });
  it('should add new page when "add a new page button" is clicked', async () => {
    renderComponent();
    await mockStore(RequestStatus.SUCCESSFUL);
    const addButton = screen.getByTestId('body-add-button');
    expect(addButton).toBeVisible();
    await act(async () => { fireEvent.click(addButton); });
    const addStatus = store.getState().customPages.addingStatus;
    expect(addStatus).toEqual(RequestStatus.SUCCESSFUL);
  });
  it('should open student view modal when "add a new page button" is clicked', async () => {
    renderComponent();
    await mockStore(RequestStatus.SUCCESSFUL);
    const viewButton = screen.getByTestId('student-view-example-button');
    expect(viewButton).toBeVisible();
    expect(screen.queryByLabelText(messages.studentViewModalTitle.defaultMessage)).toBeNull();
    fireEvent.click(viewButton);
    expect(screen.getByText(messages.studentViewModalTitle.defaultMessage)).toBeVisible();
  });
  it('should update page order on drag', async () => {
    renderComponent();
    await mockStore(RequestStatus.SUCCESSFUL);
    const buttons = await screen.queryAllByRole('button');
    const draggableButton = buttons[9];
    expect(draggableButton).toBeVisible();
    await act(async () => {
      fireEvent.click(draggableButton);
      fireEvent.keyDown(draggableButton, { key: '' });
      fireEvent.keyDown(draggableButton, { key: 'ArrowDown' });
      fireEvent.keyDown(draggableButton, { key: '' });
    });
    const saveStatus = store.getState().customPages.savingStatus;
    expect(saveStatus).toEqual(RequestStatus.SUCCESSFUL);
  });
});
