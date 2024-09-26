import {
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import ReactDOM from 'react-dom';
import { Routes, Route, MemoryRouter } from 'react-router-dom';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider, PageWrap } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import initializeStore from 'CourseAuthoring/store';
import { executeThunk } from 'CourseAuthoring/utils';
import PagesAndResourcesProvider from 'CourseAuthoring/pages-and-resources/PagesAndResourcesProvider';
import { getCourseAppsApiUrl, getCourseAdvancedSettingsApiUrl } from 'CourseAuthoring/pages-and-resources/data/api';
import { fetchCourseApps, fetchCourseAppSettings } from 'CourseAuthoring/pages-and-resources/data/thunks';
import ORASettings from './Settings';
import messages from './messages';
import {
  courseId,
  inititalState,
} from './factories/mockData';

let axiosMock;
let store;
const oraSettingsUrl = `/course/${courseId}/pages-and-resources/live/settings`;

// Modal creates a portal. Overriding ReactDOM.createPortal allows portals to be tested in jest.
ReactDOM.createPortal = jest.fn(node => node);

const renderComponent = () => (
  render(
    <IntlProvider locale="en">
      <AppProvider store={store} wrapWithRouter={false}>
        <PagesAndResourcesProvider courseId={courseId}>
          <MemoryRouter initialEntries={[oraSettingsUrl]}>
            <Routes>
              <Route path={oraSettingsUrl} element={<PageWrap><ORASettings onClose={jest.fn()} /></PageWrap>} />
            </Routes>
          </MemoryRouter>
        </PagesAndResourcesProvider>
      </AppProvider>
    </IntlProvider>,
  )
);

const mockStore = async ({
  apiStatus,
  enabled,
}) => {
  const settings = ['forceOnFlexiblePeerOpenassessments'];
  const fetchCourseAppsUrl = `${getCourseAppsApiUrl()}/${courseId}`;
  const fetchAdvancedSettingsUrl = `${getCourseAdvancedSettingsApiUrl()}/${courseId}`;

  axiosMock.onGet(fetchCourseAppsUrl).reply(
    200,
    [{
      allowed_operations: { enable: false, configure: true },
      description: 'setting',
      documentation_links: { learnMoreConfiguration: '' },
      enabled,
      id: 'ora_settings',
      name: 'Flexible Peer Grading for ORAs',
    }],
  );
  axiosMock.onGet(fetchAdvancedSettingsUrl).reply(
    apiStatus,
    { force_on_flexible_peer_openassessments: { value: enabled } },
  );

  await executeThunk(fetchCourseApps(courseId), store.dispatch);
  await executeThunk(fetchCourseAppSettings(courseId, settings), store.dispatch);
};

describe('ORASettings', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: false,
        roles: [],
      },
    });
    store = initializeStore(inititalState);
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  it('Flexible peer grading configuration modal is visible', async () => {
    renderComponent();
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('Displays "Configure Flexible Peer Grading" heading', async () => {
    renderComponent();
    const headingElement = screen.getByText(messages.heading.defaultMessage);

    expect(headingElement).toBeVisible();
  });

  it('Displays loading component', () => {
    renderComponent();
    const loadingElement = screen.getByRole('status');

    expect(within(loadingElement).getByText('Loading...')).toBeInTheDocument();
  });

  it('Displays Connection Error Alert', async () => {
    await mockStore({ apiStatus: 404, enabled: true });
    renderComponent();
    const errorAlert = screen.getByRole('alert');

    expect(within(errorAlert).getByText('We encountered a technical error when loading this page.', { exact: false })).toBeVisible();
  });

  it('Displays Permissions Error Alert', async () => {
    await mockStore({ apiStatus: 403, enabled: true });
    renderComponent();
    const errorAlert = screen.getByRole('alert');

    expect(within(errorAlert).getByText('You are not authorized to view this page', { exact: false })).toBeVisible();
  });

  it('Displays title, helper text and badge when flexible peer grading button is enabled', async () => {
    renderComponent();
    await mockStore({ apiStatus: 200, enabled: true });

    waitFor(() => {
      const label = screen.getByText(messages.enableFlexPeerGradeLabel.defaultMessage);
      const enableBadge = screen.getByTestId('enable-badge');

      expect(label).toBeVisible();

      expect(enableBadge).toHaveTextContent('Enabled');
    });
  });

  it('Displays title, helper text and hides badge when flexible peer grading button is disabled', async () => {
    renderComponent();
    await mockStore({ apiStatus: 200, enabled: false });

    const label = screen.getByText(messages.enableFlexPeerGradeLabel.defaultMessage);
    const enableBadge = screen.queryByTestId('enable-badge');

    expect(label).toBeVisible();

    expect(enableBadge).toBeNull();
  });
});
