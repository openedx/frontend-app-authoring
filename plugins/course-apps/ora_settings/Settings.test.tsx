import {
  screen,
  within,
} from '@testing-library/react';
import ReactDOM from 'react-dom';

import { getCourseAppsApiUrl, getCourseAdvancedSettingsApiUrl } from 'CourseAuthoring/data/api';
import { CourseAuthoringProvider } from 'CourseAuthoring/CourseAuthoringContext';
import { initializeMocks, render } from 'CourseAuthoring/testUtils';
import ORASettings from './Settings';
import messages from './messages';

const courseId = 'course-v1:org+num+run';

let axiosMock;

// Modal creates a portal. Overriding ReactDOM.createPortal allows portals to be tested in jest.
// @ts-ignore
ReactDOM.createPortal = jest.fn(node => node);

const renderComponent = () =>
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <ORASettings onClose={jest.fn()} />
    </CourseAuthoringProvider>,
  );

const mockCourseApps = ({ apiStatus = 200, enabled = true } = {}) => {
  axiosMock.onGet(`${getCourseAppsApiUrl()}/${courseId}`).reply(
    apiStatus,
    [{
      allowed_operations: { enable: false, configure: true },
      description: 'setting',
      documentation_links: { learn_more_configuration: '' },
      enabled,
      id: 'ora_settings',
      name: 'Flexible Peer Grading for ORAs',
    }],
  );
};

const mockAdvancedSettings = ({ enabled = true } = {}) => {
  axiosMock.onGet(`${getCourseAdvancedSettingsApiUrl()}/${courseId}`).reply(
    200,
    { force_on_flexible_peer_openassessments: { value: enabled } },
  );
};

describe('ORASettings', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
  });

  it('Flexible peer grading configuration modal is visible', async () => {
    mockCourseApps();
    mockAdvancedSettings();
    renderComponent();

    expect(await screen.findByRole('dialog')).toBeVisible();
  });

  it('Displays "Configure Flexible Peer Grading" heading', async () => {
    mockCourseApps();
    mockAdvancedSettings();
    renderComponent();

    const headingElement = await screen.findByText(messages.heading.defaultMessage);
    expect(headingElement).toBeVisible();
  });

  it('Displays loading component', () => {
    mockCourseApps();
    mockAdvancedSettings();
    renderComponent();
    const loadingElement = screen.getByRole('status');

    expect(within(loadingElement).getByText('Loading...')).toBeInTheDocument();
  });

  it('Displays Connection Error Alert', async () => {
    mockCourseApps({ apiStatus: 404 });
    renderComponent();

    const errorAlert = await screen.findByRole('alert');
    expect(within(errorAlert).getByText('We encountered a technical error when loading this page.', { exact: false }))
      .toBeVisible();
  });

  it('Displays Permissions Error Alert', async () => {
    mockCourseApps({ apiStatus: 403 });
    renderComponent();

    const errorAlert = await screen.findByRole('alert');
    expect(within(errorAlert).getByText('You are not authorized to view this page', { exact: false })).toBeVisible();
  });

  it('Displays title, helper text and badge when flexible peer grading button is enabled', async () => {
    mockCourseApps();
    mockAdvancedSettings({ enabled: true });
    renderComponent();

    const checkbox = await screen.findByRole('checkbox', { name: /Flex Peer Grading/ });
    expect(checkbox).toBeChecked();
    const label = await screen.findByText(messages.enableFlexPeerGradeLabel.defaultMessage);
    const enableBadge = await screen.findByTestId('enable-badge');
    expect(label).toBeVisible();
    expect(enableBadge).toHaveTextContent('Enabled');
  });

  it('Displays title, helper text and hides badge when flexible peer grading button is disabled', async () => {
    mockCourseApps();
    mockAdvancedSettings({ enabled: false });
    renderComponent();

    const label = await screen.findByText(messages.enableFlexPeerGradeLabel.defaultMessage);
    const enableBadge = screen.queryByTestId('enable-badge');

    expect(label).toBeVisible();
    expect(enableBadge).toBeNull();
  });
});
