import { initializeMocks, render, screen } from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

import { SubsectionSettings } from './SubsectionSettings';

const subsectionId = 'sub-1';

// Make useStateWithCallback synchronous so callbacks call mutate immediately
jest.mock('@src/hooks', () => ({
  useStateWithCallback: (defaultValue: any, cb?: any) => {
    const [state, setState] = useState(defaultValue);
    const wrappedSetState = (val: any) => {
      const newVal = typeof val === 'function' ? val(state) : val;
      setState(newVal);
      if (cb) { cb(newVal); }
    };
    return [state, wrappedSetState];
  },
}));

// Mock DatepickerControl used in GradingSection so we can trigger onChange
jest.mock('@src/generic/datepicker-control', () => ({
  DATEPICKER_TYPES: { date: 'date', time: 'time' },
  DatepickerControl: ({ onChange, type, ...props }: any) => (
    <button
      type="button"
      data-testid={props['data-testid'] || type}
      onClick={() => onChange(type === 'date' ? '2025-12-31' : '12:00')}
    >
      {type}
    </button>
  ),
}));

// Mock nested components: ReleaseSection, VisibilitySection, AdvancedTab
jest.mock('./sharedSettings/ReleaseSection', () => ({
  __esModule: true,
  ReleaseSection: ({ onChange }: any) => <button type="button" onClick={() => onChange('2030-01-01')}>Release</button>,
}));

jest.mock('./sharedSettings/VisibilitySection', () => ({
  __esModule: true,
  VisibilitySection: ({ onChange }: any) => (
    <button type="button" onClick={() => onChange({ visibility: 'v' })}>Visibility</button>
  ),
}));

jest.mock('@src/generic/configure-modal/AdvancedTab', () => ({
  __esModule: true,
  default: ({ setFieldValue }: any) => (
    <div>
      <button type="button" onClick={() => setFieldValue('isProctoredExam', true)}>Set Proctored</button>
    </div>
  ),
}));

// Mock hooks
const mutate = jest.fn();
jest.mock('@src/course-outline/data/apiHooks', () => ({
  useConfigureSubsection: () => ({ mutate }),
  useCourseDetails: jest.fn(),
  useCourseItemData: jest.fn(),
}));

// Mock contexts
jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({ courseId: '5' }),
}));

jest.mock('@src/course-outline/outline-sidebar/OutlineSidebarContext', () => ({
  useOutlineSidebarContext: () => ({ selectedContainerState: { sectionId: 'section-abc' } }),
}));

const apiHooks = jest.requireMock('@src/course-outline/data/apiHooks') as any;

const baseItemData = {
  visibilityState: 'staff_only',
  start: '2022-01-01',
  format: null,
  due: null,
  isTimeLimited: false,
  isProctoredExam: false,
  isOnboardingExam: false,
  isPracticeExam: false,
  examReviewRules: null,
  defaultTimeLimitMinutes: null,
  hideAfterDue: undefined,
  showCorrectness: undefined,
  isPrereq: false,
  prereq: null,
  prereqMinScore: null,
  prereqMinCompletion: null,
  courseGraders: ['g1', 'g2'],
  graded: true,
};

