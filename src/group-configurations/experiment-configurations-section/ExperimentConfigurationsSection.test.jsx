import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { experimentGroupConfigurationsMock } from '../__mocks__';
import placeholderMessages from '../empty-placeholder/messages';
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

const renderComponent = (props) =>
  render(
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

  describe('when readOnly', () => {
    it('hides the add configuration button and the card action buttons', () => {
      const { queryByRole, queryAllByTestId, getAllByTestId } = renderComponent({ readOnly: true });

      expect(getAllByTestId('configuration-card')).toHaveLength(
        experimentGroupConfigurationsMock.length,
      );
      expect(
        queryByRole('button', { name: messages.addNewGroup.defaultMessage }),
      ).not.toBeInTheDocument();
      expect(queryAllByTestId('configuration-card-header-edit')).toHaveLength(0);
      expect(queryAllByTestId('configuration-card-header-delete')).toHaveLength(0);
    });

    it('renders the read-only placeholder without the create button if section is empty', () => {
      const { getByText, queryByRole } = renderComponent({ availableGroups: [], readOnly: true });

      expect(
        getByText(placeholderMessages.readOnlyTitle.defaultMessage),
      ).toBeInTheDocument();
      expect(
        queryByRole('button', { name: placeholderMessages.experimentalButton.defaultMessage }),
      ).not.toBeInTheDocument();
    });
  });
});
