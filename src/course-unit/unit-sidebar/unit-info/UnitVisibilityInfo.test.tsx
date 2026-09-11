import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { getConfig, setConfig } from '@edx/frontend-platform';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import UnitVisibilityInfo from './UnitVisibilityInfo';
import messages from './messages';

const mockSetCurrentTabKey = jest.fn();

jest.mock('../UnitSidebarContext', () => ({
  useUnitSidebarContext: () => ({
    setCurrentTabKey: mockSetCurrentTabKey,
  }),
}));

const defaultProps = {
  openVisibleModal: jest.fn(),
  visibleToStaffOnly: false,
};

const WrapperProvider = ({ children }) => (
  <CourseAuthoringProvider courseId={'courseId'}>{children}</CourseAuthoringProvider>
);

const renderComponent = (props = {}) =>
  render(<UnitVisibilityInfo {...defaultProps} {...props} />, {
    extraWrapper: WrapperProvider,
  });

describe('<UnitVisibilityInfo />', () => {
  let validateUserPermissionsMock;

  beforeEach(() => {
    const mocks = initializeMocks();
    // Authz must be enabled for the mocked permissions to take effect; otherwise
    // `useCourseUserPermissions` falls back to granting every permission (`true`).
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    validateUserPermissionsMock = mocks.validateUserPermissionsMock;
    validateUserPermissionsMock.mockResolvedValue({
      canEditCourseContent: true,
    });
  });

  describe('new design', () => {
    beforeEach(() => {
      setConfig({
        ...getConfig(),
        ENABLE_UNIT_PAGE_NEW_DESIGN: 'true',
      });
    });

    it('renders the edit visibility button and navigates to settings when the user can edit', async () => {
      const user = userEvent.setup();
      renderComponent();

      // The edit button is gated behind `canEditCourseContent`, which is only known once the
      // (async) permissions query resolves, so wait for it rather than querying synchronously.
      const editButton = await screen.findByRole('button', { name: messages.visibilityEditButton.defaultMessage });
      await user.click(editButton);
      expect(mockSetCurrentTabKey).toHaveBeenCalledWith('settings');
    });

    it('does not render the edit visibility button when the user cannot edit course content', async () => {
      validateUserPermissionsMock.mockResolvedValue({
        canEditCourseContent: false,
      });
      renderComponent();

      // The visibility label always renders; wait for the permissions query to settle, then
      // confirm the gated edit button never appears.
      expect(await screen.findByText(messages.visibilityAllLearnersTitle.defaultMessage)).toBeInTheDocument();
      await waitFor(() => expect(validateUserPermissionsMock).toHaveBeenCalled());
      expect(
        screen.queryByRole('button', { name: messages.visibilityEditButton.defaultMessage }),
      ).not.toBeInTheDocument();
    });
  });

  describe('legacy design', () => {
    beforeEach(() => {
      setConfig({
        ...getConfig(),
        ENABLE_UNIT_PAGE_NEW_DESIGN: false,
      });
    });

    it('disables the visibility checkbox when the user cannot edit course content', async () => {
      validateUserPermissionsMock.mockResolvedValue({
        canEditCourseContent: false,
      });
      renderComponent();

      expect(
        await screen.findByRole('checkbox', { name: messages.visibilityCheckboxTitle.defaultMessage }),
      ).toBeDisabled();
    });

    it('enables the visibility checkbox when the user can edit course content', async () => {
      renderComponent();

      await waitFor(() =>
        expect(
          screen.getByRole('checkbox', { name: messages.visibilityCheckboxTitle.defaultMessage }),
        ).not.toBeDisabled()
      );
    });
  });
});
