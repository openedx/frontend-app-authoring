import React from 'react';
import { useSelector } from 'react-redux';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { COURSE_CREATOR_STATES } from '../../constants';
import initializeStore from '../../store';
import { studioHomeMock } from '../__mocks__';
import HomeSidebar from '.';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

let store;
const {
  studioName,
  studioShortName,
} = studioHomeMock;

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <HomeSidebar intl={{ formatMessage: jest.fn() }} />
    </IntlProvider>
  </AppProvider>
);

describe('<HomeSidebar />', () => {
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
    useSelector.mockReturnValue(studioHomeMock);

    const { getByText } = render(<RootWrapper />);
    expect(getByText(`New to ${studioName}?`)).toBeInTheDocument();
    expect(getByText(`Click "Looking for help with Studio" at the bottom of the page to access our continually updated documentation and other ${studioShortName} resources.`)).toBeInTheDocument();
  });

  it('shows mail to get instruction', () => {
    const studioHomeInitial = {
      ...studioHomeMock,
      courseCreatorStatus: COURSE_CREATOR_STATES.disallowedForThisSite,
      studioRequestEmail: 'mock@example.com',
    };
    useSelector.mockReturnValue(studioHomeInitial);

    const { getByText } = render(<RootWrapper />);
    expect(getByText(`Can I create courses in ${studioName}?`)).toBeInTheDocument();
    expect(getByText(`In order to create courses in ${studioName}, you must`)).toBeInTheDocument();
  });

  it('shows unrequested instructions', () => {
    const studioHomeInitial = {
      ...studioHomeMock,
      courseCreatorStatus: COURSE_CREATOR_STATES.unrequested,
    };
    useSelector.mockReturnValue(studioHomeInitial);

    const { getByText } = render(<RootWrapper />);
    expect(getByText(`Can I create courses in ${studioName}?`)).toBeInTheDocument();
    expect(getByText(`In order to create courses in ${studioName}, you must have course creator privileges to create your own course.`)).toBeInTheDocument();
  });

  it('shows denied instructions', () => {
    const studioHomeInitial = {
      ...studioHomeMock,
      courseCreatorStatus: COURSE_CREATOR_STATES.denied,
    };
    useSelector.mockReturnValue(studioHomeInitial);

    const { getByText } = render(<RootWrapper />);
    expect(getByText(`Can I create courses in ${studioName}?`)).toBeInTheDocument();
    expect(getByText(`Your request to author courses in ${studioName} has been denied.`, { exact: false })).toBeInTheDocument();
  });
});
