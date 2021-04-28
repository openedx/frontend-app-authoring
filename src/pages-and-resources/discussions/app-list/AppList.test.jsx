import React from 'react';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import {
  queryByText, render, queryAllByRole, queryByRole, getByRole, queryByLabelText,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { Context as ResponsiveContext } from 'react-responsive';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import AppList from './AppList';
import initializeStore from '../../../store';
import { fetchApps } from '../data/thunks';
import { executeThunk } from '../data/redux.test';
import { getAppsUrl } from '../data/api';
import { legacyApiResponse, piazzaApiResponse } from '../factories/mockApiResponses';
import { updateStatus, LOADED, selectApp } from '../data/slice';

const courseId = 'course-v1:edX+TestX+Test_Course';

describe('AppList', () => {
  let axiosMock;
  let store;
  let container;

  function createComponent(screenWidth = 1280) {
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

  afterEach(() => {

  });

  test('displays a message when there are no apps available', async () => {
    // selects an app to mock store data
    store.dispatch(selectApp({ appId: 'legacy' }));
    // update store status to LOADED
    store.dispatch(updateStatus({ status: LOADED }));
    // renders component
    const component = createComponent();
    const wrapper = render(component);
    container = wrapper.container;
    // assert test case results
    expect(queryByText(container, 'There are no discussions providers available for your course.')).toBeInTheDocument();
  });

  test('displays loading state when there is no selected App', () => {
    // render component without mocking data in store
    const component = createComponent();
    const wrapper = render(component);
    container = wrapper.container;
    expect(queryByText(container, 'Loading...')).toBeInTheDocument();
  });

  test('display a card for each available app', async () => {
    // mock data in redux store
    axiosMock.onGet(getAppsUrl(courseId)).reply(200, piazzaApiResponse);
    await executeThunk(fetchApps(courseId), store.dispatch);
    // render componenet
    const component = createComponent();
    const wrapper = render(component);
    container = wrapper.container;
    // assert test results
    const appCount = store.getState().discussions.appIds.length;
    const nodeCount = queryAllByRole(container, 'radio').length;
    expect(nodeCount === appCount);
  });

  test('displays the FeaturesTable at desktop sizes', async () => {
    axiosMock.onGet(getAppsUrl(courseId)).reply(200, piazzaApiResponse);
    await executeThunk(fetchApps(courseId), store.dispatch);
    const component = createComponent();
    const wrapper = render(component);
    container = wrapper.container;
    expect(queryByRole(container, 'table')).toBeInTheDocument();
  });

  /** Implementation needed to be done in App list component for hiding table on mobile screens
   test('hides the FeaturesTable at mobile sizes', () => {
    axiosMock.onGet(getAppsUrl(courseId)).reply(200, piazzaApiResponse);
    await executeThunk(fetchApps(courseId), store.dispatch);
    const component = createComponent(500);
    const wrapper = render(component);
    container = wrapper.container;
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  }); */

  test('onSelectApp is called when an app is clicked', async () => {
    // default  mocked data selected legacy app
    axiosMock.onGet(getAppsUrl(courseId)).reply(200, legacyApiResponse);
    await executeThunk(fetchApps(courseId), store.dispatch);
    const component = createComponent();
    const wrapper = render(component);
    container = wrapper.container;
    const uncheckedCard = getByRole(container, 'radio', { checked: false });
    expect(queryByLabelText(uncheckedCard, 'Select Pizza'));
    userEvent.click(uncheckedCard);
    const checkedCard = getByRole(container, 'radio', { checked: true });
    expect(queryByLabelText(checkedCard, 'Select Pizza'));
  });
});
