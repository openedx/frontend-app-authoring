import React from 'react';
import {
  render,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { EXAMPLE_USER_EMAIL } from '../constants';
import initializeStore from '../../store';
import { USER_ROLES } from '../../constants';
import { updateCourseTeamUserApiUrl } from '../data/api';
import { createCourseTeamQuery } from '../data/thunk';
import { executeThunk } from '../../utils';
import AddUserForm from './AddUserForm';
import messages from './messages';

let axiosMock;
let store;
const mockPathname = '/foo-bar';
const courseId = '123';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

const onSubmitMock = jest.fn();
const onCancelMock = jest.fn();

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <AddUserForm
        onSubmit={onSubmitMock}
        onCancel={onCancelMock}
      />
    </IntlProvider>
  </AppProvider>
);

describe('<AddUserForm />', () => {
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
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

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

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
      expect(onSubmitMock).toHaveBeenCalledWith(
        { email: EXAMPLE_USER_EMAIL },
        expect.objectContaining({ submitForm: expect.any(Function) }),
      );
    });

    axiosMock
      .onPost(updateCourseTeamUserApiUrl(courseId, EXAMPLE_USER_EMAIL), { role: USER_ROLES.staff })
      .reply(200, { role: USER_ROLES.staff });

    await executeThunk(createCourseTeamQuery(courseId, EXAMPLE_USER_EMAIL), store.dispatch);
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
