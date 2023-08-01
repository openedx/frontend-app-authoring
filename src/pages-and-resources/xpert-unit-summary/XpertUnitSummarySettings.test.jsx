import ReactDOM from 'react-dom';
import React from 'react';
import { Switch } from 'react-router';
import {
  getConfig, history, initializeMockApp, setConfig,
} from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider, PageRoute } from '@edx/frontend-platform/react';
import {
  queryByTestId, render, waitFor, getByText, fireEvent,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import PagesAndResourcesProvider from '../PagesAndResourcesProvider';
import { XpertUnitSummarySettings } from './index';
import initializeStore from '../../store';
import * as API from './data/api';
import * as Thunks from './data/thunks';
import { executeThunk } from '../../utils';

const courseId = 'course-v1:edX+TestX+Test_Course';
let axiosMock;
let store;
let container;

// Modal creates a portal. Overriding ReactDOM.createPortal allows portals to be tested in jest.
ReactDOM.createPortal = jest.fn(node => node);

function renderComponent() {
  const wrapper = render(
    <AppProvider store={store}>
      <PagesAndResourcesProvider courseId={courseId}>
        <Switch>
          <PageRoute
            path={[
              '/xpert-unit-summary/settings',
            ]}
          >
            <XpertUnitSummarySettings courseId={courseId} />
          </PageRoute>

          <PageRoute
            path={[
              '/',
            ]}
          >
            <div />
          </PageRoute>
        </Switch>
      </PagesAndResourcesProvider>
    </AppProvider>,
  );
  container = wrapper.container;
}

function generateCourseLevelAPIRepsonse({
  success, enabled,
}) {
  return {
    response: {
      success, enabled,
    },
  };
}

describe('XpertUnitSummarySettings', () => {
  beforeEach(() => {
    setConfig({
      ...getConfig(),
      BASE_URL: 'http://test.edx.org',
      LMS_BASE_URL: 'http://lmstest.edx.org',
      CMS_BASE_URL: 'http://cmstest.edx.org',
      LOGIN_URL: 'http://support.edx.org/login',
      LOGOUT_URL: 'http://support.edx.org/logout',
      REFRESH_ACCESS_TOKEN_ENDPOINT: 'http://support.edx.org/access_token',
      ACCESS_TOKEN_COOKIE_NAME: 'cookie',
      CSRF_TOKEN_API_PATH: '/',
      SUPPORT_URL: 'http://support.edx.org',
    });

    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });

    store = initializeStore({
      models: {
        courseDetails: {
          [courseId]: {
            start: Date(),
          },
        },
      },
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());

    // Go back to settings route
    history.push('/xpert-unit-summary/settings');
  });

  describe('with successful network connections', () => {
    beforeEach(() => {
      axiosMock.onGet(API.getXpertSettingsUrl(courseId))
        .reply(200, generateCourseLevelAPIRepsonse({
          success: true,
          enabled: true,
        }));

      renderComponent();
    });

    test('Shows enabled if enabled from backend', async () => {
      expect(container.querySelector('#enable-xpert-unit-summary-toggle').checked).toBeTruthy();
      expect(queryByTestId(container, 'enable-badge')).toBeTruthy();
    });

    test('Does not show enabled if disabled from backend', async () => {
      axiosMock.onGet(API.getXpertSettingsUrl(courseId))
        .reply(200, generateCourseLevelAPIRepsonse({
          success: true,
          enabled: false,
        }));

      renderComponent();
      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).toBeTruthy());
      expect(container.querySelector('#enable-xpert-unit-summary-toggle').checked).not.toBeTruthy();
      expect(queryByTestId(container, 'enable-badge')).not.toBeTruthy();
    });
  });

  describe('first time course configuration', () => {
    beforeEach(() => {
      axiosMock.onGet(API.getXpertSettingsUrl(courseId))
        .reply(400, generateCourseLevelAPIRepsonse({
          success: false,
          enabled: false,
        }));

      renderComponent();
    });

    test('Does not show as enabled if configuation does not exist', async () => {
      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).toBeTruthy());
      expect(container.querySelector('#enable-xpert-unit-summary-toggle').checked).not.toBeTruthy();
      expect(queryByTestId(container, 'enable-badge')).not.toBeTruthy();
    });
  });

  describe('saving configuration changes', () => {
    beforeEach(() => {
      axiosMock.onPost(API.getXpertSettingsUrl(courseId))
        .reply(200, generateCourseLevelAPIRepsonse({
          success: true,
          enabled: true,
        }));

      renderComponent();
    });

    test('Saving configuration changes', async () => {
      jest.spyOn(API, 'postXpertSettings');

      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).toBeTruthy());
      fireEvent.click(getByText(container, 'Save'));
      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).not.toBeTruthy());
      expect(API.postXpertSettings).toBeCalled();
    });
  });

  describe('testing configurable gating', () => {
    beforeEach(async () => {
      axiosMock.onGet(API.getXpertConfigurationStatusUrl(courseId))
        .reply(200, generateCourseLevelAPIRepsonse({
          success: true,
          enabled: true,
        }));
      jest.spyOn(API, 'getXpertPluginConfigurable');
      await executeThunk(Thunks.fetchXpertPluginConfigurable(courseId), store.dispatch);
      renderComponent();
    });

    test('getting Xpert Plugin configurable status', () => {
      expect(API.getXpertPluginConfigurable).toBeCalled();
    });
  });
});
