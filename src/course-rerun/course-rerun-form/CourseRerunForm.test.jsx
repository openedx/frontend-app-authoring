import React from 'react';
import { useSelector } from 'react-redux';
import { render } from '@testing-library/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';

import { studioHomeMock } from '../../studio-home/__mocks__';
import initializeStore from '../../store';
import CourseRerunForm from '.';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

let store;

const onClickCancelMock = jest.fn();

const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <AppProvider store={store}>
      <CourseRerunForm {...props} />
    </AppProvider>
  </IntlProvider>
);

const props = {
  initialFormValues: {
    displayName: '',
    org: '',
    number: '',
    run: '',
  },
  onClickCancel: onClickCancelMock,
};

describe('<CourseRerunForm />', () => {
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

  it('renders description successfully', () => {
    const { getByText } = render(<RootWrapper {...props} />);
    expect(getByText('Provide identifying information for this re-run of the course. The original course is not affected in any way by a re-run', { exact: false })).toBeInTheDocument();
  });
});
