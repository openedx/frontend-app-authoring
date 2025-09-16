import React from 'react';
import { useSelector } from 'react-redux';
import { render } from '@testing-library/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';

import { studioHomeMock } from '../__mocks__';
import initializeStore from '../../store';
import messages from './messages';
import CourseNewCourseForm from '.';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

let store;

const onClickCancelMock = jest.fn();

const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <AppProvider store={store}>
      <CourseNewCourseForm {...props} />
    </AppProvider>
  </IntlProvider>
);

const props = {
  onClickCancel: onClickCancelMock,
};

describe('<CourseNewCourseForm />', () => {
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

  it('renders form successfully', () => {
    const { getByText } = render(
      <RootWrapper {...props} />,
    );
    expect(getByText(messages.createNewCourse.defaultMessage)).toBeInTheDocument();
  });
});
