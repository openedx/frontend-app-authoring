import { IntlProvider } from '@edx/frontend-platform/i18n';
import userEvent from '@testing-library/user-event';
import { render, waitFor } from '@testing-library/react';

import { contentGroupsMock } from '../__mocks__';
import messages from './messages';
import ContentGroupForm from './ContentGroupForm';

const onCreateClickMock = jest.fn();
const onCancelClickMock = jest.fn();
const onEditClickMock = jest.fn();

const renderComponent = (props = {}) => render(
  <IntlProvider locale="en">
    <ContentGroupForm
      groupNames={contentGroupsMock.groups?.map((group) => group.name)}
      onCreateClick={onCreateClickMock}
      onCancelClick={onCancelClickMock}
      onEditClick={onEditClickMock}
      {...props}
    />
  </IntlProvider>,
);

describe('<ContentGroupForm />', () => {
  it('renders component correctly', () => {
    const { getByText, getByRole, getByTestId } = renderComponent();

    expect(getByTestId('content-group-form')).toBeInTheDocument();
    expect(
      getByText(messages.newGroupHeader.defaultMessage),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: messages.cancelButton.defaultMessage }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: messages.createButton.defaultMessage }),
    ).toBeInTheDocument();
  });

  it('renders component in edit mode', () => {
    const {
      getByText, queryByText, getByRole, getByPlaceholderText,
    } = renderComponent({
      isEditMode: true,
      overrideValue: 'overrideValue',
    });
    const newGroupInput = getByPlaceholderText(
      messages.newGroupInputPlaceholder.defaultMessage,
    );

    expect(newGroupInput).toBeInTheDocument();
    expect(
      getByText(messages.newGroupHeader.defaultMessage),
    ).toBeInTheDocument();
    expect(
      getByRole('button', { name: messages.saveButton.defaultMessage }),
    ).toBeInTheDocument();
    expect(
      queryByText(messages.alertGroupInUsage.defaultMessage),
    ).not.toBeInTheDocument();
  });

  it('shows alert if group is used in location with edit mode', () => {
    const { getByText } = renderComponent({
      isEditMode: true,
      overrideValue: 'overrideValue',
      isUsedInLocation: true,
    });
    expect(
      getByText(messages.alertGroupInUsage.defaultMessage),
    ).toBeInTheDocument();
  });

  it('calls onCreate when the "Create" button is clicked with a valid form', async () => {
    const {
      getByRole, getByPlaceholderText, queryByText,
    } = renderComponent();
    const newGroupNameText = 'New group name';
    const newGroupInput = getByPlaceholderText(
      messages.newGroupInputPlaceholder.defaultMessage,
    );
    userEvent.type(newGroupInput, newGroupNameText);
    const createButton = getByRole('button', {
      name: messages.createButton.defaultMessage,
    });
    expect(createButton).toBeInTheDocument();
    userEvent.click(createButton);

    await waitFor(() => {
      expect(onCreateClickMock).toHaveBeenCalledTimes(1);
    });
    expect(
      queryByText(messages.requiredError.defaultMessage),
    ).not.toBeInTheDocument();
  });

  it('shows error when the "Create" button is clicked with an invalid form', async () => {
    const { getByRole, getByPlaceholderText, getByText } = renderComponent();
    const newGroupNameText = '';
    const newGroupInput = getByPlaceholderText(
      messages.newGroupInputPlaceholder.defaultMessage,
    );
    userEvent.type(newGroupInput, newGroupNameText);
    const createButton = getByRole('button', {
      name: messages.createButton.defaultMessage,
    });
    expect(createButton).toBeInTheDocument();
    userEvent.click(createButton);

    await waitFor(() => {
      expect(
        getByText(messages.requiredError.defaultMessage),
      ).toBeInTheDocument();
    });
  });

  it('calls onEdit when the "Save" button is clicked with a valid form', async () => {
    const { getByRole, getByPlaceholderText, queryByText } = renderComponent({
      isEditMode: true,
      overrideValue: 'overrideValue',
    });
    const newGroupNameText = 'Updated group name';
    const newGroupInput = getByPlaceholderText(
      messages.newGroupInputPlaceholder.defaultMessage,
    );
    userEvent.type(newGroupInput, newGroupNameText);
    const saveButton = getByRole('button', {
      name: messages.saveButton.defaultMessage,
    });
    expect(saveButton).toBeInTheDocument();
    userEvent.click(saveButton);

    await waitFor(() => {
      expect(
        queryByText(messages.requiredError.defaultMessage),
      ).not.toBeInTheDocument();
    });
    expect(onEditClickMock).toHaveBeenCalledTimes(1);
  });

  it('shows error when the "Save" button is clicked with an invalid duplicate form', async () => {
    const { getByRole, getByPlaceholderText, getByText } = renderComponent({
      isEditMode: true,
      overrideValue: contentGroupsMock.groups[0].name,
    });
    const newGroupNameText = contentGroupsMock.groups[2].name;
    const newGroupInput = getByPlaceholderText(
      messages.newGroupInputPlaceholder.defaultMessage,
    );
    userEvent.clear(newGroupInput);
    userEvent.type(newGroupInput, newGroupNameText);
    const saveButton = getByRole('button', {
      name: messages.saveButton.defaultMessage,
    });
    expect(saveButton).toBeInTheDocument();
    userEvent.click(saveButton);

    await waitFor(() => {
      expect(
        getByText(messages.invalidMessage.defaultMessage),
      ).toBeInTheDocument();
    });
  });

  it('calls onCancel when the "Cancel" button is clicked', async () => {
    const { getByRole } = renderComponent();
    const cancelButton = getByRole('button', {
      name: messages.cancelButton.defaultMessage,
    });
    expect(cancelButton).toBeInTheDocument();
    userEvent.click(cancelButton);

    expect(onCancelClickMock).toHaveBeenCalledTimes(1);
  });
});
