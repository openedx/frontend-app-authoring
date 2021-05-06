import React from 'react';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import {
  queryByText, render, queryAllByRole, queryByRole, getByRole, queryByLabelText, getByLabelText, queryAllByText,
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
import messages from './messages';
import '../../../__mocks__/reactResponsive.mock';

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
    expect(queryByText(container, `${messages.noApps.defaultMessage}`)).toBeInTheDocument();
  });

  test('displays loading state when there is no selected App', () => {
    // render component without mocking data in store
    const component = createComponent();
    const wrapper = render(component);
    container = wrapper.container;
    expect(queryByRole(container, 'status')).toBeInTheDocument();
  });

  test('display a card for each available app', async () => {
    // mock data in redux store
    axiosMock.onGet(getAppsUrl(courseId)).reply(200, piazzaApiResponse);
    await executeThunk(fetchApps(courseId), store.dispatch);
    // render component
    const component = createComponent();
    const wrapper = render(component);
    container = wrapper.container;
    // assert test results
    const appCount = store.getState().discussions.appIds.length;
    expect(queryAllByRole(container, 'radio')).toHaveLength(appCount);
  });

  test('displays the FeaturesTable at desktop sizes', async () => {
    axiosMock.onGet(getAppsUrl(courseId)).reply(200, piazzaApiResponse);
    await executeThunk(fetchApps(courseId), store.dispatch);
    const component = createComponent();
    const wrapper = render(component);
    container = wrapper.container;
    expect(queryByRole(container, 'table')).toBeInTheDocument();
  });

  test('hides the FeaturesTable at mobile sizes', async () => {
    const { debug } = render();
    axiosMock.onGet(getAppsUrl(courseId)).reply(200, piazzaApiResponse);
    await executeThunk(fetchApps(courseId), store.dispatch);
    const component = createComponent(575);
    const wrapper = render(component);
    container = wrapper.container;
    debug(container);
    expect(queryByRole(container, 'table')).not.toBeInTheDocument();
  });

  test('hides the FeaturesList at desktop sizes', async () => {
    axiosMock.onGet(getAppsUrl(courseId)).reply(200, piazzaApiResponse);
    await executeThunk(fetchApps(courseId), store.dispatch);
    const component = createComponent();
    const wrapper = render(component);
    container = wrapper.container;
    expect(queryByText(container, messages['supportedFeatureList-mobile-show'].defaultMessage)).not.toBeInTheDocument();
  });

  test('displays the FeaturesList at mobile sizes', async () => {
    axiosMock.onGet(getAppsUrl(courseId)).reply(200, piazzaApiResponse);
    await executeThunk(fetchApps(courseId), store.dispatch);
    const component = createComponent(575);
    const wrapper = render(component);
    container = wrapper.container;
    const appCount = store.getState().discussions.appIds.length;
    expect(queryAllByText(container, messages['supportedFeatureList-mobile-show'].defaultMessage)).toHaveLength(appCount);
  });

  test('selectApp is called when an app is clicked', async () => {
    // default  mocked data selected legacy app
    axiosMock.onGet(getAppsUrl(courseId)).reply(200, legacyApiResponse);
    await executeThunk(fetchApps(courseId), store.dispatch);
    // render component with mock data
    const component = createComponent();
    const wrapper = render(component);
    container = wrapper.container;
    // check if default selected is legacy app
    const selectedDefault = getByRole(container, 'radio', { checked: true });
    expect(queryByLabelText(selectedDefault, 'Select edX Discussions')).toBeInTheDocument();
    // select an unchecked app e.g piazza
    const uncheckedOption = getByLabelText(container, 'Select Piazza');
    // click the piazza card
    userEvent.click(uncheckedOption);
    // get checked option and assert that checked option is piazza
    const clickedCard = getByRole(container, 'radio', { checked: true });
    expect(queryByLabelText(clickedCard, 'Select Piazza')).toBeInTheDocument();
  });
});
