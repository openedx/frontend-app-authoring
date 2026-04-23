import { userEvent } from '@testing-library/user-event';
import {
  fireEvent,
  initializeMocks,
  render,
  screen,
} from '@src/testUtils';

import { CourseOutlineProvider, OutlineSidebarProvider } from '@src/course-outline';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import messages from './messages';
import HeaderActions, { HeaderActionsProps } from './HeaderActions';

const headerNavigationsActions = {
  handleNewSection: jest.fn(),
  handleReIndex: jest.fn(),
  handleExpandAll: jest.fn(),
  lmsLink: '',
};

const courseActions = {
  draggable: true,
  childAddable: true,
  deletable: true,
  duplicable: true,
};

const setCurrentPageKeyMock = jest.fn();

jest.mock('../outline-sidebar/OutlineSidebarContext', () => ({
  ...jest.requireActual('../outline-sidebar/OutlineSidebarContext'),
  useOutlineSidebarContext: () => ({
    ...jest.requireActual('../outline-sidebar/OutlineSidebarContext').useOutlineSidebarContext(),
    setCurrentPageKey: setCurrentPageKeyMock,
  }),
}));

const renderComponent = (props?: Partial<HeaderActionsProps>) =>
  render(
    <HeaderActions
      courseActions={courseActions}
      headerNavigationsActions={headerNavigationsActions}
      isReIndexShow
      isDisabledReindexButton
      {...props}
    />,
    {
      extraWrapper: ({ children }) => (
        <CourseAuthoringProvider courseId="1">
          <CourseOutlineProvider>
            <OutlineSidebarProvider>
              {children}
            </OutlineSidebarProvider>
          </CourseOutlineProvider>
        </CourseAuthoringProvider>
      ),
    },
  );

describe('<HeaderActions />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('render HeaderActions component correctly', async () => {
    renderComponent();

    expect(await screen.findByRole('button', { name: messages.addButton.defaultMessage })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.viewLiveButton.defaultMessage })).toBeInTheDocument();
  });

  it('calls the correct handlers when clicking buttons', async () => {
    renderComponent();

    const addButton = await screen.findByRole('button', { name: messages.addButton.defaultMessage });
    fireEvent.click(addButton);
    expect(setCurrentPageKeyMock).toHaveBeenCalledWith('add');
  });

  it('disables new section button if course outline fetch fails', async () => {
    renderComponent({
      errors: { outlineIndexApi: { data: 'some error', type: 'serverError' } },
    });

    expect(await screen.findByRole('button', { name: messages.addButton.defaultMessage })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.addButton.defaultMessage })).toBeDisabled();
  });

  it('should show course info on click', async () => {
    renderComponent();

    // Click on the dropdown button
    await userEvent.click(screen.getByRole('button', { name: 'Course info' }));

    // Check if the current page change is called
    expect(setCurrentPageKeyMock).toHaveBeenCalledWith('info');
  });

  it('render reindex button and call the correct handlers when clicking', async () => {
    renderComponent({
      isReIndexShow: true,
      isDisabledReindexButton: false,
    });

    const reindexButton = await screen.findByRole('button', { name: messages.reindexButton.defaultMessage });
    expect(reindexButton).toBeInTheDocument();

    fireEvent.click(reindexButton);
    expect(headerNavigationsActions.handleReIndex).toHaveBeenCalledTimes(1);
  });

  it('render reindex button when isDisabledReindexButton is true', async () => {
    renderComponent({
      isReIndexShow: true,
      isDisabledReindexButton: true,
    });

    expect(await screen.findByRole('button', { name: messages.reindexButton.defaultMessage })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.reindexButton.defaultMessage })).toBeDisabled();
  });

  it('hide reindex button', async () => {
    renderComponent({
      isReIndexShow: false,
    });

    expect(screen.queryByRole('button', { name: messages.reindexButton.defaultMessage })).not.toBeInTheDocument();
  });
});
