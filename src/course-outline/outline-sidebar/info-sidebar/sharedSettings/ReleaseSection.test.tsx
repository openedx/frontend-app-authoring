import { initializeMocks, render, screen } from '@src/testUtils';
import userEvent from '@testing-library/user-event';

import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import { ReleaseSection } from './ReleaseSection';

// Make useFieldDraft commit synchronously (no debounce) so edits call onChange immediately.
jest.mock('@src/hooks/useFieldDraft', () => ({
  useFieldDraft: (serverValue: any, commit?: any) => {
    const { useState } = jest.requireActual('react');
    const [override, setOverride] = useState(null);
    const value = override ?? serverValue;
    const update = (patch: any) => {
      const next = typeof patch === 'function' ? patch(value) : { ...value, ...patch };
      setOverride(next);
      if (commit) { commit(next); }
    };
    return [value, update];
  },
}));

// Mock DatepickerControl so we can trigger onChange easily
jest.mock('@src/generic/datepicker-control', () => ({
  DATEPICKER_TYPES: { date: 'date', time: 'time' },
  DatepickerControl: ({ onChange, type }: any) => (
    <button
      type="button"
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
});
