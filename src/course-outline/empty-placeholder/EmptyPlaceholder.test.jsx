import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import EmptyPlaceholder from './EmptyPlaceholder';
import messages from './messages';

const onCreateNewSectionMock = jest.fn();

const renderComponent = () => render(
  <IntlProvider locale="en">
    <EmptyPlaceholder
      onCreateNewSection={onCreateNewSectionMock}
      childAddable
    />
  </IntlProvider>,
);

describe('<EmptyPlaceholder />', () => {
  it('renders EmptyPlaceholder component correctly', () => {
    const { getByText, getByRole } = renderComponent();

    expect(getByText(messages.title.defaultMessage)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.button.defaultMessage })).toBeInTheDocument();
  });

  it('calls the onCreateNewSection function when the button is clicked', () => {
    const { getByRole } = renderComponent();

    const addButton = getByRole('button', { name: messages.button.defaultMessage });
    fireEvent.click(addButton);
    expect(onCreateNewSectionMock).toHaveBeenCalledTimes(1);
  });
});
