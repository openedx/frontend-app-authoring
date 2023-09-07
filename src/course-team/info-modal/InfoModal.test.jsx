import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { MODAL_TYPES } from '../constants';
import InfoModal from './InfoModal';
import messages from './messages';

const closeMock = jest.fn();
const onDeleteSubmitMock = jest.fn();
const currentEmailMock = 'user@example.com';
const errorMessageMock = 'Error text error@example.com';
const courseNameMock = 'Course Name';

const renderComponent = (props) => render(
  <IntlProvider locale="en">
    <InfoModal
      modalType={MODAL_TYPES.delete}
      isOpen
      close={closeMock}
      onDeleteSubmit={onDeleteSubmitMock}
      currentEmail={currentEmailMock}
      errorMessage={errorMessageMock}
      courseName={courseNameMock}
      {...props}
    />
  </IntlProvider>,
);

describe('<InfoModal />', () => {
  it('render InfoModal component with type delete correctly', () => {
    const { getByText, getByRole } = renderComponent({
      modalType: MODAL_TYPES.delete,
    });

    expect(getByText(messages.deleteModalTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(
      messages.deleteModalMessage.defaultMessage
        .replace('{email}', currentEmailMock)
        .replace('{courseName}', courseNameMock),
    )).toBeInTheDocument();
    expect(getByRole('button', { name: messages.deleteModalCancelButton.defaultMessage })).toBeInTheDocument();
    expect(getByRole('button', { name: messages.deleteModalDeleteButton.defaultMessage })).toBeInTheDocument();
  });

  it('render InfoModal component with type error correctly', () => {
    const { getByText, getByRole } = renderComponent({
      modalType: MODAL_TYPES.error,
    });

    expect(getByText(messages.errorModalTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(errorMessageMock)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.errorModalOkButton.defaultMessage })).toBeInTheDocument();
  });

  it('render InfoModal component with type warning correctly', () => {
    const { getByText, getByRole } = renderComponent({
      modalType: MODAL_TYPES.warning,
    });

    expect(getByText(messages.warningModalTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(
      messages.warningModalMessage.defaultMessage
        .replace('{email}', currentEmailMock)
        .replace('{courseName}', courseNameMock),
    )).toBeInTheDocument();
    expect(getByRole('button', { name: messages.warningModalReturnButton.defaultMessage })).toBeInTheDocument();
  });

  it('calls close handler when the close button is clicked', () => {
    const { getByRole } = renderComponent();

    const closeButton = getByRole('button', { name: messages.deleteModalCancelButton.defaultMessage });
    fireEvent.click(closeButton);
    expect(closeMock).toHaveBeenCalledTimes(1);
  });

  it('calls onDeleteSubmit handler when the delete button is clicked', () => {
    const { getByRole } = renderComponent();

    const deleteButton = getByRole('button', { name: messages.deleteModalDeleteButton.defaultMessage });
    fireEvent.click(deleteButton);
    expect(onDeleteSubmitMock).toHaveBeenCalledTimes(1);
  });
});
