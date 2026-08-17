import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { Newsstand } from '@openedx/paragon/icons';
import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { SidebarTitle } from './SidebarTitle';
import messages from './messages';

jest.mock('@src/course-outline/data/apiHooks', () => ({
  ...jest.requireActual('@src/course-outline/data/apiHooks'),
  useCourseItemData: jest.fn(),
}));

const mockUseCourseItemData = useCourseItemData as jest.Mock;

const menuProps = {
  itemId: 'block-v1:org+course+run+type@vertical+block@test',
  index: 0,
  actions: {
    deletable: true,
    draggable: false,
    childAddable: false,
    duplicable: true,
  },
  onClickUnlink: jest.fn(),
  onClickDelete: jest.fn(),
  onClickViewLibrary: jest.fn(),
};

const defaultProps = {
  title: 'Section title',
  icon: Newsstand,
};

const WrapperProvider = ({ children }) => (
  <CourseAuthoringProvider courseId={'courseId'}>{children}</CourseAuthoringProvider>
);

const renderComponent = (props = {}) =>
  render(<SidebarTitle {...defaultProps} {...props} />, {
    extraWrapper: WrapperProvider,
  });

describe('<SidebarTitle />', () => {
  let validateUserPermissionsMock;

  beforeEach(() => {
    const mocks = initializeMocks();
    // InfoSidebarMenu renders `null` until this returns data, so provide a minimal item.
    mockUseCourseItemData.mockReturnValue({ data: { id: menuProps.itemId } });
    // Authz must be enabled for the mocked permissions to take effect; otherwise
    // `useCourseUserPermissions` falls back to granting every permission (`true`).
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    validateUserPermissionsMock = mocks.validateUserPermissionsMock;
    validateUserPermissionsMock.mockResolvedValue({
      canEditCourseContent: true,
    });
  });

  it('renders the title', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: defaultProps.title })).toBeInTheDocument();
  });

  it('does not render the back button when onBackBtnClick is not provided', () => {
    renderComponent();

    expect(screen.queryByRole('button', { name: messages.backBtnText.defaultMessage })).not.toBeInTheDocument();
  });

  it('renders the back button and calls onBackBtnClick when clicked', async () => {
    const user = userEvent.setup();
    const onBackBtnClick = jest.fn();
    renderComponent({ onBackBtnClick });

    const backBtn = screen.getByRole('button', { name: messages.backBtnText.defaultMessage });
    expect(backBtn).toBeInTheDocument();
    await user.click(backBtn);
    expect(onBackBtnClick).toHaveBeenCalledTimes(1);
  });

  it('renders the menu when the user can edit course content and menuProps are provided', async () => {
    renderComponent({ menuProps });

    // The menu is gated behind `canEditCourseContent`, which is only known once the (async)
    // permissions query resolves, so wait for it rather than querying synchronously.
    expect(
      await screen.findByRole('button', { name: messages.itemMenuAlt.defaultMessage }),
    ).toBeInTheDocument();
  });

  it('does not render the menu when the user cannot edit course content', async () => {
    validateUserPermissionsMock.mockResolvedValue({
      canEditCourseContent: false,
    });
    renderComponent({ menuProps });

    // The title always renders; wait for the permissions query to settle, then confirm the
    // gated menu never appears.
    expect(screen.getByRole('heading', { name: defaultProps.title })).toBeInTheDocument();
    await waitFor(() => expect(validateUserPermissionsMock).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: messages.itemMenuAlt.defaultMessage })).not.toBeInTheDocument();
  });

  it('does not render the menu when menuProps are not provided', async () => {
    renderComponent();

    await waitFor(() => expect(validateUserPermissionsMock).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: messages.itemMenuAlt.defaultMessage })).not.toBeInTheDocument();
  });
});
