import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import initializeStore from '../../../store';
import messages from './messages';
import CourseItem from '.';

let store;

const RootWrapper = (props) => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <CourseItem {...props} />
    </IntlProvider>
  </AppProvider>
);

const course = {
  displayName: 'course-name-fake',
  courseKey: 'course-key-fake',
  org: 'course-org-fake',
  number: 'course-number-fake',
  run: 'course-run-fake',
  isInProgress: true,
  isFailed: true,
  dismissLink: 'course-dismiss-link-fake',
};

const props = { course };

describe('<CourseItem />', () => {
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

  it('renders successfully', () => {
    const { getByText, getAllByText } = render(<RootWrapper {...props} />);
    const subtitle = `${course.org} / ${course.number} / ${course.run}`;
    expect(getAllByText(course.displayName)).toHaveLength(2);
    expect(getAllByText(subtitle)).toHaveLength(2);
    expect(getByText(messages.itemInProgressActionText.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.itemIsFailedActionText.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.itemFailedFooterText.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.itemFailedFooterButton.defaultMessage)).toBeInTheDocument();
  });
});