describe('SubsectionSettings', () => {
  beforeEach(() => {
    initializeMocks();
    mutate.mockReset();
  });

  it('renders core sections and calls mutate for release, visibility, grading, and special exam', async () => {
    apiHooks.useCourseDetails.mockReturnValue({ data: { selfPaced: false } });
    apiHooks.useCourseItemData.mockReturnValue({ data: baseItemData, isPending: false });

    const user = userEvent.setup();
    render(<SubsectionSettings subsectionId={subsectionId} />);

    // Release
    await user.click(await screen.findByRole('button', { name: 'Release' }));
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ itemId: subsectionId, sectionId: 'section-abc', releaseDate: '2030-01-01' }),
    );

    // Visibility
    await user.click(await screen.findByRole('button', { name: 'Visibility' }));
    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ itemId: subsectionId, sectionId: 'section-abc', visibility: 'v' }),
    );

    // Grading -> Ungraded
    await user.click(await screen.findByRole('button', { name: 'Ungraded' }));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ itemId: subsectionId, graderType: 'notgraded' }));

    // Special exam
    await user.click(await screen.findByRole('button', { name: 'Set Proctored' }));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ itemId: subsectionId, isProctoredExam: true }));
  });

  it('handles grading select and due date/time changes', async () => {
    apiHooks.useCourseDetails.mockReturnValue({ data: { selfPaced: false } });
    apiHooks.useCourseItemData.mockReturnValue({
      data: {
        ...baseItemData,
        graded: false,
        prereqMinScore: '50',
        prereqMinCompletion: '75',
      },
      isPending: false,
    });

    const user = userEvent.setup();
    render(<SubsectionSettings subsectionId={subsectionId} />);

    await user.click(await screen.findByRole('button', { name: 'Graded' }));
    const select = await screen.findByTestId('grader-type-select');
    await user.selectOptions(select as HTMLSelectElement, 'g1');
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ itemId: subsectionId, graderType: 'g1' }));

    await user.click(await screen.findByTestId('due-date-picker'));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ itemId: subsectionId, dueDate: '2025-12-31' }));
    await user.click(await screen.findByTestId('time'));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ itemId: subsectionId, dueDate: '12:00' }));
  });

  it('toggles assessment result visibility', async () => {
    apiHooks.useCourseDetails.mockReturnValue({ data: { selfPaced: false } });
    apiHooks.useCourseItemData.mockReturnValue({ data: { ...baseItemData, graded: false }, isPending: false });

    const user = userEvent.setup();
    render(<SubsectionSettings subsectionId={subsectionId} />);

    await user.click(await screen.findByRole('button', { name: 'Show' }));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ itemId: subsectionId, showCorrectness: 'always' }));

    await user.click(await screen.findByRole('button', { name: 'Hide' }));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ itemId: subsectionId, showCorrectness: 'never' }));

    const checkbox = await screen.findByRole('checkbox');
    await user.click(checkbox);
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ itemId: subsectionId, showCorrectness: 'past_due' }));
  });

  it('does not render ReleaseSection when course is self paced', () => {
    apiHooks.useCourseDetails.mockReturnValue({ data: { selfPaced: true } });
    apiHooks.useCourseItemData.mockReturnValue({ data: { ...baseItemData, start: null }, isPending: false });

    render(<SubsectionSettings subsectionId={subsectionId} />);

    expect(screen.queryByRole('button', { name: 'Release' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Visibility' })).toBeInTheDocument();
  });

  it('does not call mutate when item data is pending', async () => {
    apiHooks.useCourseDetails.mockReturnValue({ data: { selfPaced: false } });
    apiHooks.useCourseItemData.mockReturnValue({
      data: {
        ...baseItemData,
        start: null,
        graded: false,
      },
      isPending: true,
    });

    const user = userEvent.setup();
    render(<SubsectionSettings subsectionId={subsectionId} />);

    await user.click(screen.getByRole('button', { name: 'Visibility' }));
    expect(mutate).not.toHaveBeenCalled();
  });

  it('resets grading local state when itemData changes', async () => {
    apiHooks.useCourseDetails.mockReturnValue({ data: { selfPaced: false } });
    const firstItemData = {
      ...baseItemData,
      format: 'g1',
      due: '2024-01-01',
      graded: true,
    };
    const secondItemData = { ...firstItemData, format: 'g2', due: '2024-02-02' };

    apiHooks.useCourseItemData.mockReturnValue({ data: firstItemData, isPending: false });

    const { rerender } = render(<SubsectionSettings subsectionId={subsectionId} />);

    mutate.mockClear();
    apiHooks.useCourseItemData.mockReturnValue({ data: secondItemData, isPending: false });
    rerender(<SubsectionSettings subsectionId={subsectionId} />);

    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ graderType: 'g2', dueDate: '2024-02-02' }));
  });

  it('resets assessment visibility local state when itemData changes', async () => {
    apiHooks.useCourseDetails.mockReturnValue({ data: { selfPaced: false } });
    const firstItemData = { ...baseItemData, graded: false, showCorrectness: 'always' };
    const secondItemData = { ...firstItemData, showCorrectness: 'never' };

    apiHooks.useCourseItemData.mockReturnValue({ data: firstItemData, isPending: false });

    const { rerender } = render(<SubsectionSettings subsectionId={subsectionId} />);

    mutate.mockClear();
    apiHooks.useCourseItemData.mockReturnValue({ data: secondItemData, isPending: false });
    rerender(<SubsectionSettings subsectionId={subsectionId} />);

    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ showCorrectness: 'never' }));
  });

  it('does not call mutate when item data is absent', async () => {
    apiHooks.useCourseDetails.mockReturnValue({ data: { selfPaced: false } });
    apiHooks.useCourseItemData.mockReturnValue({ data: undefined, isPending: false });

    const user = userEvent.setup();
    render(<SubsectionSettings subsectionId={subsectionId} />);

    await user.click(screen.getByRole('button', { name: 'Visibility' }));
    expect(mutate).not.toHaveBeenCalled();
  });
});
