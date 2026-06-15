import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import { VisibilityTypes } from '@src/data/constants';
import { VisibilitySection } from './VisibilitySection';

jest.mock('@src/course-outline/data/apiHooks', () => ({
  ...jest.requireActual('@src/course-outline/data/apiHooks'),
  useCourseItemData: jest.fn(),
}));

const mockUseCourseItemData = useCourseItemData as jest.Mock;

const defaultProps = {
  itemId: 'block-v1:course+type@sequential+block@test',
  isSubsection: true,
  onChange: jest.fn(),
};

describe('VisibilitySection component', () => {
  beforeEach(() => {
    initializeMocks();
    mockUseCourseItemData.mockReturnValue({ data: undefined });
  });

  it('renders title and buttons', async () => {
    render(<VisibilitySection {...defaultProps} />);
    expect(await screen.findByText('Visibility')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Student Visible' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Staff Only' })).toBeInTheDocument();
  });

  it('clicking staff only calls onChange with staff and hideAfterDue false', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<VisibilitySection {...defaultProps} onChange={onChange} />);

    await user.click(await screen.findByRole('button', { name: 'Staff Only' }));
    await waitFor(async () => {
      expect(onChange).toHaveBeenCalledWith({ isVisibleToStaffOnly: true, hideAfterDue: false });
    });
  });

  it('clicking student visible calls onChange with isVisibleToStaffOnly false', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    mockUseCourseItemData.mockReturnValue({ data: { visibilityState: VisibilityTypes.STAFF_ONLY } });
    render(<VisibilitySection {...defaultProps} onChange={onChange} />);

    await user.click(await screen.findByRole('button', { name: 'Student Visible' }));
    await waitFor(async () => {
      expect(onChange).toHaveBeenCalledWith({ isVisibleToStaffOnly: false });
    });
  });

  it('shows checkbox when subsection and not staff only, and toggling it calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    // initial data not staff only
    mockUseCourseItemData.mockReturnValue({ data: { visibilityState: undefined, hideAfterDue: false } });
    render(<VisibilitySection {...defaultProps} onChange={onChange} />);

    const checkbox = await screen.findByRole('checkbox');
    await user.click(checkbox);
    await waitFor(async () => {
      expect(onChange).toHaveBeenCalledWith({ hideAfterDue: true, isVisibleToStaffOnly: false });
    });
  });

  it('hides checkbox when staff visible', async () => {
    const onChange = jest.fn();
    // when item is staff only, checkbox should not be present
    mockUseCourseItemData.mockReturnValue({ data: { visibilityState: VisibilityTypes.STAFF_ONLY } });
    render(<VisibilitySection {...defaultProps} onChange={onChange} />);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('syncs displayed visibility when itemData changes externally without calling onChange', async () => {
    // Start as staff-only: checkbox must not be present
    mockUseCourseItemData.mockReturnValue({ data: { visibilityState: VisibilityTypes.STAFF_ONLY } });
    const onChange = jest.fn();
    const { rerender } = render(<VisibilitySection {...defaultProps} onChange={onChange} />);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();

    // Simulate the kebab-menu configure modal switching to student-visible:
    // the mutation fires, the section refetches, and setQueryData updates the
    // subsection cache — causing useCourseItemData to return the new state.
    mockUseCourseItemData.mockReturnValue({ data: { visibilityState: undefined, hideAfterDue: false } });
    rerender(<VisibilitySection {...defaultProps} onChange={onChange} />);

    // Sidebar must now show the checkbox (only visible when student-visible)...
    expect(await screen.findByRole('checkbox')).toBeInTheDocument();
    // ...but must NOT trigger onChange (which would fire a redundant mutation)
    expect(onChange).not.toHaveBeenCalled();
  });

  it('syncs hideAfterDue checkbox state when itemData changes externally without calling onChange', async () => {
    // Start with hideAfterDue unchecked
    mockUseCourseItemData.mockReturnValue({ data: { visibilityState: undefined, hideAfterDue: false } });
    const onChange = jest.fn();
    const { rerender } = render(<VisibilitySection {...defaultProps} onChange={onChange} />);
    expect(await screen.findByRole('checkbox')).not.toBeChecked();

    // External update sets hideAfterDue to true (e.g. saved via kebab configure modal)
    mockUseCourseItemData.mockReturnValue({ data: { visibilityState: undefined, hideAfterDue: true } });
    rerender(<VisibilitySection {...defaultProps} onChange={onChange} />);

    expect(await screen.findByRole('checkbox')).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });
});
