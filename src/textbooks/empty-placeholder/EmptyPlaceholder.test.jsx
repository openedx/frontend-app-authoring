import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import userEvent from '@testing-library/user-event';
import EmptyPlaceholder from './EmptyPlaceholder';
import messages from './messages';

const onCreateNewTextbookMock = jest.fn();

const renderComponent = () => render(
  <IntlProvider locale="en">
    <EmptyPlaceholder onCreateNewTextbook={onCreateNewTextbookMock} />
  </IntlProvider>,
);

describe('<EmptyPlaceholder />', () => {
  it('renders EmptyPlaceholder component correctly', () => {
    const { getByText, getByRole } = renderComponent();

    expect(getByText(messages.title.defaultMessage)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.button.defaultMessage })).toBeInTheDocument();
  });

  it('calls the onCreateNewTextbook function when the button is clicked', () => {
    const { getByRole } = renderComponent();

    const addButton = getByRole('button', { name: messages.button.defaultMessage });
    userEvent.click(addButton);
    expect(onCreateNewTextbookMock).toHaveBeenCalledTimes(1);
  });
});
