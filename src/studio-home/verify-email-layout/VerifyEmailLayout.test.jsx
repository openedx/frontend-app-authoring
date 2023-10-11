import React from 'react';
import { render } from '@testing-library/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import messages from './messages';
import VerifyEmailLayout from '.';

const mockPathname = '/foo-bar';
const fakeAuthenticatedUser = {
  email: 'email@fake.com',
  username: 'fake-user',
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));
jest.mock('@edx/frontend-platform/auth');
getAuthenticatedUser.mockImplementation(() => fakeAuthenticatedUser);

const RootWrapper = () => (
  <IntlProvider locale="en" messages={{}}>
    <VerifyEmailLayout />
  </IntlProvider>
);

describe('<VerifyEmailLayout />', () => {
  it('renders successfully', () => {
    const { getByText } = render(<RootWrapper />);
    expect(
      getByText(`Thanks for signing up, ${fakeAuthenticatedUser.username}!`, {
        exact: false,
      }),
    ).toBeInTheDocument();
    expect(getByText(messages.bannerTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(
      `Almost there! In order to complete your sign up we need you to verify your email address (${fakeAuthenticatedUser.email}). An activation message and next steps should be waiting for you there.`,
      { exact: false },
    )).toBeInTheDocument();
    expect(getByText(messages.sidebarTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.sidebarDescription.defaultMessage)).toBeInTheDocument();
  });
});
