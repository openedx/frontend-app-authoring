import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import CourseUpdate from './CourseUpdate';
import messages from './messages';

const onEditMock = jest.fn();
const onDeleteMock = jest.fn();
const dateForUpdateMock = 'May 1, 2023';
const contentForUpdateMock = 'Update Content';

const renderComponent = (props) => render(
  <IntlProvider locale="en">
    <CourseUpdate
      dateForUpdate={dateForUpdateMock}
      contentForUpdate={contentForUpdateMock}
      onEdit={onEditMock}
      onDelete={onDeleteMock}
      isDisabledButtons={false}
      {...props}
    />
  </IntlProvider>,
);

describe('<CourseUpdate />', () => {
  it('render CourseUpdate component correctly', () => {
    const { getByText, getByRole } = renderComponent();

    expect(getByText(dateForUpdateMock)).toBeInTheDocument();
    expect(getByText(dateForUpdateMock)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.editButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.deleteButton.defaultMessage })).toBeInTheDocument();
  });

  it('render CourseUpdate component without content correctly', () => {
    const { getByText, queryByTestId, getByRole } = renderComponent({ contentForUpdate: '' });

    expect(getByText(dateForUpdateMock)).toBeInTheDocument();
    expect(queryByTestId('course-update-content')).not.toBeInTheDocument();
    expect(getByRole('button', { name: messages.editButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.deleteButton.defaultMessage })).toBeInTheDocument();
  });

  it('calls the onEdit function when the "Edit" button is clicked', () => {
    const { getByRole } = renderComponent();

    const editButton = getByRole('button', { name: messages.editButton.defaultMessage });
    fireEvent.click(editButton);
    expect(onEditMock).toHaveBeenCalledTimes(1);
  });

  it('calls the onDelete function when the "Delete" button is clicked', () => {
    const { getByRole } = renderComponent();

    const deleteButton = getByRole('button', { name: messages.deleteButton.defaultMessage });
    fireEvent.click(deleteButton);
    expect(onDeleteMock).toHaveBeenCalledTimes(1);
  });

  it('"Edit" and "Delete" buttons is disabled when isDisabledButtons is true', () => {
    const { getByRole } = renderComponent({ isDisabledButtons: true });

    expect(getByRole('button', { name: messages.editButton.defaultMessage })).toBeDisabled();
    expect(getByRole('button', { name: messages.deleteButton.defaultMessage })).toBeDisabled();
  });
});
