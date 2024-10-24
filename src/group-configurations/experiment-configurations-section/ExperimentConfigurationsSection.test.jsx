import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { experimentGroupConfigurationsMock } from '../__mocks__';
import messages from './messages';
import ExperimentConfigurationsSection from '.';

const handleCreateMock = jest.fn();
const handleDeleteMock = jest.fn();
const handleEditMock = jest.fn();
const mockPathname = '/foo-bar';
const experimentConfigurationActions = {
  handleCreate: handleCreateMock,
  handleDelete: handleDeleteMock,
  handleEdit: handleEditMock,
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

const renderComponent = (props) => render(
  <IntlProvider locale="en">
    <ExperimentConfigurationsSection
      availableGroups={experimentGroupConfigurationsMock}
      experimentConfigurationActions={experimentConfigurationActions}
      {...props}
    />
  </IntlProvider>,
);

describe('<ExperimentConfigurationsSection />', () => {
  it('renders component correctly', () => {
    const { getByText, getByRole, getAllByTestId } = renderComponent();
    expect(getByText(messages.title.defaultMessage)).toBeInTheDocument();
    expect(
      getByRole('button', { name: messages.addNewGroup.defaultMessage }),
    ).toBeInTheDocument();
    expect(getAllByTestId('configuration-card')).toHaveLength(
      experimentGroupConfigurationsMock.length,
    );
  });

  it('renders empty section', () => {
    const { getByTestId } = renderComponent({ availableGroups: [] });
    expect(
      getByTestId('group-configurations-empty-placeholder'),
    ).toBeInTheDocument();
  });
});
