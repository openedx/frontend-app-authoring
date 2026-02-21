import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import {
  initializeMocks,
  render,
  waitFor,
  within,
} from '../testUtils';
import { RequestStatus } from '../data/constants';
import { executeThunk } from '../utils';
import { getContentStoreApiUrl } from './data/api';
import { fetchGroupConfigurationsQuery } from './data/thunk';
import { groupConfigurationResponseMock } from './__mocks__';
import messages from './messages';
import experimentMessages from './experiment-configurations-section/messages';
import contentGroupsMessages from './content-groups-section/messages';
import GroupConfigurations from '.';

let axiosMock;
let store;
const courseId = 'course-v1:org+101+101';
const enrollmentTrackGroups = groupConfigurationResponseMock.allGroupConfigurations[0];
const contentGroups = groupConfigurationResponseMock.allGroupConfigurations[1];
const teamGroups = groupConfigurationResponseMock.allGroupConfigurations[2];

const renderComponent = () => render(
  <CourseAuthoringProvider courseId={courseId}>
    <GroupConfigurations />
  </CourseAuthoringProvider>,
);

describe('<GroupConfigurations />', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();
    store = mocks.reduxStore;
    axiosMock = mocks.axiosMock;
    axiosMock
      .onGet(getContentStoreApiUrl(courseId))
      .reply(200, groupConfigurationResponseMock);
    await executeThunk(fetchGroupConfigurationsQuery(courseId), store.dispatch);
  });

  it('renders component correctly', async () => {
    const { getByText, getAllByText, getByTestId } = renderComponent();

    await waitFor(() => {
      const mainContent = getByTestId('group-configurations-main-content-wrapper');
      const groupConfigurationsElements = getAllByText(messages.headingTitle.defaultMessage);
      const groupConfigurationsTitle = groupConfigurationsElements[0];

      expect(groupConfigurationsTitle).toBeInTheDocument();
      expect(
        getByText(messages.headingSubtitle.defaultMessage),
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
      expect(getByText(contentGroups.name)).toBeInTheDocument();
      expect(getByText(enrollmentTrackGroups.name)).toBeInTheDocument();
      expect(getByText(teamGroups.name)).toBeInTheDocument();
    });
  });

  it('does not render an empty section for enrollment track groups if it is empty', async () => {
    const shouldNotShowEnrollmentTrackResponse = {
      ...groupConfigurationResponseMock,
      shouldShowEnrollmentTrack: false,
    };
    axiosMock
      .onGet(getContentStoreApiUrl(courseId))
      .reply(200, shouldNotShowEnrollmentTrackResponse);

    const { queryByTestId, findByTestId } = renderComponent();

    await findByTestId('group-configurations-main-content-wrapper');
    expect(
      queryByTestId('group-configurations-empty-placeholder'),
    ).not.toBeInTheDocument();
  });

  it('updates loading status if request fails', async () => {
    axiosMock
      .onGet(getContentStoreApiUrl(courseId))
      .reply(404, groupConfigurationResponseMock);

    renderComponent();

    await executeThunk(fetchGroupConfigurationsQuery(courseId), store.dispatch);

    expect(store.getState().groupConfigurations.loadingStatus).toBe(
      RequestStatus.FAILED,
    );
  });

  it('displays an alert and sets status to DENIED when API responds with 403', async () => {
    axiosMock
      .onGet(getContentStoreApiUrl(courseId))
      .reply(403);

    await executeThunk(fetchGroupConfigurationsQuery(courseId), store.dispatch);

    const { getByTestId } = renderComponent();

    await waitFor(() => {
      expect(getByTestId('connectionErrorAlert')).toBeInTheDocument();
      expect(store.getState().groupConfigurations.loadingStatus).toBe(
        RequestStatus.DENIED,
      );
    });
  });
});
