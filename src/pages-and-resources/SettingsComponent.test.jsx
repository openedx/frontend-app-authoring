import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import PagesAndResourcesProvider from 'CourseAuthoring/pages-and-resources/PagesAndResourcesProvider';
import initializeStore from 'CourseAuthoring/store';
import { RequestStatus } from 'CourseAuthoring/data/constants';
import userEvent from '@testing-library/user-event';
import SettingsComponent from './SettingsComponent';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

jest.mock('CourseAuthoring/utils', () => ({
  useAppSetting: () => [false, () => undefined],
  useIsMobile: () => false,
}));

let store;

// eslint-disable-next-line react/prop-types
const RequiredProviders = ({ children }) => (
  <IntlProvider locale="en" messages={{}}>
    <AppProvider store={store}>
      <PagesAndResourcesProvider courseId="course-v1:foo+bar+baz">
        {children}
      </PagesAndResourcesProvider>
    </AppProvider>
  </IntlProvider>
);

describe('SettingsComponent', () => {
  beforeEach(async () => {
    initializeMockApp();
    store = initializeStore({
      models: {
        courseApps: {
          wiki: {},
        },
      },
      pagesAndResources: {
        loadingStatus: RequestStatus.SUCCESSFUL,
      },
    });
  });

  test('renders LazyLoadedComponent when provided with props', async () => {
    useParams.mockImplementation(() => ({ appId: 'wiki' }));

    render(
      <SettingsComponent url="/some-url" />,
      { wrapper: RequiredProviders },
    );

    await screen.findByText('Configure wiki');

    const modalComponent = screen.getByRole('dialog');
    expect(modalComponent.querySelector('#enable-wiki-toggleHelpText')).toContainHTML('The course wiki can be set up');
  });

  test('navigates to provided url when closing', async () => {
    useParams.mockImplementation(() => ({ appId: 'wiki' }));

    const LocationDisplay = () => {
      const location = useLocation();

      return <div data-testid="location-display">{location.pathname}</div>;
    };
    const user = userEvent.setup();
    render(
      <>
        <SettingsComponent url="/some-url" />
        <LocationDisplay />
      </>,
      { wrapper: RequiredProviders },
    );

    await screen.findByText('Configure wiki');
    const firstLocation = await screen.findByTestId('location-display');
    expect(firstLocation).toHaveTextContent('/');

    const cancelButton = await screen.findByText('Cancel');
    await user.click(cancelButton);
    const secondLocation = await screen.findByTestId('location-display');
    expect(secondLocation).toHaveTextContent('/some-url');
  });

  test('renders error message when plugin is unavilable when provided with props', async () => {
    // Silence noisy error about the plugin failing to load, when we do that deliberately.
    jest.spyOn(console, 'trace').mockImplementation(() => {});
    // Specify an invalid course app, with no matching plugin:
    useParams.mockImplementation(() => ({ appId: 'invalid-plugin' }));

    const rendered = render(
      <SettingsComponent url="/some-url" />,
      { wrapper: RequiredProviders },
    );

    const errorMessage = 'An error occurred when loading the configuration UI';
    await waitFor(() => expect(rendered.container).toHaveTextContent(errorMessage));
  });
});
