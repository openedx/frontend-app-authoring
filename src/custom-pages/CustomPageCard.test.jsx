import {
  initializeMocks,
  fireEvent,
  screen,
  waitFor,
  render,
} from '@src/testUtils';
import {
  generateUpdateVisibilityApiResponse,
  courseId,
  generateXblockData,
} from './factories/mockApiResponses';
import { getApiBaseUrl } from './data/api';
import messages from './messages';
import CustomPageCard from './CustomPageCard';
import CustomPagesProvider from './CustomPagesProvider';

const defaultProps = {
  courseId,
  page: {
    id: 'mOckID1',
    name: 'test',
    courseStaffOnly: false,
  },
  setCurrentPage: jest.fn(),
};

let axiosMock;

const renderComponent = (courseStaffOnly = false) => {
  render(
    <CustomPagesProvider courseId={courseId}>
      <CustomPageCard {...defaultProps} page={{ ...defaultProps.page, courseStaffOnly }} />
    </CustomPagesProvider>,
  );
};

describe('CustomPageCard', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
  });

  it('should have title', () => {
    renderComponent();
    expect(screen.getByTestId('card-title')).toHaveTextContent('test');
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
    const xblockEditUrl = `${getApiBaseUrl()}/xblock/mOckID1`;
    axiosMock.onDelete(xblockEditUrl).reply(204);

    renderComponent();
    const deleteButton = screen.getByTestId('delete-modal-icon');
    fireEvent.click(deleteButton);
    expect(screen.getByText(messages.deleteConfirmationTitle.defaultMessage)).toBeVisible();

    const confirmButton = screen.getByText(messages.deletePageLabel.defaultMessage);
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should open edit modal', () => {
    renderComponent();
    const editButton = screen.getByTestId('edit-modal-icon');
    fireEvent.click(editButton);
    expect(defaultProps.setCurrentPage).toHaveBeenCalledWith('mOckID1');
  });

  it('should update courseStaffOnly to true', async () => {
    const xblockEditUrl = `${getApiBaseUrl()}/xblock/mOckID1`;
    axiosMock.onPut(xblockEditUrl).reply(200, generateUpdateVisibilityApiResponse('mOckID1', true));
    axiosMock.onGet(xblockEditUrl).reply(200, generateXblockData('mOckID1'));

    renderComponent(false);
    const visibilityButton = screen.getByTestId('visibility-toggle-icon');
    fireEvent.click(visibilityButton);

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should update courseStaffOnly to false', async () => {
    const xblockEditUrl = `${getApiBaseUrl()}/xblock/mOckID1`;
    axiosMock.onPut(xblockEditUrl).reply(200, generateUpdateVisibilityApiResponse('mOckID1', false));
    axiosMock.onGet(xblockEditUrl).reply(200, generateXblockData('mOckID1'));

    renderComponent(true);
    const visibilityButton = screen.getByTestId('visibility-toggle-icon');
    fireEvent.click(visibilityButton);

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBeGreaterThanOrEqual(1);
    });
  });
});
