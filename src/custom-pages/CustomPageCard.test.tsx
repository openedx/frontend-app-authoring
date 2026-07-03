import {
  initializeMocks,
  fireEvent,
  screen,
  render,
} from '@src/testUtils';
import messages from './messages';
import CustomPageCard from './CustomPageCard';

const courseId = 'course-v1:edX+DemoX+Demo_Course';

const defaultProps = {
  courseId,
  page: {
    id: 'mOckID1',
    name: 'test',
    courseStaffOnly: false,
  },
  setCurrentPage: jest.fn(),
  onDelete: jest.fn(),
  isDeleting: false,
  onToggleVisibility: jest.fn(),
};

const renderComponent = (courseStaffOnly = false) => {
  render(
    <CustomPageCard {...defaultProps} page={{ ...defaultProps.page, courseStaffOnly }} />,
  );
};

describe('CustomPageCard', () => {
  beforeEach(() => {
    initializeMocks();
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

  it('should call onDelete with blockId when delete is confirmed', () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('delete-modal-icon'));
    fireEvent.click(screen.getByText(messages.deletePageLabel.defaultMessage));
    expect(defaultProps.onDelete).toHaveBeenCalledWith('mOckID1', expect.any(Function));
  });

  it('should open edit modal', () => {
    renderComponent();
    const editButton = screen.getByTestId('edit-modal-icon');
    fireEvent.click(editButton);
    expect(defaultProps.setCurrentPage).toHaveBeenCalledWith('mOckID1');
  });

  it('should call onToggleVisibility when visibility icon is clicked', () => {
    renderComponent(false);
    fireEvent.click(screen.getByTestId('visibility-toggle-icon'));
    expect(defaultProps.onToggleVisibility).toHaveBeenCalledWith('mOckID1', false);
  });

  it('should call onToggleVisibility with true when page is visible', () => {
    renderComponent(true);
    fireEvent.click(screen.getByTestId('visibility-toggle-icon'));
    expect(defaultProps.onToggleVisibility).toHaveBeenCalledWith('mOckID1', true);
  });
});
