import { initializeMocks, render, screen } from '@src/testUtils';
import userEvent from '@testing-library/user-event';

import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import { ReleaseSection } from './ReleaseSection';

// Make useStateWithCallback synchronous so callbacks call onChange immediately
jest.mock('@src/hooks', () => ({
  useStateWithCallback: (defaultValue: any, cb?: any) => {
    const { useState } = jest.requireActual('react');
    const [state, setState] = useState(defaultValue);
    const wrappedSetState = (val: any) => {
      const newVal = typeof val === 'function' ? val(state) : val;
      setState(newVal);
      if (cb) { cb(newVal); }
    };
    return [state, wrappedSetState];
  },
}));

// Mock DatepickerControl so we can trigger onChange easily
jest.mock('@src/generic/datepicker-control', () => ({
  DATEPICKER_TYPES: { date: 'date', time: 'time' },
  DatepickerControl: ({ onChange, type }: any) => (
    <button type="button" onClick={() => onChange(type === 'date' ? '2025-12-31' : '12:00')}>
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
});
