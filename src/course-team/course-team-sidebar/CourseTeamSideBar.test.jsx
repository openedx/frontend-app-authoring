// @ts-check
import { initializeMocks, render } from '../../testUtils';
import CourseTeamSidebar from './CourseTeamSidebar';
import messages from './messages';

const courseId = 'course-123';

const renderComponent = (props) => render(<CourseTeamSidebar courseId={courseId} {...props} />);

describe('<CourseTeamSidebar />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('render CourseTeamSidebar component correctly', () => {
    const { getByText } = renderComponent();

    expect(getByText(messages.sidebarTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.sidebarAbout_1.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.sidebarAbout_2.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.sidebarAbout_3.defaultMessage)).toBeInTheDocument();
  });

  it('renders CourseTeamSidebar component based on support email variable', () => {
    const { getByText } = renderComponent();
    const courseTeamSupportEmail = process.env.COURSE_TEAM_SUPPORT_EMAIL;

    if (courseTeamSupportEmail) {
      expect(getByText(messages.helpInfoSidebarTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(courseTeamSupportEmail)).toBeInTheDocument();
      expect(getByText(/to add, remove, or update user access in bulk\./i)).toBeInTheDocument();
    } else {
      expect(getByText(messages.helpInfoSidebarTitle.defaultMessage)).not.toBeInTheDocument();
      expect(getByText(/to add, remove, or update user access in bulk\./i)).not.toBeInTheDocument();
    }
  });

  it('render CourseTeamSidebar when isOwnershipHint is true', () => {
    const { getByText } = renderComponent({ isOwnershipHint: true });

    expect(getByText(messages.ownershipTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(
      'Every course must have an Admin. If you are the Admin and you want to transfer ownership of the course, click to make another user the Admin, then ask that user to remove you from the Course Team list.',
    )).toBeInTheDocument();
  });
});
