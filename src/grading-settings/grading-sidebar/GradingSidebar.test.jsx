import React from 'react';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import { render } from '@testing-library/react';

import messages from './messages';
import GradingSidebar from '.';

const mockPathname = '/foo-bar';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

const RootWrapper = () => (
  <IntlProvider locale="en" messages={{}}>
    <GradingSidebar intl={injectIntl} courseId="123" />
  </IntlProvider>
);

describe('<GradingSidebar />', () => {
  it('renders sidebar text content correctly', () => {
    const { getByText } = render(<RootWrapper />);
    expect(getByText(messages.gradingSidebarTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.gradingSidebarAbout1.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.gradingSidebarAbout2.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.gradingSidebarAbout3.defaultMessage)).toBeInTheDocument();
  });
});
