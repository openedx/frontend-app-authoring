/* eslint-disable react/jsx-no-constructed-context-values */
import React from 'react';
import {
  render, screen, within, queryAllByRole, waitFor,
} from '@testing-library/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { breakpoints } from '@edx/paragon';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';
import { Context as ResponsiveContext } from 'react-responsive';

import initializeStore from '../../../store';
import { executeThunk } from '../../../utils';
import { getDiscussionsProvidersUrl, getDiscussionsSettingsUrl } from '../data/api';
import { fetchDiscussionSettings, fetchProviders } from '../data/thunks';
import {
  generateProvidersApiResponse,
  piazzaApiResponse,
  legacyApiResponse,
} from '../factories/mockApiResponses';
import AppList from './AppList';
import messages from './messages';

const courseId = 'course-v1:edX+TestX+Test_Course';
let axiosMock;
let store;
let container;

const mockStore = async (mockResponse, provider) => {
  axiosMock.onGet(getDiscussionsProvidersUrl(courseId))
    .reply(200, generateProvidersApiResponse(false, provider));
  axiosMock.onGet(getDiscussionsSettingsUrl(courseId)).reply(200, mockResponse);
  await executeThunk(fetchProviders(courseId), store.dispatch);
  await executeThunk(fetchDiscussionSettings(courseId), store.dispatch);
};

function renderComponent(screenWidth = breakpoints.extraLarge.minWidth) {
  const wrapper = render(
    <AppProvider store={store}>
      <ResponsiveContext.Provider value={{ width: screenWidth }}>
        <IntlProvider locale="en">
          <AppList />
        </IntlProvider>
      </ResponsiveContext.Provider>
    </AppProvider>,
  );
  container = wrapper.container;
}

describe('AppList', () => {
  describe('AppList for Admin role', () => {
    beforeEach(async () => {
      initializeMockApp({
        authenticatedUser: {
          userId: 3,
          username: 'abc123',
          administrator: true,
          roles: [],
        },
      });

      store = await initializeStore();
      axiosMock = new MockAdapter(getAuthenticatedHttpClient());
      await mockStore(piazzaApiResponse);
    });

    test('display a card for each available app', async () => {
      renderComponent();

      await waitFor(async () => {
        const appCount = await store.getState().discussions.appIds.length;
        expect(screen.queryAllByRole('radio')).toHaveLength(appCount);
      });
    });

    test('displays the FeaturesTable at desktop sizes', async () => {
      renderComponent();
      await waitFor(() => expect(screen.queryByRole('table')).toBeInTheDocument());
    });

    test('hides the FeaturesTable at mobile sizes', async () => {
      renderComponent(breakpoints.extraSmall.maxWidth);
      await waitFor(() => expect(screen.queryByRole('table')).not.toBeInTheDocument());
    });

    test('hides the FeaturesList at desktop sizes', async () => {
      renderComponent();
      await waitFor(() => expect(screen.queryByText(messages['supportedFeatureList-mobile-show'].defaultMessage))
        .not.toBeInTheDocument());
    });

    test('displays the FeaturesList at mobile sizes', async () => {
      renderComponent(breakpoints.extraSmall.maxWidth);

      await waitFor(async () => {
        const appCount = await store.getState().discussions.appIds.length;
        expect(screen.queryAllByText(messages['supportedFeatureList-mobile-show'].defaultMessage))
          .toHaveLength(appCount);
      });
    });

    test('selectApp is called when an app is clicked', async () => {
      renderComponent();

      await waitFor(() => {
        userEvent.click(screen.getByLabelText('Select Piazza'));
        const clickedCard = screen.getByRole('radio', { checked: true });
        expect(within(clickedCard).queryByLabelText('Select Piazza')).toBeInTheDocument();
      });
    });
  });

  describe('AppList for Non Admin role', () => {
    beforeEach(async () => {
      initializeMockApp({
        authenticatedUser: {
          userId: 3,
          username: 'abc123',
          administrator: false,
          roles: [],
        },
      });

      store = await initializeStore();
      axiosMock = new MockAdapter(getAuthenticatedHttpClient());
      await mockStore(legacyApiResponse, 'legacy');
    });

    test('does not display two edx providers card for non admin role', async () => {
      renderComponent();
      const appCount = store.getState().discussions.appIds.length;
      await waitFor(() => expect(queryAllByRole(container, 'radio')).toHaveLength(appCount - 1));
    });
  });
});
