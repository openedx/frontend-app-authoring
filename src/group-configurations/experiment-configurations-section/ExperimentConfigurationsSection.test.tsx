import {
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
} from '@src/testUtils';
import { AvailableGroup } from '@src/group-configurations/types';
import { experimentGroupConfigurationsMock } from '../__mocks__';
import placeholderMessages from '../empty-placeholder/messages';
import messages from './messages';
import ExperimentConfigurationsSection from '.';

const courseId = 'course-v1:org+101+101';
const handleCreateMock = jest.fn();
const handleDeleteMock = jest.fn();
const handleEditMock = jest.fn();
const experimentConfigurationActions = {
  handleCreate: handleCreateMock,
  handleDelete: handleDeleteMock,
  handleEdit: handleEditMock,
};

const renderComponent = (props = {}) =>
  render(
    <ExperimentConfigurationsSection
      availableGroups={experimentGroupConfigurationsMock as AvailableGroup[]}
      experimentConfigurationActions={experimentConfigurationActions}
      {...props}
    />,
    { path: '/course/:courseId/group_configurations', params: { courseId } },
  );

describe('<ExperimentConfigurationsSection />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders component correctly', () => {
    renderComponent();

    expect(screen.getByText(messages.title.defaultMessage)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: messages.addNewGroup.defaultMessage }),
    ).toBeInTheDocument();
    experimentGroupConfigurationsMock.forEach(({ name }) => {
      expect(screen.getByRole('button', { name: new RegExp(name) })).toBeInTheDocument();
    });
  });

  it('renders empty section', () => {
    renderComponent({ availableGroups: [] });

    expect(screen.getByText(placeholderMessages.experimentalTitle.defaultMessage)).toBeInTheDocument();
  });

  it('creates a configuration from the new configuration form', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(
      screen.getByRole('button', { name: messages.addNewGroup.defaultMessage }),
    );
    await user.type(
      screen.getByPlaceholderText(messages.experimentConfigurationNamePlaceholder.defaultMessage),
      'New configuration',
    );
    await user.click(
      screen.getByRole('button', { name: messages.experimentConfigurationCreate.defaultMessage }),
    );

    await waitFor(() => {
      expect(handleCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'New configuration' }),
        expect.any(Function),
      );
    });
  });

  describe('when readOnly', () => {
    it('hides the add configuration button and the card action buttons', () => {
      renderComponent({ readOnly: true });

      experimentGroupConfigurationsMock.forEach(({ name }) => {
        expect(screen.getByRole('button', { name: new RegExp(name) })).toBeInTheDocument();
      });
      expect(
        screen.queryByRole('button', { name: messages.addNewGroup.defaultMessage }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: messages.actionEdit.defaultMessage }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: messages.actionDelete.defaultMessage }),
      ).not.toBeInTheDocument();
    });

    it('renders the read-only placeholder without the create button if section is empty', () => {
      renderComponent({ availableGroups: [], readOnly: true });

      expect(
        screen.getByText(placeholderMessages.readOnlyTitle.defaultMessage),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: placeholderMessages.experimentalButton.defaultMessage }),
      ).not.toBeInTheDocument();
    });
  });
});
