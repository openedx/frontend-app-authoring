import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import CourseHandouts from './CourseHandouts';
import messages from './messages';

const onEditMock = jest.fn();
const handoutsContentMock = 'Handouts Content';

const renderComponent = (props) => render(
  <IntlProvider locale="en">
    <CourseHandouts
      onEdit={onEditMock}
      contentForHandouts={handoutsContentMock}
      isDisabledButtons={false}
      {...props}
    />
  </IntlProvider>,
);

describe('<CourseHandouts />', () => {
  it('render CourseHandouts component correctly', () => {
    const { getByText, getByRole } = renderComponent();

    expect(getByText(messages.handoutsTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(handoutsContentMock)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.editButton.defaultMessage })).toBeInTheDocument();
  });

  it('calls the onEdit function when the edit button is clicked', () => {
    const { getByRole } = renderComponent();

    const editButton = getByRole('button', { name: messages.editButton.defaultMessage });
    fireEvent.click(editButton);
    expect(onEditMock).toHaveBeenCalledTimes(1);
  });

  it('"Edit" button is disabled when isDisabledButtons is true', () => {
    const { getByRole } = renderComponent({ isDisabledButtons: true });

    const editButton = getByRole('button', { name: messages.editButton.defaultMessage });
    expect(editButton).toBeDisabled();
  });
});
