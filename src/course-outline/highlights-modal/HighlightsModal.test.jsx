import React from 'react';
import {
  render, fireEvent, act, waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { useSelector } from 'react-redux';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import initializeStore from '../../store';
import HighlightsModal from './HighlightsModal';
import messages from './messages';

let store;
const mockPathname = '/foo-bar';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

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

const currentItemMock = {
  highlights: ['Highlight 1', 'Highlight 2'],
  displayName: 'Test Section',
};

const onCloseMock = jest.fn();
const onSubmitMock = jest.fn();

const renderComponent = () => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <HighlightsModal
        isOpen
        onClose={onCloseMock}
        onSubmit={onSubmitMock}
      />
    </IntlProvider>,
  </AppProvider>,
);

describe('<HighlightsModal />', () => {
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
    useSelector.mockReturnValue(currentItemMock);
  });

  it('renders HighlightsModal component correctly', () => {
    const { getByText, getByRole, getByLabelText } = renderComponent();

    expect(getByText(`Highlights for ${currentItemMock.displayName}`)).toBeInTheDocument();
    expect(getByText(/Enter 3-5 highlights to include in the email message that learners receive for this section/i)).toBeInTheDocument();
    expect(getByText(/For more information and an example of the email template, read our/i)).toBeInTheDocument();
    expect(getByText(messages.documentationLink.defaultMessage)).toBeInTheDocument();
    expect(getByLabelText(messages.highlight.defaultMessage.replace('{index}', '1'))).toBeInTheDocument();
    expect(getByLabelText(messages.highlight.defaultMessage.replace('{index}', '2'))).toBeInTheDocument();
    expect(getByLabelText(messages.highlight.defaultMessage.replace('{index}', '3'))).toBeInTheDocument();
    expect(getByLabelText(messages.highlight.defaultMessage.replace('{index}', '4'))).toBeInTheDocument();
    expect(getByLabelText(messages.highlight.defaultMessage.replace('{index}', '5'))).toBeInTheDocument();
    expect(getByRole('button', { name: messages.cancelButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.saveButton.defaultMessage })).toBeInTheDocument();
  });

  it('calls the onClose function when the cancel button is clicked', () => {
    const { getByRole } = renderComponent();

    const cancelButton = getByRole('button', { name: messages.cancelButton.defaultMessage });
    fireEvent.click(cancelButton);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('calls the onSubmit function with correct values when the save button is clicked', async () => {
    const { getByRole, getByLabelText } = renderComponent();

    const field1 = getByLabelText(messages.highlight.defaultMessage.replace('{index}', '1'));
    const field2 = getByLabelText(messages.highlight.defaultMessage.replace('{index}', '2'));
    fireEvent.change(field1, { target: { value: 'New highlight 1' } });
    fireEvent.change(field2, { target: { value: 'New highlight 2' } });

    const saveButton = getByRole('button', { name: messages.saveButton.defaultMessage });

    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
      expect(onSubmitMock).toHaveBeenCalledWith(
        {
          highlight_1: 'New highlight 1',
          highlight_2: 'New highlight 2',
          highlight_3: '',
          highlight_4: '',
          highlight_5: '',
        },
        expect.objectContaining({ submitForm: expect.any(Function) }),
      );
    });
  });
});
