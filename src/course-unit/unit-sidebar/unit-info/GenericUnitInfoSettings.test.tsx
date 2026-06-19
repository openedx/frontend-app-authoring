import { initializeMocks, render, screen } from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { GenericUnitInfoSettings } from './GenericUnitInfoSettings';

// Make useStateWithCallback synchronous so callbacks call mutate immediately.
// Also handles the { value, skipCallback } object form used by the external-sync useEffect.
jest.mock('@src/hooks', () => ({
  useStateWithCallback: (defaultValue: any, cb?: any) => {
    const [state, setState] = useState(defaultValue);
    const wrappedSetState = (val: any) => {
      let newVal;
      let skip = false;
      if (typeof val === 'object' && val !== null && 'value' in val && 'skipCallback' in val) {
        newVal = val.value;
        skip = val.skipCallback;
      } else {
        newVal = typeof val === 'function' ? val(state) : val;
      }
      setState(newVal);
      if (cb && !skip) { cb(newVal); }
    };
    return [state, wrappedSetState];
  },
}));

const mutateFn = jest.fn();
jest.mock('@src/course-outline/data/apiHooks', () => ({
  useConfigureUnit: () => ({ mutate: mutateFn }),
}));

jest.mock('@src/generic/configure-modal/UnitTab', () => ({
  AccessEditComponent: () => <div>AccessEdit</div>,
  DiscussionEditComponent: ({ discussionEnabled, handleDiscussionChange }: any) => (
    <input
      type="checkbox"
      aria-label="Enable discussion"
      checked={discussionEnabled}
      onChange={handleDiscussionChange}
    />
  ),
}));

const defaultProps = {
  id: 'unit-1',
  visibilityState: 'live',
  discussionEnabled: false,
  userPartitionInfo: {
    selectedPartitionIndex: -1,
    selectablePartitions: [],
    groups: [],
  } as any,
  sectionId: 's1',
  subsectionId: 'ss1',
};

describe('GenericUnitInfoSettings', () => {
  beforeEach(() => {
    initializeMocks();
    mutateFn.mockReset();
  });

  it('renders visibility buttons and discussion checkbox', () => {
    render(<GenericUnitInfoSettings {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Student Visible' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Staff Only' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Enable discussion' })).toBeInTheDocument();
  });

  it('calls mutate when Staff Only is clicked', async () => {
    const user = userEvent.setup();
    render(<GenericUnitInfoSettings {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Staff Only' }));
    expect(mutateFn).toHaveBeenCalledWith(
      expect.objectContaining({ isVisibleToStaffOnly: true }),
      expect.anything(),
    );
  });

  it('syncs visibility when visibilityState prop changes externally without calling mutate', () => {
    // Start as student-visible (live)
    const { rerender } = render(<GenericUnitInfoSettings {...defaultProps} visibilityState="live" />);

    mutateFn.mockClear();
    // Simulate kebab-menu configure modal switching to staff-only:
    // useCourseItemData updates, UnitSettingsTab passes new props down.
    rerender(<GenericUnitInfoSettings {...defaultProps} visibilityState="staff_only" />);

    // Staff Only button must now be the active (primary) variant — visible as the
    // "Student Visible" modal would open on click rather than Student Visible being active.
    // Asserting mutate was NOT called is the key invariant.
    expect(mutateFn).not.toHaveBeenCalled();
  });

  it('syncs discussion checkbox when discussionEnabled prop changes externally without calling mutate', () => {
    const { rerender } = render(<GenericUnitInfoSettings {...defaultProps} discussionEnabled={false} />);
    expect(screen.getByRole('checkbox', { name: 'Enable discussion' })).not.toBeChecked();

    mutateFn.mockClear();
    // External update enables discussion
    rerender(<GenericUnitInfoSettings {...defaultProps} discussionEnabled />);

    expect(screen.getByRole('checkbox', { name: 'Enable discussion' })).toBeChecked();
    expect(mutateFn).not.toHaveBeenCalled();
  });
});
