import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';
import userEvent from '@testing-library/user-event';
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

describe('GenericUnitInfoSettings', () => {
  beforeEach(() => {
    initializeMocks();
    mutate.mockClear();
  });

  it('commits staff-only visibility when "Staff Only" is clicked', async () => {
    const user = userEvent.setup();
    const updateCallback = jest.fn();
    render(<GenericUnitInfoSettings {...baseProps} updateCallback={updateCallback} />);

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
    render(<GenericUnitInfoSettings {...baseProps} visibilityState="staff_only" />);

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
    render(<GenericUnitInfoSettings {...baseProps} visibilityState="staff_only" />);

    await user.click(screen.getByRole('button', { name: 'Student Visible' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mutate).not.toHaveBeenCalled();
  });

  it('commits the discussion toggle', async () => {
    const user = userEvent.setup();
    render(<GenericUnitInfoSettings {...baseProps} />);

    await user.click(screen.getByRole('checkbox', { name: 'discussion' }));

    await waitFor(() =>
      expect(mutate).toHaveBeenCalledWith(
        expect.objectContaining({ unitId: baseProps.id, discussionEnabled: true }),
        expect.anything(),
      )
    );
  });
});
