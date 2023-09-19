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
    const { getByText, getByTestId } = renderComponent();

    expect(getByText(dateForUpdateMock)).toBeInTheDocument();
    expect(getByTestId('course-update-edit-button')).toBeInTheDocument();
    expect(getByTestId('course-update-delete-button')).toBeInTheDocument();
  });

  it('render CourseUpdate component without content correctly', () => {
    const { getByText, queryByTestId, getByTestId } = renderComponent({ contentForUpdate: '' });

    expect(getByText(dateForUpdateMock)).toBeInTheDocument();
    expect(queryByTestId('course-update-content')).not.toBeInTheDocument();
    expect(getByTestId('course-update-edit-button')).toBeInTheDocument();
    expect(getByTestId('course-update-delete-button')).toBeInTheDocument();
  });

  it('render error message when dateForUpdate is inValid', () => {
    const { getByText } = renderComponent({ dateForUpdate: 'Welcome' });

    expect(getByText(messages.errorMessage.defaultMessage)).toBeInTheDocument();
  });

  it('calls the onEdit function when the "Edit" button is clicked', () => {
    const { getByTestId } = renderComponent();

    const editButton = getByTestId('course-update-edit-button');
    fireEvent.click(editButton);
    expect(onEditMock).toHaveBeenCalledTimes(1);
  });

  it('calls the onDelete function when the "Delete" button is clicked', () => {
    const { getByTestId } = renderComponent();

    const deleteButton = getByTestId('course-update-delete-button');
    fireEvent.click(deleteButton);
    expect(onDeleteMock).toHaveBeenCalledTimes(1);
  });

  it('"Edit" and "Delete" buttons is disabled when isDisabledButtons is true', () => {
    const { getByTestId } = renderComponent({ isDisabledButtons: true });

    expect(getByTestId('course-update-edit-button')).toBeDisabled();
    expect(getByTestId('course-update-delete-button')).toBeDisabled();
  });
});
