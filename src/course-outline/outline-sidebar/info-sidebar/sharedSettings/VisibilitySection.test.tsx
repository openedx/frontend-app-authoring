import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';
import userEvent from '@testing-library/user-event';
import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import { VisibilityTypes } from '@src/data/constants';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { VisibilitySection } from './VisibilitySection';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';

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

const WrapperProvider = ({ children }) => (
  <CourseAuthoringProvider courseId={'courseId'}>{children}</CourseAuthoringProvider>
);
const renderWithWrapper = (children) => {
  render(children, {
    extraWrapper: WrapperProvider,
  });
};

let validateUserPermissionsMock;

describe('VisibilitySection component', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    mockUseCourseItemData.mockReturnValue({ data: undefined });
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    validateUserPermissionsMock = mocks.validateUserPermissionsMock;
    validateUserPermissionsMock.mockResolvedValue({
      canEditCourseContent: true,
    });
  });

  it('renders title and buttons', async () => {
    renderWithWrapper(<VisibilitySection {...defaultProps} />);
    expect(await screen.findByText('Visibility')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Student Visible' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Staff Only' })).toBeInTheDocument();
  });

  it('clicking staff only calls onChange with staff and hideAfterDue false', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    renderWithWrapper(<VisibilitySection {...defaultProps} onChange={onChange} />);

    await user.click(await screen.findByRole('button', { name: 'Staff Only' }));
    await waitFor(async () => {
      expect(onChange).toHaveBeenCalledWith({ isVisibleToStaffOnly: true, hideAfterDue: false });
    });
  });

  it('clicking student visible calls onChange with isVisibleToStaffOnly false', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    mockUseCourseItemData.mockReturnValue({ data: { visibilityState: VisibilityTypes.STAFF_ONLY } });
    renderWithWrapper(<VisibilitySection {...defaultProps} onChange={onChange} />);

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
    renderWithWrapper(<VisibilitySection {...defaultProps} onChange={onChange} />);

    const checkbox = await screen.findByRole('checkbox');
    await user.click(checkbox);
    await waitFor(async () => {
      expect(onChange).toHaveBeenCalledWith({ hideAfterDue: true, isVisibleToStaffOnly: false });
    });
  });

  it('strips hideAfterDue from the payload when not a subsection', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    mockUseCourseItemData.mockReturnValue({ data: { visibilityState: undefined, hideAfterDue: true } });
    renderWithWrapper(<VisibilitySection {...defaultProps} isSubsection={false} onChange={onChange} />);

    await user.click(await screen.findByRole('button', { name: 'Staff Only' }));
    await waitFor(async () => {
      expect(onChange).toHaveBeenCalledWith({ isVisibleToStaffOnly: true });
    });
  });

  it('hides checkbox when staff visible', async () => {
    const onChange = jest.fn();
    // when item is staff only, checkbox should not be present
    mockUseCourseItemData.mockReturnValue({ data: { visibilityState: VisibilityTypes.STAFF_ONLY } });
    renderWithWrapper(<VisibilitySection {...defaultProps} onChange={onChange} />);
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('disables both visibility buttons when the user cannot edit course content', async () => {
    validateUserPermissionsMock.mockResolvedValue({
      canEditCourseContent: false,
    });
    renderWithWrapper(<VisibilitySection {...defaultProps} />);

    expect(await screen.findByRole('button', { name: 'Student Visible' })).toBeDisabled();
    expect(await screen.findByRole('button', { name: 'Staff Only' })).toBeDisabled();
  });

  it('disables the hide-after-due checkbox when the user cannot edit course content', async () => {
    validateUserPermissionsMock.mockResolvedValue({
      canEditCourseContent: false,
    });
    mockUseCourseItemData.mockReturnValue({ data: { visibilityState: undefined, hideAfterDue: false } });
    renderWithWrapper(<VisibilitySection {...defaultProps} />);

    expect(await screen.findByRole('checkbox')).toBeDisabled();
  });
});
