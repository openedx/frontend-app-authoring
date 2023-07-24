import React from 'react';
import {
  render,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import AddUserForm from './AddUserForm';
import messages from './messages';
import { EXAMPLE_USER_EMAIL } from '../constants';

const onSubmitMock = jest.fn();
const onCancelMock = jest.fn();

const RootWrapper = () => (
  <IntlProvider locale="en">
    <AddUserForm
      onSubmit={onSubmitMock}
      onCancel={onCancelMock}
    />
  </IntlProvider>
);

describe('<AddUserForm />', () => {
  it('render AddUserForm component correctly', () => {
    const { getByText, getByPlaceholderText } = render(<RootWrapper />);

    expect(getByText(messages.formTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.formLabel.defaultMessage)).toBeInTheDocument();
    expect(getByPlaceholderText(messages.formPlaceholder.defaultMessage
      .replace('{email}', EXAMPLE_USER_EMAIL))).toBeInTheDocument();
    expect(getByText(messages.cancelButton.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.addUserButton.defaultMessage)).toBeInTheDocument();
  });

  it('calls onSubmit when the "Add User" button is clicked with a valid email', async () => {
    const { getByPlaceholderText, getByRole } = render(<RootWrapper />);

    const emailInput = getByPlaceholderText(messages.formPlaceholder.defaultMessage.replace('{email}', EXAMPLE_USER_EMAIL));
    const addUserButton = getByRole('button', { name: messages.addUserButton.defaultMessage });

    fireEvent.change(emailInput, { target: { value: EXAMPLE_USER_EMAIL } });

    await act(async () => {
      fireEvent.click(addUserButton);
    });

    // Wait for the form submission to complete
    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
      expect(onSubmitMock).toHaveBeenCalledWith(
        { email: EXAMPLE_USER_EMAIL },
        expect.objectContaining({ submitForm: expect.any(Function) }),
      );
    });
  });

  it('calls onCancel when the "Cancel" button is clicked', () => {
    const { getByText } = render(<RootWrapper />);

    const cancelButton = getByText(messages.cancelButton.defaultMessage);
    fireEvent.click(cancelButton);
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  it('"Add User" button is disabled when the email input field is empty', () => {
    const { getByText } = render(<RootWrapper />);

    const addUserButton = getByText(messages.addUserButton.defaultMessage);
    expect(addUserButton).toBeDisabled();
  });

  it('"Add User" button is not disabled when the email input field is not empty', () => {
    const { getByPlaceholderText, getByText } = render(<RootWrapper />);

    const emailInput = getByPlaceholderText(
      messages.formPlaceholder.defaultMessage.replace('{email}', EXAMPLE_USER_EMAIL),
    );
    const addUserButton = getByText(messages.addUserButton.defaultMessage);

    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    expect(addUserButton).not.toBeDisabled();
  });
});
