import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';

import initializeStore from '../../store';
import EnableHighlightsModal from './EnableHighlightsModal';
import messages from './messages';

let store;
const mockPathname = '/foo-bar';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

jest.mock('../../help-urls/hooks', () => ({
  useHelpUrls: () => ({
    contentHighlights: 'some',
  }),
}));

const onEnableHighlightsSubmitMock = jest.fn();
const closeMock = jest.fn();

const renderComponent = (props) => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <EnableHighlightsModal
        isOpen
        close={closeMock}
        onEnableHighlightsSubmit={onEnableHighlightsSubmitMock}
        {...props}
      />
    </IntlProvider>,
  </AppProvider>,
);

describe('<EnableHighlightsModal />', () => {
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

  it('renders EnableHighlightsModal component correctly', () => {
    const { getByText, getByRole } = renderComponent();

    expect(getByText(messages.title.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.description_1.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.description_2.defaultMessage)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.cancelButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.submitButton.defaultMessage })).toBeInTheDocument();
    expect(getByText(messages.link.defaultMessage)).toBeInTheDocument();
  });

  it('calls onEnableHighlightsSubmit function when the "Submit" button is clicked', () => {
    const { getByRole } = renderComponent();

    const submitButton = getByRole('button', { name: messages.submitButton.defaultMessage });
    fireEvent.click(submitButton);
    expect(onEnableHighlightsSubmitMock).toHaveBeenCalled();
  });

  it('calls the close function when the "Cancel" button is clicked', () => {
    const { getByRole } = renderComponent();

    const cancelButton = getByRole('button', { name: messages.cancelButton.defaultMessage });
    fireEvent.click(cancelButton);
    expect(closeMock).toHaveBeenCalled();
  });
});
