import { screen } from '@testing-library/react';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import {
  initializeMocks,
  render,
  within,
} from '../testUtils';
import { getContentStoreApiUrl } from './data/api';
import { groupConfigurationResponseMock } from './__mocks__';
import messages from './messages';
import experimentMessages from './experiment-configurations-section/messages';
import contentGroupsMessages from './content-groups-section/messages';
import GroupConfigurations from '.';

let axiosMock;
const courseId = 'course-v1:org+101+101';
const enrollmentTrackGroups = groupConfigurationResponseMock.allGroupConfigurations[0];
const contentGroups = groupConfigurationResponseMock.allGroupConfigurations[1];
const teamGroups = groupConfigurationResponseMock.allGroupConfigurations[2];

const renderComponent = () =>
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <GroupConfigurations />
    </CourseAuthoringProvider>,
  );

describe('<GroupConfigurations />', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    axiosMock
      .onGet(getContentStoreApiUrl(courseId))
      .reply(200, groupConfigurationResponseMock);
  });

  it('renders component correctly', async () => {
    renderComponent();

    const mainContent = await screen.findByTestId('group-configurations-main-content-wrapper');
    const groupConfigurationsTitle = screen.getAllByText(messages.headingTitle.defaultMessage)[0];

    expect(groupConfigurationsTitle).toBeInTheDocument();
    expect(
      screen.getByText(messages.headingSubtitle.defaultMessage),
    ).toBeInTheDocument();
    expect(
      within(mainContent).getByText(contentGroupsMessages.addNewGroup.defaultMessage),
    ).toBeInTheDocument();
    expect(
      within(mainContent).getByText(experimentMessages.addNewGroup.defaultMessage),
    ).toBeInTheDocument();
    expect(
      within(mainContent).getByText(experimentMessages.title.defaultMessage),
    ).toBeInTheDocument();
    expect(screen.getByText(contentGroups.name)).toBeInTheDocument();
    expect(screen.getByText(enrollmentTrackGroups.name)).toBeInTheDocument();
    expect(screen.getByText(teamGroups.name)).toBeInTheDocument();
  });

  it('does not render an empty section for enrollment track groups if it is empty', async () => {
    const shouldNotShowEnrollmentTrackResponse = {
      ...groupConfigurationResponseMock,
      shouldShowEnrollmentTrack: false,
    };
    axiosMock
      .onGet(getContentStoreApiUrl(courseId))
      .reply(200, shouldNotShowEnrollmentTrackResponse);

    renderComponent();

    await screen.findByTestId('group-configurations-main-content-wrapper');
    expect(
      screen.queryByTestId('group-configurations-empty-placeholder'),
    ).not.toBeInTheDocument();
  });

  it('does not show a connection error when the request fails with a non-403 status', async () => {
    axiosMock
      .onGet(getContentStoreApiUrl(courseId))
      .reply(404);

    renderComponent();

    await screen.findByTestId('group-configurations-main-content-wrapper');
    expect(screen.queryByTestId('connectionErrorAlert')).not.toBeInTheDocument();
  });

  it('displays a connection error alert when API responds with 403', async () => {
    axiosMock
      .onGet(getContentStoreApiUrl(courseId))
      .reply(403);

    renderComponent();

    expect(await screen.findByTestId('connectionErrorAlert')).toBeInTheDocument();
  });
});
