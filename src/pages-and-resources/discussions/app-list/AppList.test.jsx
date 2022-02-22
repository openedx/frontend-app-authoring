import React from 'react';

import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { breakpoints } from '@edx/paragon';
import {
  queryByText, render, queryAllByRole, queryByRole, getByRole, queryByLabelText, getByLabelText, queryAllByText,
} from '@testing-library/react';
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
} from '../factories/mockApiResponses';
import AppList from './AppList';
import messages from './messages';

const courseId = 'course-v1:edX+TestX+Test_Course';

describe('AppList', () => {
  let axiosMock;
  let store;
  let container;

  function createComponent(screenWidth = breakpoints.extraLarge.minWidth) {
    return (
      <AppProvider store={store}>
        <ResponsiveContext.Provider value={{ width: screenWidth }}>
          <IntlProvider locale="en" messages={{}}>
            <AppList />
          </IntlProvider>
        </ResponsiveContext.Provider>
      </AppProvider>
    );
  }

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
  });

  const mockStore = async (mockResponse, screenWidth = breakpoints.extraLarge.minWidth) => {
    axiosMock.onGet(getDiscussionsProvidersUrl(courseId)).reply(200, generateProvidersApiResponse());
    axiosMock.onGet(getDiscussionsSettingsUrl(courseId)).reply(200, mockResponse);
    await executeThunk(fetchProviders(courseId), store.dispatch);
    await executeThunk(fetchDiscussionSettings(courseId), store.dispatch);
    const component = createComponent(screenWidth);
    const wrapper = render(component);
    container = wrapper.container;
  };

  test('display a card for each available app', async () => {
    await mockStore(piazzaApiResponse);
    const appCount = store.getState().discussions.appIds.length;
    expect(queryAllByRole(container, 'radio')).toHaveLength(appCount);
  });

  test('displays the FeaturesTable at desktop sizes', async () => {
    await mockStore(piazzaApiResponse);
    expect(queryByRole(container, 'table')).toBeInTheDocument();
  });

  test('hides the FeaturesTable at mobile sizes', async () => {
    await mockStore(piazzaApiResponse, breakpoints.extraSmall.maxWidth);
    expect(queryByRole(container, 'table')).not.toBeInTheDocument();
  });

  test('hides the FeaturesList at desktop sizes', async () => {
    await mockStore(piazzaApiResponse);
    expect(queryByText(container, messages['supportedFeatureList-mobile-show'].defaultMessage)).not.toBeInTheDocument();
  });

  test('displays the FeaturesList at mobile sizes', async () => {
    await mockStore(piazzaApiResponse, breakpoints.extraSmall.maxWidth);
    const appCount = store.getState().discussions.appIds.length;
    expect(queryAllByText(container, messages['supportedFeatureList-mobile-show'].defaultMessage)).toHaveLength(appCount);
  });

  test('selectApp is called when an app is clicked', async () => {
    await mockStore(piazzaApiResponse);
    userEvent.click(getByLabelText(container, 'Select Piazza'));
    const clickedCard = getByRole(container, 'radio', { checked: true });
    expect(queryByLabelText(clickedCard, 'Select Piazza')).toBeInTheDocument();
  });
});
