import MockAdapter from 'axios-mock-adapter';
import { render, waitFor, within } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { RequestStatus } from '../data/constants';
import initializeStore from '../store';
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

const renderComponent = () => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <GroupConfigurations courseId={courseId} />
    </IntlProvider>
  </AppProvider>,
);

describe('<GroupConfigurations />', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
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
    });
  });

  it('does not render an empty section for enrollment track groups if it is empty', () => {
    const shouldNotShowEnrollmentTrackResponse = {
      ...groupConfigurationResponseMock,
      shouldShowEnrollmentTrack: false,
    };
    axiosMock
      .onGet(getContentStoreApiUrl(courseId))
      .reply(200, shouldNotShowEnrollmentTrackResponse);

    const { queryByTestId } = renderComponent();
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
