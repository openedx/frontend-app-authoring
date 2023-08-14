import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import EnableHighlightsModal from './EnableHighlightsModal';
import messages from './messages';

const onEnableHighlightsSubmitMock = jest.fn();
const closeMock = jest.fn();

const highlightsDocUrl = 'https://example.com/';

const renderComponent = (props) => render(
  <IntlProvider locale="en">
    <EnableHighlightsModal
      isOpen
      close={closeMock}
      onEnableHighlightsSubmit={onEnableHighlightsSubmitMock}
      highlightsDocUrl={highlightsDocUrl}
      {...props}
    />
  </IntlProvider>,
);

describe('<EnableHighlightsModal />', () => {
  it('renders EnableHighlightsModal component correctly', () => {
    const { getByText, getByRole } = renderComponent();

    expect(getByText(messages.title.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.description_1.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.description_2.defaultMessage)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.cancelButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.submitButton.defaultMessage })).toBeInTheDocument();

    const hyperlink = getByText(messages.link.defaultMessage);
    expect(hyperlink).toBeInTheDocument();
    expect(hyperlink.href).toBe(highlightsDocUrl);
  });

  it('calls onEnableHighlightsSubmit function when the "Submit" button is clicked', () => {
    const { getByRole } = renderComponent();

    const submitButton = getByRole('button', { name: messages.submitButton.defaultMessage });
    fireEvent.click(submitButton);
    expect(onEnableHighlightsSubmitMock).toHaveBeenCalledTimes();
  });

  it('calls the close function when the "Cancel" button is clicked', () => {
    const { getByRole } = renderComponent();

    const cancelButton = getByRole('button', { name: messages.cancelButton.defaultMessage });
    fireEvent.click(cancelButton);
    expect(closeMock).toHaveBeenCalledTimes(1);
  });
});
