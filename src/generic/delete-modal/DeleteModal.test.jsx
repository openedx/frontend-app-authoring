import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';

import initializeStore from '../../store';
import DeleteModal from './DeleteModal';
import messages from './messages';

// eslint-disable-next-line no-unused-vars
let axiosMock;
let store;

const onDeleteSubmitMock = jest.fn();
const closeMock = jest.fn();

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: (message) => message.defaultMessage,
  }),
}));

const renderComponent = (props) => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <DeleteModal
        isOpen
        close={closeMock}
        category="Section"
        onDeleteSubmit={onDeleteSubmitMock}
        {...props}
      />
    </IntlProvider>,
  </AppProvider>,
);

describe('<DeleteModal />', () => {
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

  it('render DeleteModal component correctly', () => {
    const { getByText, getByRole } = renderComponent();

    expect(getByText(messages.title.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.description.defaultMessage)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.cancelButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.deleteButton.defaultMessage })).toBeInTheDocument();
  });

  it('calls onDeleteSubmit function when the "Delete" button is clicked', () => {
    const { getByRole } = renderComponent();

    const okButton = getByRole('button', { name: messages.deleteButton.defaultMessage });
    fireEvent.click(okButton);
    expect(onDeleteSubmitMock).toHaveBeenCalledTimes(1);
  });

  it('calls the close function when the "Cancel" button is clicked', () => {
    const { getByRole } = renderComponent();

    const cancelButton = getByRole('button', { name: messages.cancelButton.defaultMessage });
    fireEvent.click(cancelButton);
    expect(closeMock).toHaveBeenCalledTimes(1);
  });
});
