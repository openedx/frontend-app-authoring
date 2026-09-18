import {
  initializeMocks,
  render as baseRender,
  screen,
  waitFor,
} from '@src/testUtils';
import type { RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
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

// Mock DatepickerControl so we can trigger onChange easily and inspect the
// `readonly` prop (surfaced as `data-readonly` for assertions).
jest.mock('@src/generic/datepicker-control', () => ({
  DATEPICKER_TYPES: { date: 'date', time: 'time' },
  DatepickerControl: ({ onChange, type, readonly }: any) => (
    <button
      type="button"
      data-readonly={String(!!readonly)}
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

const courseId = 'course-v1:org+course+run';

const WrapperProvider = ({ children }: { children: React.ReactNode; }) => (
  <CourseAuthoringProvider courseId={courseId}>{children}</CourseAuthoringProvider>
);

// Local `render` that wraps every case in a real CourseAuthoringProvider, so
// `canEditCourseContent` is driven by the mocked permissions API. Each test can
// keep calling `render(...)` as usual.
const render = (ui: React.ReactElement): RenderResult => baseRender(ui, { extraWrapper: WrapperProvider });

let validateUserPermissionsMock: any;

describe('ReleaseSection', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    validateUserPermissionsMock = mocks.validateUserPermissionsMock;
    validateUserPermissionsMock.mockResolvedValue({ canEditCourseContent: true });
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

  it('leaves the pickers editable when the user can edit course content', async () => {
    validateUserPermissionsMock.mockResolvedValue({ canEditCourseContent: true });
    render(<ReleaseSection itemId="i" onChange={jest.fn()} />);

    // `canEditCourseContent` resolves asynchronously, so wait for the read-only
    // state to settle rather than asserting synchronously.
    await waitFor(() => expect(screen.getByRole('button', { name: 'date' })).toHaveAttribute('data-readonly', 'false'));
    expect(screen.getByRole('button', { name: 'time' })).toHaveAttribute('data-readonly', 'false');
  });

  it('marks the pickers read-only when the user cannot edit course content', async () => {
    validateUserPermissionsMock.mockResolvedValue({ canEditCourseContent: false });
    render(<ReleaseSection itemId="i" onChange={jest.fn()} />);

    await waitFor(() => expect(screen.getByRole('button', { name: 'date' })).toHaveAttribute('data-readonly', 'true'));
    expect(screen.getByRole('button', { name: 'time' })).toHaveAttribute('data-readonly', 'true');
  });
});
