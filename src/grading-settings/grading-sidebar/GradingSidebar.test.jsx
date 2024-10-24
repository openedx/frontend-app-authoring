import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import initializeStore from '../../store';
import messages from './messages';
import GradingSidebar from '.';

const mockPathname = '/foo-bar';
let store;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

const RootWrapper = () => (
  <IntlProvider locale="en" messages={{}}>
    <AppProvider store={store}>
      <GradingSidebar intl={injectIntl} courseId="123" />
    </AppProvider>
  </IntlProvider>
);

describe('<GradingSidebar />', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: false,
        roles: [],
      },
    });

    store = initializeStore({
      courseDetail: {
        courseId: 'id',
        status: 'sucessful',
      },
    });
  });

  it('renders sidebar text content correctly', () => {
    const { getByText } = render(<RootWrapper />);
    expect(getByText(messages.gradingSidebarTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.gradingSidebarAbout1.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.gradingSidebarAbout2.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.gradingSidebarAbout3.defaultMessage)).toBeInTheDocument();
  });
});
