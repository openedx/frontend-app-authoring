import React from 'react';
import { useSelector } from 'react-redux';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import initializeStore from '../../store';
import { studioHomeMock } from '../__mocks__';
import messages from './messages';
import ProcessingCourses from '.';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

let store;

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <ProcessingCourses />
    </IntlProvider>
  </AppProvider>
);

describe('<ProcessingCourses />', () => {
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
    useSelector.mockReturnValue(studioHomeMock);
  });
  it('renders successfully processing courses', () => {
    const studioHomeInitial = {
      ...studioHomeMock,
      inProcessCourseActions: [{ a: '1' }, { b: '2' }],
    };
    useSelector.mockReturnValue(studioHomeInitial);
    const { getByText, queryAllByTestId } = render(<RootWrapper />);
    expect(getByText(messages.processingTitle.defaultMessage)).toBeInTheDocument();
    expect(queryAllByTestId('course-item')).toHaveLength(2);
  });

  it('renders successfully empty list', () => {
    const { getByText, queryAllByTestId } = render(<RootWrapper />);
    expect(getByText(messages.processingTitle.defaultMessage)).toBeInTheDocument();
    expect(queryAllByTestId('course-item')).toHaveLength(0);
  });
});
