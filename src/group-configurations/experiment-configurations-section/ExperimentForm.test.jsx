import { IntlProvider } from '@edx/frontend-platform/i18n';
import userEvent from '@testing-library/user-event';
import { render, waitFor } from '@testing-library/react';

import { experimentGroupConfigurationsMock } from '../__mocks__';
import messages from './messages';
import { initialExperimentConfiguration } from './constants';
import ExperimentForm from './ExperimentForm';

const onCreateClickMock = jest.fn();
const onCancelClickMock = jest.fn();
const onEditClickMock = jest.fn();

const experimentConfiguration = experimentGroupConfigurationsMock[0];

const renderComponent = (props = {}) => render(
  <IntlProvider locale="en">
    <ExperimentForm
      initialValues={initialExperimentConfiguration}
      onCreateClick={onCreateClickMock}
      onCancelClick={onCancelClickMock}
      onEditClick={onEditClickMock}
      {...props}
    />
  </IntlProvider>,
);

describe('<ExperimentForm />', () => {
  it('renders component correctly', () => {
    const { getByText, getByRole, getByTestId } = renderComponent();

    expect(getByTestId('experiment-configuration-form')).toBeInTheDocument();
    expect(
      getByText(`${messages.experimentConfigurationName.defaultMessage}*`),
    ).toBeInTheDocument();
    expect(
      getByRole('button', {
        name: messages.experimentConfigurationCancel.defaultMessage,
      }),
    ).toBeInTheDocument();
    expect(
      getByRole('button', {
        name: messages.experimentConfigurationCreate.defaultMessage,
      }),
    ).toBeInTheDocument();
  });

  it('renders component in edit mode', () => {
    const { getByText, getByRole } = renderComponent({
      isEditMode: true,
      initialValues: experimentConfiguration,
    });

    expect(
      getByText(
        messages.experimentConfigurationId.defaultMessage.replace(
          '{id}',
          experimentConfiguration.id,
        ),
      ),
    ).toBeInTheDocument();
    expect(
      getByRole('button', {
        name: messages.experimentConfigurationSave.defaultMessage,
      }),
    ).toBeInTheDocument();
  });

  it('shows alert if group is used in location with edit mode', () => {
    const { getByText } = renderComponent({
      isEditMode: true,
      initialValues: experimentConfiguration,
      isUsedInLocation: true,
    });
    expect(
      getByText(messages.experimentConfigurationAlert.defaultMessage),
    ).toBeInTheDocument();
  });

  it('calls onCreateClick when the "Create" button is clicked with a valid form', async () => {
    const { getByRole, getByPlaceholderText } = renderComponent();
    const nameInput = getByPlaceholderText(
      messages.experimentConfigurationNamePlaceholder.defaultMessage,
    );
    const descriptionInput = getByPlaceholderText(
      messages.experimentConfigurationNamePlaceholder.defaultMessage,
    );
    userEvent.type(nameInput, 'New name of the group configuration');
    userEvent.type(
      descriptionInput,
      'New description of the group configuration',
    );
    const createButton = getByRole('button', {
      name: messages.experimentConfigurationCreate.defaultMessage,
    });
    expect(createButton).toBeInTheDocument();
    userEvent.click(createButton);

    await waitFor(() => {
      expect(onCreateClickMock).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error when the "Create" button is clicked with empty name', async () => {
    const { getByRole, getByPlaceholderText, getByText } = renderComponent();
    const nameInput = getByPlaceholderText(
      messages.experimentConfigurationNamePlaceholder.defaultMessage,
    );
    userEvent.type(nameInput, '');

    const createButton = getByRole('button', {
      name: messages.experimentConfigurationCreate.defaultMessage,
    });
    expect(createButton).toBeInTheDocument();
    userEvent.click(createButton);

    await waitFor(() => {
      expect(
        getByText(messages.experimentConfigurationNameRequired.defaultMessage),
      ).toBeInTheDocument();
    });
  });

  it('shows error when the "Create" button is clicked without groups', async () => {
    const experimentConfigurationUpdated = {
      ...experimentConfiguration,
      name: 'My group configuration name',
      groups: [],
    };
    const { getByRole, getByText } = renderComponent({
      initialValues: experimentConfigurationUpdated,
    });
    const createButton = getByRole('button', {
      name: messages.experimentConfigurationCreate.defaultMessage,
    });
    expect(createButton).toBeInTheDocument();
    userEvent.click(createButton);

    await waitFor(() => {
      expect(
        getByText(messages.experimentConfigurationGroupsRequired.defaultMessage),
      ).toBeInTheDocument();
    });
  });

  it('shows error when the "Create" button is clicked with duplicate groups', async () => {
    const experimentConfigurationUpdated = {
      ...experimentConfiguration,
      name: 'My group configuration name',
      groups: [
        {
          name: 'Group A',
        },
        {
          name: 'Group A',
        },
      ],
    };
    const { getByRole, getByText } = renderComponent({
      initialValues: experimentConfigurationUpdated,
    });
    const createButton = getByRole('button', {
      name: messages.experimentConfigurationCreate.defaultMessage,
    });
    expect(createButton).toBeInTheDocument();
    userEvent.click(createButton);

    await waitFor(() => {
      expect(
        getByText(
          messages.experimentConfigurationGroupsNameUnique.defaultMessage,
        ),
      ).toBeInTheDocument();
    });
  });

  it('shows error when the "Create" button is clicked with empty name of group', async () => {
    const experimentConfigurationUpdated = {
      ...experimentConfiguration,
      name: 'My group configuration name',
      groups: [
        {
          name: '',
        },
      ],
    };
    const { getByRole, getByText } = renderComponent({
      initialValues: experimentConfigurationUpdated,
    });
    const createButton = getByRole('button', {
      name: messages.experimentConfigurationCreate.defaultMessage,
    });
    expect(createButton).toBeInTheDocument();
    userEvent.click(createButton);

    await waitFor(() => {
      expect(
        getByText(
          messages.experimentConfigurationGroupsNameRequired.defaultMessage,
        ),
      ).toBeInTheDocument();
    });
  });

  it('calls onEditClick when the "Save" button is clicked with a valid form', async () => {
    const { getByRole, getByPlaceholderText } = renderComponent({
      isEditMode: true,
      initialValues: experimentConfiguration,
    });
    const newConfigurationNameText = 'Updated experiment configuration name';
    const nameInput = getByPlaceholderText(
      messages.experimentConfigurationNamePlaceholder.defaultMessage,
    );
    userEvent.type(nameInput, newConfigurationNameText);
    const saveButton = getByRole('button', {
      name: messages.experimentConfigurationSave.defaultMessage,
    });
    expect(saveButton).toBeInTheDocument();
    userEvent.click(saveButton);

    await waitFor(() => {
      expect(onEditClickMock).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onCancelClick when the "Cancel" button is clicked', async () => {
    const { getByRole } = renderComponent();
    const cancelButton = getByRole('button', {
      name: messages.experimentConfigurationCancel.defaultMessage,
    });
    expect(cancelButton).toBeInTheDocument();
    userEvent.click(cancelButton);

    expect(onCancelClickMock).toHaveBeenCalledTimes(1);
  });
});
