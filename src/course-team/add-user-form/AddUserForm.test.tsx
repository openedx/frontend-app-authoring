import userEvent from '@testing-library/user-event';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  initializeMocks,
} from '@src/testUtils';

import { EXAMPLE_USER_EMAIL } from '../constants';
import AddUserForm from './AddUserForm';
import messages from './messages';

const mockPathname = '/foo-bar';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

const onSubmitMock = jest.fn();
const onCancelMock = jest.fn();

const renderComponent = () => render(
  <AddUserForm
    onSubmit={onSubmitMock}
    onCancel={onCancelMock}
  />,
);

describe('<AddUserForm />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
  });

  it('render AddUserForm component correctly', () => {
    renderComponent();

    expect(screen.getByText(messages.formTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.formLabel.defaultMessage)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(messages.formPlaceholder.defaultMessage
      .replace('{email}', EXAMPLE_USER_EMAIL))).toBeInTheDocument();
    expect(screen.getByText(messages.cancelButton.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.addUserButton.defaultMessage)).toBeInTheDocument();
  });

  it('calls onSubmit when the "Add User" button is clicked with a valid email', async () => {
    const user = userEvent.setup();
    renderComponent();

    const emailInput = screen.getByPlaceholderText(messages.formPlaceholder.defaultMessage.replace('{email}', EXAMPLE_USER_EMAIL));
    const addUserButton = screen.getByRole('button', { name: messages.addUserButton.defaultMessage });

    fireEvent.change(emailInput, { target: { value: EXAMPLE_USER_EMAIL } });

    await user.click(addUserButton);

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
    expect(onSubmitMock).toHaveBeenCalledWith(
      { email: EXAMPLE_USER_EMAIL },
      expect.objectContaining({ submitForm: expect.any(Function) }),
    );
  });

  it('calls onCancel when the "Cancel" button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const cancelButton = screen.getByText(messages.cancelButton.defaultMessage);
    await user.click(cancelButton);
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  it('"Add User" button is disabled when the email input field is empty', () => {
    renderComponent();

    const addUserButton = screen.getByText(messages.addUserButton.defaultMessage);
    expect(addUserButton).toBeDisabled();
  });

  it('"Add User" button is not disabled when the email input field is not empty', () => {
    renderComponent();

    const emailInput = screen.getByPlaceholderText(
      messages.formPlaceholder.defaultMessage.replace('{email}', EXAMPLE_USER_EMAIL),
    );
    const addUserButton = screen.getByText(messages.addUserButton.defaultMessage);

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    expect(addUserButton).not.toBeDisabled();
  });
});
