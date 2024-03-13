import ReactDOM from 'react-dom';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import {
  getConfig, initializeMockApp, setConfig,
} from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider, PageWrap } from '@edx/frontend-platform/react';
import {
  queryByTestId, render, waitFor, getByText, fireEvent,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import PagesAndResourcesProvider from 'CourseAuthoring/pages-and-resources/PagesAndResourcesProvider';
import initializeStore from 'CourseAuthoring/store';
import { executeThunk } from 'CourseAuthoring/utils';

import XpertUnitSummarySettings from './Settings';
import * as API from './data/api';
import * as Thunks from './data/thunks';

const courseId = 'course-v1:edX+TestX+Test_Course';
let axiosMock;
let store;
let container;

// Modal creates a portal. Overriding ReactDOM.createPortal allows portals to be tested in jest.
ReactDOM.createPortal = jest.fn(node => node);

function renderComponent() {
  const wrapper = render(
    <AppProvider store={store} wrapWithRouter={false}>
      <PagesAndResourcesProvider courseId={courseId}>
        <MemoryRouter initialEntries={['/xpert-unit-summary/settings']}>
          <Routes>
            <Route
              path="/xpert-unit-summary/settings"
              element={<PageWrap><XpertUnitSummarySettings courseId={courseId} /></PageWrap>}
            />
            <Route
              path="/"
              element={<PageWrap><div /></PageWrap>}
            />
          </Routes>
        </MemoryRouter>
      </PagesAndResourcesProvider>
    </AppProvider>,
  );
  container = wrapper.container;
}

function generateCourseLevelAPIResponse({
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
  });

  describe('with successful network connections', () => {
    beforeEach(() => {
      axiosMock.onGet(API.getXpertSettingsUrl(courseId))
        .reply(200, generateCourseLevelAPIResponse({
          success: true,
          enabled: true,
        }));

      renderComponent();
    });

    test('Shows switch on if enabled from backend', async () => {
      expect(container.querySelector('#enable-xpert-unit-summary-toggle').checked).toBeTruthy();
      expect(queryByTestId(container, 'enable-badge')).toBeTruthy();
    });

    test('Shows switch on if disabled from backend', async () => {
      axiosMock.onGet(API.getXpertSettingsUrl(courseId))
        .reply(200, generateCourseLevelAPIResponse({
          success: true,
          enabled: false,
        }));

      renderComponent();
      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).toBeTruthy());
      expect(container.querySelector('#enable-xpert-unit-summary-toggle').checked).toBeTruthy();
      expect(queryByTestId(container, 'enable-badge')).toBeTruthy();
    });

    test('Shows enable radio selected if enabled from backend', async () => {
      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).toBeTruthy());
      expect(queryByTestId(container, 'enable-radio').checked).toBeTruthy();
    });

    test('Shows disable radio selected if enabled from backend', async () => {
      axiosMock.onGet(API.getXpertSettingsUrl(courseId))
        .reply(200, generateCourseLevelAPIResponse({
          success: true,
          enabled: false,
        }));

      renderComponent();
      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).toBeTruthy());
      expect(queryByTestId(container, 'disable-radio').checked).toBeTruthy();
    });
  });

  describe('first time course configuration', () => {
    beforeEach(() => {
      axiosMock.onGet(API.getXpertSettingsUrl(courseId))
        .reply(400, generateCourseLevelAPIResponse({
          success: false,
          enabled: undefined,
        }));

      renderComponent();
    });

    test('Does not show as enabled if configuration does not exist', async () => {
      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).toBeTruthy());
      expect(container.querySelector('#enable-xpert-unit-summary-toggle').checked).not.toBeTruthy();
      expect(queryByTestId(container, 'enable-badge')).not.toBeTruthy();
    });
  });

  describe('saving configuration changes', () => {
    beforeEach(() => {
      axiosMock.onGet(API.getXpertSettingsUrl(courseId))
        .reply(200, generateCourseLevelAPIResponse({
          success: true,
          enabled: false,
        }));

      axiosMock.onPost(API.getXpertSettingsUrl(courseId))
        .reply(200, generateCourseLevelAPIResponse({
          success: true,
          enabled: true,
        }));

      renderComponent();
    });

    test('Saving configuration changes', async () => {
      jest.spyOn(API, 'postXpertSettings');

      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).toBeTruthy());
      expect(queryByTestId(container, 'disable-radio').checked).toBeTruthy();
      fireEvent.click(queryByTestId(container, 'enable-radio'));
      fireEvent.click(getByText(container, 'Save'));
      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).toBeTruthy());
      expect(API.postXpertSettings).toBeCalled();
    });
  });

  describe('testing configurable gating', () => {
    beforeEach(async () => {
      axiosMock.onGet(API.getXpertConfigurationStatusUrl(courseId))
        .reply(200, generateCourseLevelAPIResponse({
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

  describe('removing course configuration', () => {
    beforeEach(() => {
      axiosMock.onGet(API.getXpertSettingsUrl(courseId))
        .reply(200, generateCourseLevelAPIResponse({
          success: true,
          enabled: true,
        }));

      axiosMock.onDelete(API.getXpertSettingsUrl(courseId))
        .reply(200, generateCourseLevelAPIResponse({
          success: true,
          enabled: undefined,
        }));

      renderComponent();
    });

    test('Deleting course configuration', async () => {
      jest.spyOn(API, 'deleteXpertSettings');

      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).toBeTruthy());
      fireEvent.click(container.querySelector('#enable-xpert-unit-summary-toggle'));
      fireEvent.click(getByText(container, 'Save'));
      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).toBeTruthy());
      expect(API.deleteXpertSettings).toBeCalled();
    });
  });

  describe('resetting course units', () => {
    test('reset all units to be enabled', async () => {
      axiosMock.onGet(API.getXpertSettingsUrl(courseId))
        .reply(200, generateCourseLevelAPIResponse({
          success: true,
          enabled: true,
        }));

      axiosMock.onPost(API.getXpertSettingsUrl(courseId))
        .reply(200, generateCourseLevelAPIResponse({
          success: true,
          enabled: true,
        }));

      renderComponent();

      jest.spyOn(API, 'postXpertSettings');

      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).toBeTruthy());
      fireEvent.click(queryByTestId(container, 'reset-units'));
      expect(API.postXpertSettings).toBeCalledWith(courseId, { reset: true, enabled: true });
    });

    test('reset all units to be disabled', async () => {
      axiosMock.onGet(API.getXpertSettingsUrl(courseId))
        .reply(200, generateCourseLevelAPIResponse({
          success: true,
          enabled: false,
        }));

      axiosMock.onPost(API.getXpertSettingsUrl(courseId))
        .reply(200, generateCourseLevelAPIResponse({
          success: true,
          enabled: false,
        }));

      renderComponent();

      jest.spyOn(API, 'postXpertSettings');

      await waitFor(() => expect(container.querySelector('#enable-xpert-unit-summary-toggle')).toBeTruthy());
      fireEvent.click(queryByTestId(container, 'reset-units'));
      expect(API.postXpertSettings).toBeCalledWith(courseId, { reset: true, enabled: false });
    });
  });
});
