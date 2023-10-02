import React from 'react';
import { useSelector } from 'react-redux';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp, getConfig } from '@edx/frontend-platform';

import { studioHomeMock } from '../__mocks__';
import messages from '../messages';
import initializeStore from '../../store';
import CardItem from '.';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

let store;

const RootWrapper = (props) => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <CardItem intl={{ formatMessage: jest.fn() }} {...props} />
    </IntlProvider>
  </AppProvider>
);

describe('<CardItem />', () => {
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
  it('should render course details for non-library course', () => {
    const props = studioHomeMock.archivedCourses[0];
    const { getByText } = render(<RootWrapper {...props} />);
    expect(getByText(`${props.org} / ${props.number} / ${props.run}`)).toBeInTheDocument();
  });
  it('should render correct links for non-library course', () => {
    const props = studioHomeMock.archivedCourses[0];
    const { getByText } = render(<RootWrapper {...props} />);
    const courseTitleLink = getByText(props.displayName);
    expect(courseTitleLink).toHaveAttribute('href', `${getConfig().STUDIO_BASE_URL}${props.url}`);
    const btnReRunCourse = getByText(messages.btnReRunText.defaultMessage);
    expect(btnReRunCourse).toHaveAttribute('href', props.rerunLink);
    const viewLiveLink = getByText(messages.viewLiveBtnText.defaultMessage);
    expect(viewLiveLink).toHaveAttribute('href', props.lmsLink);
  });
  it('should render course details for library course', () => {
    const props = { ...studioHomeMock.archivedCourses[0], isLibraries: true };
    const { getByText } = render(<RootWrapper {...props} />);
    const courseTitleLink = getByText(props.displayName);
    expect(courseTitleLink).toHaveAttribute('href', `${getConfig().STUDIO_BASE_URL}${props.url}`);
    expect(getByText(`${props.org} / ${props.number}`)).toBeInTheDocument();
  });
  it('should hide rerun button if disallowed', () => {
    const props = studioHomeMock.archivedCourses[0];
    useSelector.mockReturnValue({ ...studioHomeMock, allowCourseReruns: false });
    const { queryByText } = render(<RootWrapper {...props} />);
    expect(queryByText(messages.btnReRunText.defaultMessage)).not.toBeInTheDocument();
  });
  it('should be read only course if old mongo course', () => {
    const props = studioHomeMock.courses[1];
    const { queryByText } = render(<RootWrapper {...props} />);
    expect(queryByText(props.displayName)).not.toHaveAttribute('href');
    expect(queryByText(messages.btnReRunText.defaultMessage)).not.toBeInTheDocument();
    expect(queryByText(messages.viewLiveBtnText.defaultMessage)).not.toBeInTheDocument();
  });
});
