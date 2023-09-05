import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import initializeStore from '../../store';
import messages from './messages';
import ImportSidebar from './ImportSidebar';

const courseId = 'course-123';
let store;

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <ImportSidebar intl={{ formatMessage: jest.fn() }} courseId={courseId} />
    </IntlProvider>
  </AppProvider>
);

describe('<ImportSidebar />', () => {
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
  it('render sidebar correctly', () => {
    const { getByText } = render(<RootWrapper />);
    expect(getByText(messages.title1.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.importedContentHeading.defaultMessage)).toBeInTheDocument();
  });
});
