import { initializeMocks, render, screen } from '@src/testUtils';
import userEvent from '@testing-library/user-event';

import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import { ReleaseSection } from './ReleaseSection';

// Make useStateWithCallback synchronous so callbacks call onChange immediately.
// Also handles the { value, skipCallback } object form used by the external-sync useEffect.
jest.mock('@src/hooks', () => ({
  useStateWithCallback: (defaultValue: any, cb?: any) => {
    const { useState } = jest.requireActual('react');
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

// Mock DatepickerControl so we can trigger onChange and inspect the current value.
jest.mock('@src/generic/datepicker-control', () => ({
  DATEPICKER_TYPES: { date: 'date', time: 'time' },
  DatepickerControl: ({ onChange, type, value }: any) => (
    <button
      type="button"
      data-testid={`datepicker-${type}`}
      data-value={value}
      onClick={() => onChange(type === 'date' ? '2025-12-31' : '12:00')}
    >
      {type}
    </button>
  ),
}));

jest.mock('@src/course-outline/data/apiHooks', () => ({
  useCourseItemData: jest.fn(),
}));

const mockUseCourseItemData = useCourseItemData as jest.Mock;

describe('ReleaseSection', () => {
  beforeEach(() => {
    initializeMocks();
    mockUseCourseItemData.mockReturnValue({ data: { start: null } });
  });

  it('renders date and time pickers', () => {
    render(<ReleaseSection itemId="i" onChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'date' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'time' })).toBeInTheDocument();
  });

  it('calls onChange when pickers change', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<ReleaseSection itemId="i" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'date' }));
    expect(onChange).toHaveBeenCalledWith('2025-12-31');

    await user.click(screen.getByRole('button', { name: 'time' }));
    expect(onChange).toHaveBeenCalledWith('12:00');
  });

  it('syncs displayed value when itemData.start changes externally without calling onChange', () => {
    // Simulate initial state (e.g. subsection has a release date set)
    const initialDate = '2024-01-01T00:00:00Z';
    mockUseCourseItemData.mockReturnValue({ data: { start: initialDate } });
    const onChange = jest.fn();
    const { rerender } = render(<ReleaseSection itemId="i" onChange={onChange} />);

    expect(screen.getByTestId('datepicker-date')).toHaveAttribute('data-value', initialDate);

    // Simulate the kebab-menu configure modal saving a new release date:
    // the mutation fires, the section refetches, and setQueryData updates the
    // subsection cache — causing useCourseItemData to return the new date.
    const updatedDate = '2025-06-15T00:00:00Z';
    mockUseCourseItemData.mockReturnValue({ data: { start: updatedDate } });
    rerender(<ReleaseSection itemId="i" onChange={onChange} />);

    // The sidebar must reflect the updated date...
    expect(screen.getByTestId('datepicker-date')).toHaveAttribute('data-value', updatedDate);
    // ...but must NOT trigger onChange (which would fire a redundant mutation)
    expect(onChange).not.toHaveBeenCalled();
  });
});
