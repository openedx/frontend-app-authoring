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
      // call callback synchronously like the implementation would after debounce
      if (cb) { cb(newVal); }
    };
    return [state, wrappedSetState];
  },
}));

// Mock DatepickerControl used in GradingSection so we can trigger onChange
jest.mock('@src/generic/datepicker-control', () => ({
  DATEPICKER_TYPES: { date: 'date', time: 'time' },
  DatepickerControl: ({ onChange, type, ...props }: any) => (
    <button type="button" data-testid={props['data-testid'] || type} onClick={() => onChange(type === 'date' ? '2025-12-31' : '12:00')}>
      {type}
    </button>
  ),
}));

// Mock nested components: ReleaseSection, VisibilitySection, AdvancedTab
jest.mock('./sharedSettings/ReleaseSection', () => ({
  __esModule: true,
  ReleaseSection: ({ onChange }: any) => (
    <button type="button" onClick={() => onChange('2030-01-01')}>Release</button>
  ),
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

describe('SubsectionSettings', () => {
  beforeEach(() => {
    initializeMocks();
    mutate.mockReset();
  });

  it('renders sections and calls mutate with combined payloads', async () => {
    apiHooks.useCourseDetails.mockReturnValue({ data: { selfPaced: false } });
    apiHooks.useCourseItemData.mockReturnValue({
      data: {
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
      },
      isPending: false,
    });

    const user = userEvent.setup();
    render(<SubsectionSettings subsectionId={subsectionId} />);

    // Clicking Release should call mutate with releaseDate override
    await user.click(await screen.findByRole('button', { name: 'Release' }));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ itemId: subsectionId, sectionId: 'section-abc', releaseDate: '2030-01-01' }));

    // Clicking Visibility should call mutate with visibility change
    await user.click(await screen.findByRole('button', { name: 'Visibility' }));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ itemId: subsectionId, sectionId: 'section-abc', visibility: 'v' }));

    // Grading: clicking Ungraded button should call onChange via setUngraded
    await user.click(await screen.findByRole('button', { name: 'Ungraded' }));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ itemId: subsectionId, graderType: 'notgraded' }));

    // AdvancedTab mock: setFieldValue should call mutate through onChange
    await user.click(await screen.findByRole('button', { name: 'Set Proctored' }));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ itemId: subsectionId, isProctoredExam: true }));
  });

  it('handles grading select, assessment result toggles and prereq parsing', async () => {
    // Use a new itemData shape where graded is false so clicking Graded shows controls
    apiHooks.useCourseDetails.mockReturnValue({ data: { selfPaced: false } });
    apiHooks.useCourseItemData.mockReturnValue({
      data: {
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
        prereqMinScore: '50',
        prereqMinCompletion: '75',
        courseGraders: ['g1', 'g2'],
        graded: false,
      },
      isPending: false,
    });

    const user = userEvent.setup();
    render(<SubsectionSettings subsectionId={subsectionId} />);

    // Click Graded to show controls
    await user.click(await screen.findByRole('button', { name: 'Graded' }));

    // Change grader select to 'g1'
    const select = await screen.findByTestId('grader-type-select');
    await user.selectOptions(select as HTMLSelectElement, 'g1');
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ itemId: subsectionId, graderType: 'g1' }));

    // Click date and time pickers to set dueDate
    await user.click(await screen.findByTestId('due-date-picker'));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ itemId: subsectionId, dueDate: '2025-12-31' }));
    await user.click(await screen.findByTestId('time'));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ itemId: subsectionId, dueDate: '12:00' }));

    // Assessment results: click Show -> should set 'always'
    await user.click(await screen.findByRole('button', { name: 'Show' }));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ itemId: subsectionId, showCorrectness: 'always' }));

    // Click Hide when currently 'always' should change to 'never'
    await user.click(await screen.findByRole('button', { name: 'Hide' }));
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ itemId: subsectionId, showCorrectness: 'never' }));

    // Click checkbox to set past_due
    const checkbox = await screen.findByRole('checkbox');
    await user.click(checkbox);
    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ itemId: subsectionId, showCorrectness: 'past_due' }));
  });

  it('does not render ReleaseSection when course is self paced', () => {
    apiHooks.useCourseDetails.mockReturnValue({ data: { selfPaced: true } });
    apiHooks.useCourseItemData.mockReturnValue({ data: { visibilityState: 'gated', start: null, graded: false }, isPending: false });

    render(<SubsectionSettings subsectionId={subsectionId} />);

    expect(screen.queryByRole('button', { name: 'Release' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Visibility' })).toBeInTheDocument();
  });

  it('does not call mutate when item data is pending', async () => {
    apiHooks.useCourseDetails.mockReturnValue({ data: { selfPaced: false } });
    apiHooks.useCourseItemData.mockReturnValue({ data: { visibilityState: 'gated', start: null, graded: false }, isPending: true });

    const user = userEvent.setup();
    render(<SubsectionSettings subsectionId={subsectionId} />);

    await user.click(screen.getByRole('button', { name: 'Visibility' }));
    expect(mutate).not.toHaveBeenCalled();
  });

  it('sends only changed fields to api when grading changes', async () => {
    apiHooks.useCourseDetails.mockReturnValue({ data: { selfPaced: false } });
    apiHooks.useCourseItemData.mockReturnValue({
      data: {
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
        prereqMinScore: 'abc',
        prereqMinCompletion: 'xyz',
        courseGraders: ['g1', 'g2'],
        graded: true,
      },
      isPending: false,
    });

    const user = userEvent.setup();
    render(<SubsectionSettings subsectionId={subsectionId} />);

    await user.click(await screen.findByRole('button', { name: 'Ungraded' }));

    expect(mutate).toHaveBeenCalledTimes(2);
    expect(mutate).toHaveBeenLastCalledWith({
      itemId: subsectionId,
      sectionId: 'section-abc',
      graderType: 'notgraded',
    });
  });
});
