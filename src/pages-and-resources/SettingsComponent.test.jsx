import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import PagesAndResourcesProvider from 'CourseAuthoring/pages-and-resources/PagesAndResourcesProvider';
import initializeStore from 'CourseAuthoring/store';
import { RequestStatus } from 'CourseAuthoring/data/constants';
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

    const rendered = render(
      <Suspense fallback="...">
        <SettingsComponent url="/some-url" />
      </Suspense>,
      { wrapper: RequiredProviders },
    );

    await waitFor(() => expect(rendered.getByText('Configure wiki')).toBeInTheDocument());

    const modalComponent = screen.getByRole('dialog');
    expect(modalComponent.querySelector('#enable-wiki-toggleHelpText')).toContainHTML('The course wiki can be set up');
  });

  test('renders error message when plugin is unavilable when provided with props', async () => {
    // Silence noisy error about the plugin failing to load, when we do that deliberately.
    jest.spyOn(console, 'trace').mockImplementation(() => {});
    // Specify an invalid course app, with no matching plugin:
    useParams.mockImplementation(() => ({ appId: 'invalid-plugin' }));

    const rendered = render(
      <Suspense fallback="...">
        <SettingsComponent url="/some-url" />
      </Suspense>,
      { wrapper: RequiredProviders },
    );

    const errorMessage = 'An error occurred when loading the configuration UI';
    await waitFor(() => expect(rendered.container).toHaveTextContent(errorMessage));
  });
});
