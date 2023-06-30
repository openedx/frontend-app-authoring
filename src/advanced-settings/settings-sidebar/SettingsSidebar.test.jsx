import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import initializeStore from '../../store';
import SettingsSidebar from './SettingsSidebar';
import messages from './messages';

const courseId = 'course-123';
let store;

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <SettingsSidebar intl={{ formatMessage: jest.fn() }} courseId={courseId} />
    </IntlProvider>
  </AppProvider>
);

describe('<SettingsSidebar />', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    store = initializeStore();
  });
  it('renders about and other sidebar titles correctly', () => {
    const { getByText } = render(<RootWrapper />);
    expect(getByText(messages.about.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.other.defaultMessage)).toBeInTheDocument();
  });
  it('renders about descriptions correctly', () => {
    const { getByText } = render(<RootWrapper />);
    const aboutThirtyDescription = getByText('When you enter strings as policy values, ensure that you use double quotation marks (“) around the string. Do not use single quotation marks (‘).');
    expect(getByText(messages.aboutDescription1.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.aboutDescription2.defaultMessage)).toBeInTheDocument();
    expect(aboutThirtyDescription).toBeInTheDocument();
  });
});
