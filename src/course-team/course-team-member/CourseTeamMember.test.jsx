import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { USER_ROLES } from '../../constants';
import CourseTeamMember from './CourseTeamMember';
import messages from './messages';

const userNameMock = 'User';
const emailMock = 'user@example.com';
const currentUserEmailMock = 'user@example.com';
const onChangeRoleMock = jest.fn();
const onDeleteMock = jest.fn();

const renderComponent = (props) => render(
  <IntlProvider locale="en">
    <CourseTeamMember
      userName={userNameMock}
      email={emailMock}
      currentUserEmail="some@example.com"
      onChangeRole={onChangeRoleMock}
      onDelete={onDeleteMock}
      isAllowActions
      isHideActions={false}
      role={USER_ROLES.admin}
      {...props}
    />
  </IntlProvider>,
);

describe('<CourseTeamMember />', () => {
  it('render CourseTeamMember component correctly', () => {
    const { getByText, getByRole, getByTestId } = renderComponent();

    expect(getByText(userNameMock)).toBeInTheDocument();
    expect(getByText(emailMock)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.removeButton.defaultMessage })).toBeInTheDocument();
    expect(getByTestId('delete-button')).toBeInTheDocument();
    expect(getByText(messages.roleAdmin.defaultMessage)).toBeInTheDocument();
  });

  it('displays correct badge and "You" label for the current user', () => {
    const { getByText } = renderComponent({
      role: USER_ROLES.staff,
      currentUserEmail: currentUserEmailMock,
    });

    expect(getByText(messages.roleStaff.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.roleYou.defaultMessage)).toBeInTheDocument();
  });

  it('not displays actions when isAllowActions is false', () => {
    const { queryByRole, queryByTestId } = renderComponent({
      role: USER_ROLES.admin,
      currentUserEmail: currentUserEmailMock,
      isAllowActions: false,
    });

    expect(queryByRole('button', { name: messages.removeButton.defaultMessage })).not.toBeInTheDocument();
    expect(queryByTestId('delete-button')).not.toBeInTheDocument();
  });

  it('calls onChangeRole when the "Add"/"Remove" button is clicked', () => {
    const { getByRole } = renderComponent({
      role: USER_ROLES.staff,
    });

    const addButton = getByRole('button', { name: messages.addButton.defaultMessage });
    fireEvent.click(addButton);
    expect(onChangeRoleMock).toHaveBeenCalledTimes(1);
    expect(onChangeRoleMock).toHaveBeenCalledWith(emailMock, USER_ROLES.admin);
  });

  it('calls onDelete when the "Delete" button is clicked', () => {
    const { getByTestId } = renderComponent();

    const deleteButton = getByTestId('delete-button');
    fireEvent.click(deleteButton);
    expect(onDeleteMock).toHaveBeenCalledTimes(1);
  });

  it('renders the "Hint" when isHideActions is true', () => {
    const { getByText, queryByRole, queryByTestId } = renderComponent({
      isHideActions: true,
    });

    expect(queryByRole('button', { name: messages.addButton.defaultMessage })).not.toBeInTheDocument();
    expect(queryByTestId('delete-button')).not.toBeInTheDocument();
    expect(getByText(messages.hint.defaultMessage)).toBeInTheDocument();
  });
});
