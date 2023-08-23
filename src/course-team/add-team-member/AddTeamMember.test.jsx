import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import AddTeamMember from './AddTeamMember';
import messages from './messages';

const onFormOpenMock = jest.fn();

const renderComponent = (props) => render(
  <IntlProvider locale="en">
    <AddTeamMember onFormOpen={onFormOpenMock} {...props} />
  </IntlProvider>,
);

describe('<AddTeamMember />', () => {
  it('render AddTeamMember component correctly', () => {
    const { getByText, getByRole } = renderComponent();

    expect(getByText(messages.title.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.description.defaultMessage)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.button.defaultMessage })).toBeInTheDocument();
  });

  it('calls onFormOpen when the button is clicked', () => {
    const { getByText } = renderComponent();

    const addButton = getByText(messages.button.defaultMessage);
    fireEvent.click(addButton);
    expect(onFormOpenMock).toHaveBeenCalledTimes(1);
  });

  it('"Add a New Team member" button is disabled when isButtonDisable is true', () => {
    const { getByRole } = renderComponent({ isButtonDisable: true });

    const addButton = getByRole('button', { name: messages.button.defaultMessage });
    expect(addButton).toBeDisabled();
  });

  it('"Add a New Team member" button is not disabled when isButtonDisable is false', () => {
    const { getByRole } = renderComponent();

    const addButton = getByRole('button', { name: messages.button.defaultMessage });
    expect(addButton).not.toBeDisabled();
  });
});
