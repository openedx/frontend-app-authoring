import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { GenericUnitInfoSettings } from './GenericUnitInfoSettings';

// Mock UnitTab subcomponents: Access is irrelevant here; Discussion becomes a simple
// checkbox so we can trigger handleDiscussionChange.
jest.mock('@src/generic/configure-modal/UnitTab', () => ({
  AccessEditComponent: () => null,
  DiscussionEditComponent: ({ discussionEnabled, handleDiscussionChange }: any) => (
    <input
      type="checkbox"
      aria-label="discussion"
      checked={discussionEnabled}
      onChange={handleDiscussionChange}
    />
  ),
}));

// Fake configure mutation injected via the configureHook prop, so we don't need Redux/thunks.
// It invokes onSuccess so the updateCallback path is exercised too.
const mutate = jest.fn((_payload: unknown, opts?: { onSuccess?: () => void; }) => opts?.onSuccess?.());
const useFakeConfigure = () => ({ mutate });

const baseProps = {
  id: 'block-v1:org+c+r+type@vertical+block@u1',
  visibilityState: 'live',
  discussionEnabled: false,
  configureHook: useFakeConfigure as any,
};

const WrapperProvider = ({ children }) => (
  <CourseAuthoringProvider courseId={'courseId'}>{children}</CourseAuthoringProvider>
);

const renderWithWrapper = (children) =>
  render(children, {
    extraWrapper: WrapperProvider,
  });

describe('GenericUnitInfoSettings', () => {
  let validateUserPermissionsMock;

  beforeEach(() => {
    const mocks = initializeMocks();
    mutate.mockClear();
    // Leave authz disabled by default so `canEditCourseContent` synchronously falls back to
    // `true` and the visibility buttons are enabled/clickable. Gating tests re-enable authz.
    mockWaffleFlags();
    validateUserPermissionsMock = mocks.validateUserPermissionsMock;
  });

  it('commits staff-only visibility when "Staff Only" is clicked', async () => {
    const user = userEvent.setup();
    const updateCallback = jest.fn();
    renderWithWrapper(<GenericUnitInfoSettings {...baseProps} updateCallback={updateCallback} />);

    await user.click(screen.getByRole('button', { name: 'Staff Only' }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({ unitId: baseProps.id, isVisibleToStaffOnly: true, discussionEnabled: false }),
        expect.anything(),
      )
    );
    expect(updateCallback).toHaveBeenCalled();
  });

  it('opens the confirmation modal and commits student-visible on confirm', async () => {
    const user = userEvent.setup();
    renderWithWrapper(<GenericUnitInfoSettings {...baseProps} visibilityState="staff_only" />);

    await user.click(screen.getByRole('button', { name: 'Student Visible' }));
    // Modal opens; confirm.
    await user.click(screen.getByRole('button', { name: 'Make visible to students' }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({ unitId: baseProps.id, isVisibleToStaffOnly: false }),
        expect.anything(),
      )
    );
  });

  it('does not commit when the confirmation modal is cancelled', async () => {
    const user = userEvent.setup();
    renderWithWrapper(<GenericUnitInfoSettings {...baseProps} visibilityState="staff_only" />);

    await user.click(screen.getByRole('button', { name: 'Student Visible' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mutate).not.toHaveBeenCalled();
  });

  it('commits the discussion toggle', async () => {
    const user = userEvent.setup();
    renderWithWrapper(<GenericUnitInfoSettings {...baseProps} />);

    await user.click(screen.getByRole('checkbox', { name: 'discussion' }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({ unitId: baseProps.id, discussionEnabled: true }),
        expect.anything(),
      )
    );
  });

  it('disables both visibility buttons when the user cannot edit course content', async () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    validateUserPermissionsMock.mockResolvedValue({ canEditCourseContent: false });
    renderWithWrapper(<GenericUnitInfoSettings {...baseProps} />);

    expect(await screen.findByRole('button', { name: 'Student Visible' })).toBeDisabled();
    expect(await screen.findByRole('button', { name: 'Staff Only' })).toBeDisabled();
  });

  it('enables both visibility buttons when the user can edit course content', async () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    validateUserPermissionsMock.mockResolvedValue({ canEditCourseContent: true });
    renderWithWrapper(<GenericUnitInfoSettings {...baseProps} />);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Student Visible' })).not.toBeDisabled());
    expect(screen.getByRole('button', { name: 'Staff Only' })).not.toBeDisabled();
  });
});
