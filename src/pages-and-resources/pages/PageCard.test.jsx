import {
  render,
  queryAllByRole,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp, getConfig } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import initializeStore from '../../store';
import PageGrid from './PageGrid';
import { executeThunk } from '../../utils';
import { getApiWaffleFlagsUrl } from '../../data/api';
import { fetchWaffleFlags } from '../../data/thunks';

import PagesAndResourcesProvider from '../PagesAndResourcesProvider';

let container;
let store;
let axiosMock;
const courseId = '123';
const mockPageConfig = [
  {
    id: '1',
    legacyLink: `${getConfig().STUDIO_BASE_URL}/tabs/course-v1:OpenedX+DemoX+DemoCourse`,
    name: 'Custom pages',
  },
  {
    id: '2',
    legacyLink: `${getConfig().STUDIO_BASE_URL}/textbooks/course-v1:OpenedX+DemoX+DemoCourse`,
    name: 'Textbook',
    enabled: true,
  },
  {
    name: 'Page',
    allowedOperations: {
      enable: true,
    },
    id: '3',
  },
];

const renderComponent = () => {
  const wrapper = render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <PagesAndResourcesProvider courseId={courseId}>
          <PageGrid pages={mockPageConfig} />
        </PagesAndResourcesProvider>
      </AppProvider>
    </IntlProvider>,
  );
  container = wrapper.container;
};

describe('LiveSettings', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: false,
        roles: [],
      },
    });
    store = initializeStore({
      courseDetail: {
        courseId: 'id',
        status: 'sucessful',
      },
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock
      .onGet(getApiWaffleFlagsUrl(courseId))
      .reply(200, {
        useNewGradingPage: true,
        useNewCertificatesPage: true,
        useNewScheduleDetailsPage: true,
        useNewCourseOutlinePage: true,
      });
    await executeThunk(fetchWaffleFlags(courseId), store.dispatch);
  });

  it('should render three cards', async () => {
    renderComponent();
    expect(queryAllByRole(container, 'button')).toHaveLength(3);
  });

  it('should navigate to legacyLink', async () => {
    renderComponent();
    const textbookPagePath = mockPageConfig[0][1];
    const textbookSettingsButton = queryAllByRole(container, 'link')[1];
    expect(textbookSettingsButton).toHaveAttribute('href', textbookPagePath);
  });
});
