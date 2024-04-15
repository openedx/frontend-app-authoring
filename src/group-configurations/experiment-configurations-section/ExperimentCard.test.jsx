import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { experimentGroupConfigurationsMock } from '../__mocks__';
import commonMessages from '../common/messages';
import ExperimentCard from './ExperimentCard';

const handleCreateMock = jest.fn();
const handleDeleteMock = jest.fn();
const handleEditMock = jest.fn();
const experimentConfigurationActions = {
  handleCreate: handleCreateMock,
  handleDelete: handleDeleteMock,
  handleEdit: handleEditMock,
};

const onCreateMock = jest.fn();
const experimentConfiguration = experimentGroupConfigurationsMock[0];

const renderComponent = (props = {}) => render(
  <IntlProvider locale="en">
    <ExperimentCard
      configuration={experimentConfiguration}
      experimentConfigurationActions={experimentConfigurationActions}
      onCreate={onCreateMock}
      {...props}
    />
  </IntlProvider>,
);

describe('<ExperimentCard />', () => {
  it('renders component correctly', () => {
    const { getByText, getByTestId } = renderComponent();
    expect(getByText(experimentConfiguration.name)).toBeInTheDocument();
    expect(
      getByText(
        commonMessages.titleId.defaultMessage.replace(
          '{id}',
          experimentConfiguration.id,
        ),
      ),
    ).toBeInTheDocument();
    expect(getByTestId('configuration-card-header-edit')).toBeInTheDocument();
    expect(getByTestId('configuration-card-header-delete')).toBeInTheDocument();
  });

  it('expands/collapses the container experiment configuration on title click', () => {
    const { queryByTestId, getByTestId } = renderComponent();
    const cardTitle = getByTestId('configuration-card-header-button');
    userEvent.click(cardTitle);
    expect(queryByTestId('configuration-card-content')).toBeInTheDocument();

    userEvent.click(cardTitle);
    expect(queryByTestId('configuration-card-content')).not.toBeInTheDocument();
  });

  it('renders experiment configuration without access to units', () => {
    const experimentConfigurationUpdated = {
      ...experimentConfiguration,
      usage: [],
    };
    const { queryByText, getByTestId } = renderComponent({
      configuration: experimentConfigurationUpdated,
    });
    expect(
      queryByText(commonMessages.accessTo.defaultMessage),
    ).not.toBeInTheDocument();

    const cardTitle = getByTestId('configuration-card-header-button');
    userEvent.click(cardTitle);
    expect(
      getByTestId('experiment-configuration-card-usage-empty'),
    ).toBeInTheDocument();
  });

  it('renders usage with validation error message', () => {
    const experimentConfigurationUpdated = {
      ...experimentConfiguration,
      usage: [{
        label: 'Unit1name / Content Experiment',
        url: '/container/block-v1:2u+1+1+type@split_test+block@ccfae830ec9b406c835f8ce4520ae395',
        validation: {
          type: 'warning',
          text: 'This content experiment has issues that affect content visibility.',
        },
      }],
    };
    const { getByText, getByTestId } = renderComponent({
      configuration: experimentConfigurationUpdated,
    });

    const cardTitle = getByTestId('configuration-card-header-button');
    userEvent.click(cardTitle);

    expect(
      getByText(experimentConfigurationUpdated.usage[0].validation.text),
    ).toBeInTheDocument();
  });

  it('renders experiment configuration badge that contains groups', () => {
    const { queryByTestId } = renderComponent();

    const usageBlock = queryByTestId('configuration-card-header-button-usage');
    expect(usageBlock).toBeInTheDocument();
  });

  it("user can't delete experiment configuration that is used in location", () => {
    const usageLocation = {
      label: 'UnitName 2 / Content Experiment',
      url: '/container/block-v1:2u+1+1+type@split_test+block@ccfae830ec9b406c835f8ce4520ae396',
    };
    const experimentConfigurationUpdated = {
      ...experimentConfiguration,
      usage: [usageLocation],
    };
    const { getByTestId } = renderComponent({
      configuration: experimentConfigurationUpdated,
    });
    const deleteButton = getByTestId('configuration-card-header-delete');
    expect(deleteButton).toBeDisabled();
  });
});
