import { VIDEO_SHARING_OPTIONS } from '@src/course-outline/constants';
import { CourseOutlineStatusBar } from '@src/course-outline/data/types';
import { initializeMocks, render, screen } from '@src/testUtils';
import { StatusBar, StatusBarProps } from './StatusBar';
import messages from './messages';

const courseId = 'course-v1:123';
const isLoading = false;

const statusBarData: CourseOutlineStatusBar = {
  courseReleaseDate: 'Feb 05, 2013 at 05:00 UTC',
  isSelfPaced: true,
  endDate: '2013-04-09T00:00:00Z',
  checklist: {
    totalCourseLaunchChecks: 5,
    completedCourseLaunchChecks: 1,
    totalCourseBestPracticesChecks: 4,
    completedCourseBestPracticesChecks: 1,
  },
  highlightsEnabledForMessaging: true,
  videoSharingEnabled: true,
  videoSharingOptions: VIDEO_SHARING_OPTIONS.allOn,
};

jest.mock('@src/course-libraries/data/apiHooks', () => ({
  useEntityLinksSummaryByDownstreamContext: () => ({
    data: [{ readyToSyncCount: 2 }],
    isLoading: false,
  }),
}));

let mockHasChanges = false;
jest.mock('@src/course-outline/data/apiHooks', () => ({
  useCourseDetails: () => ({
    data: [{ hasChanges: mockHasChanges }],
    isLoading: false,
  }),
}));

const renderComponent = (props?: Partial<StatusBarProps>) => render(
  <StatusBar
    courseId={courseId}
    isLoading={isLoading}
    statusBarData={statusBarData}
    {...props}
  />,
);

describe('<StatusBar />', () => {
  beforeEach(() => {
    initializeMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2013-03-05'));
  });

  it('renders StatusBar component correctly', async () => {
    renderComponent();

    expect(await screen.findByText('Feb 05, 2013 - Apr 09, 2013')).toBeInTheDocument();
    expect(await screen.findByText(`2/9 ${messages.checklistCompleted.defaultMessage}`)).toBeInTheDocument();
    expect(await screen.findByText('Active')).toBeInTheDocument();
  });

  it('renders Archived Badge', async () => {
    jest.setSystemTime(new Date('2014-03-05'));
    renderComponent();
    expect(await screen.findByText('Archived')).toBeInTheDocument();
  });

  it('renders Upcoming Badge', async () => {
    jest.setSystemTime(new Date('2012-03-05'));
    renderComponent();
    expect(await screen.findByText('Upcoming')).toBeInTheDocument();
  });

  it('renders set date link if date is not set', async () => {
    renderComponent({
      statusBarData: {
        ...statusBarData,
        courseReleaseDate: 'Set Date',
      },
    });
    expect(await screen.findByText('Set Date')).toBeInTheDocument();
  });

  it('not render component when isLoading is true', async () => {
    renderComponent({ isLoading: true });

    expect(await screen.findByTestId('redux-provider')).toBeEmptyDOMElement();
  });

  it('renders unpublished badge', async () => {
    mockHasChanges = true;
    renderComponent();
    expect(await screen.findByText('Unpublished Changes')).toBeInTheDocument();
  });

  it('renders library updates', async () => {
    renderComponent();
    expect(await screen.findByText('2 Library Updates')).toBeInTheDocument();
  });

  it('hides checklist if completed', async () => {
    renderComponent({
      statusBarData: {
        ...statusBarData,
        checklist: {
          totalCourseLaunchChecks: 5,
          completedCourseLaunchChecks: 5,
          totalCourseBestPracticesChecks: 4,
          completedCourseBestPracticesChecks: 4,
        },
      },
    });
    // wait for render
    expect(await screen.findByText('Feb 05, 2013 - Apr 09, 2013')).toBeInTheDocument();
    expect(screen.queryByText(`9/9 ${messages.checklistCompleted.defaultMessage}`)).toBeNull();
  });
});
