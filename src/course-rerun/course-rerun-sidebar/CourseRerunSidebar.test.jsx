import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import initializeStore from '../../store';
import CourseRerunSideBar from '.';
import messages from './messages';

let store;
const mockPathname = '/foo-bar';
const courseId = '123';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

const renderComponent = (props) => render(
  <AppProvider store={store} messages={{}}>
    <IntlProvider locale="en">
      <CourseRerunSideBar courseId={courseId} {...props} />
    </IntlProvider>
  </AppProvider>,
);

describe('<CourseRerunSideBar />', () => {
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

  it('render CourseRerunSideBar successfully', () => {
    const { getByText } = renderComponent();

    expect(getByText(messages.sectionTitle1.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.sectionDescription1.defaultMessage, { exact: false })).toBeInTheDocument();
    expect(getByText(messages.sectionTitle2.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.sectionDescription2.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.sectionTitle3.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.sectionDescription3.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.sectionLink4.defaultMessage)).toBeInTheDocument();
  });
});
