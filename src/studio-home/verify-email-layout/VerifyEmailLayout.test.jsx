// @ts-check
import { initializeMocks, render } from '../../testUtils';
import messages from './messages';
import VerifyEmailLayout from '.';

const fakeAuthenticatedUser = {
  userId: 7,
  email: 'email@fake.com',
  username: 'fake-user',
};

describe('<VerifyEmailLayout />', () => {
  beforeEach(async () => {
    initializeMocks({ user: fakeAuthenticatedUser });
  });

  it('renders successfully', () => {
    const { getByText } = render(<VerifyEmailLayout />);

    expect(
      getByText(`Thanks for signing up, ${fakeAuthenticatedUser.username}!`, {
        exact: false,
      }),
    ).toBeInTheDocument();

    expect(getByText(
      `Almost there! In order to complete your sign up we need you to verify your email address (${fakeAuthenticatedUser.email}). An activation message and next steps should be waiting for you there.`,
      { exact: false },
    )).toBeInTheDocument();

    expect(getByText(messages.sidebarTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.sidebarDescription.defaultMessage)).toBeInTheDocument();
  });
});
