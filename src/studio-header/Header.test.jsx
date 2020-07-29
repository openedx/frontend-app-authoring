// This file was copied from edx/frontend-component-header-edx.
import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import TestRenderer from 'react-test-renderer';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform';
import { Context as ResponsiveContext } from 'react-responsive';

import Header from './Header';

jest.mock('@edx/frontend-platform');

getConfig.mockReturnValue({});

describe('<Header />', () => {
  it('renders correctly for authenticated users on desktop', () => {
    const component = (
      <ResponsiveContext.Provider value={{ width: 1280 }}>
        <IntlProvider locale="en" messages={{}}>
          <AppContext.Provider value={{
            authenticatedUser: {
              userId: 'abc123',
              username: 'edX',
              roles: [],
              administrator: false,
            },
            config: {
              STUDIO_BASE_URL: process.env.STUDIO_BASE_URL,
              LOGIN_URL: process.env.LOGIN_URL,
              LOGOUT_URL: process.env.LOGOUT_URL,
            },
          }}
          >
            <Header courseId="course-v1:edX+DemoX+Demo_Course" />
          </AppContext.Provider>
        </IntlProvider>
      </ResponsiveContext.Provider>
    );

    const wrapper = TestRenderer.create(component);

    expect(wrapper.toJSON()).toMatchSnapshot();
  });

  it('renders correctly for authenticated users on mobile', () => {
    const component = (
      <ResponsiveContext.Provider value={{ width: 500 }}>
        <IntlProvider locale="en" messages={{}}>
          <AppContext.Provider value={{
            authenticatedUser: {
              userId: 'abc123',
              username: 'edX',
              roles: [],
              administrator: false,
            },
            config: {
              STUDIO_BASE_URL: process.env.STUDIO_BASE_URL,
              LOGIN_URL: process.env.LOGIN_URL,
              LOGOUT_URL: process.env.LOGOUT_URL,
            },
          }}
          >
            <Header courseId="course-v1:edX+DemoX+Demo_Course" />
          </AppContext.Provider>
        </IntlProvider>
      </ResponsiveContext.Provider>
    );

    const wrapper = TestRenderer.create(component);

    expect(wrapper.toJSON()).toMatchSnapshot();
  });
});
