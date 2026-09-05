import {
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
} from '@src/testUtils';
import { AvailableGroup } from '@src/group-configurations/types';
import { contentGroupsMock } from '../__mocks__';
import placeholderMessages from '../empty-placeholder/messages';
import messages from './messages';
import ContentGroupsSection from '.';

const courseId = 'course-v1:org+101+101';
const handleCreateMock = jest.fn();
const handleDeleteMock = jest.fn();
const handleEditMock = jest.fn();
const contentGroupActions = {
  handleCreate: handleCreateMock,
  handleDelete: handleDeleteMock,
  handleEdit: handleEditMock,
};

const renderComponent = (props = {}) =>
  render(
    <ContentGroupsSection
      availableGroup={contentGroupsMock as AvailableGroup}
      contentGroupActions={contentGroupActions}
      {...props}
    />,
    { path: '/course/:courseId/group_configurations', params: { courseId } },
  );

describe('<ContentGroupsSection />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders component correctly', () => {
    renderComponent();

    expect(screen.getByText(contentGroupsMock.name)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: messages.addNewGroup.defaultMessage }),
    ).toBeInTheDocument();
    contentGroupsMock.groups.forEach(({ name }) => {
      expect(screen.getByRole('button', { name: new RegExp(name) })).toBeInTheDocument();
    });
  });

  it('renders empty section', () => {
    renderComponent({ availableGroup: {} });

    expect(screen.getByText(placeholderMessages.title.defaultMessage)).toBeInTheDocument();
  });

  it('renders container with new group on create click if section is empty', async () => {
    const user = userEvent.setup();
    renderComponent({ availableGroup: {} });

    await user.click(
      screen.getByRole('button', { name: placeholderMessages.button.defaultMessage }),
    );

    expect(screen.getByText(messages.newGroupHeader.defaultMessage)).toBeInTheDocument();
  });

  it('renders container with new group on create click if section has groups', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(
      screen.getByRole('button', { name: messages.addNewGroup.defaultMessage }),
    );

    expect(screen.getByText(messages.newGroupHeader.defaultMessage)).toBeInTheDocument();
  });

  it('creates a group with the new name appended to the existing ones', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(
      screen.getByRole('button', { name: messages.addNewGroup.defaultMessage }),
    );
    await user.type(
      screen.getByPlaceholderText(messages.newGroupInputPlaceholder.defaultMessage),
      'Brand new group',
    );
    await user.click(
      screen.getByRole('button', { name: messages.createButton.defaultMessage }),
    );

    await waitFor(() => {
      expect(handleCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          groups: [
            ...contentGroupsMock.groups,
            expect.objectContaining({ name: 'Brand new group' }),
          ],
        }),
        expect.any(Function),
      );
    });
  });

  it('edits a group by renaming only the matching one', async () => {
    const user = userEvent.setup();
    const [editedGroup] = contentGroupsMock.groups;
    renderComponent();

    await user.click(
      screen.getAllByRole('button', { name: messages.actionEdit.defaultMessage })[0],
    );
    const nameInput = screen.getByPlaceholderText(
      messages.newGroupInputPlaceholder.defaultMessage,
    );
    await user.clear(nameInput);
    await user.type(nameInput, 'Renamed group');
    await user.click(
      screen.getByRole('button', { name: messages.saveButton.defaultMessage }),
    );

    await waitFor(() => {
      expect(handleEditMock).toHaveBeenCalledWith(
        expect.objectContaining({
          groups: expect.arrayContaining([
            { ...editedGroup, name: 'Renamed group' },
          ]),
        }),
        expect.any(Function),
      );
    });
  });

  describe('when readOnly', () => {
    it('hides the add group button and the card action buttons', () => {
      renderComponent({ readOnly: true });

      contentGroupsMock.groups.forEach(({ name }) => {
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
      renderComponent({ availableGroup: {}, readOnly: true });

      expect(
        screen.getByText(placeholderMessages.readOnlyTitle.defaultMessage),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: placeholderMessages.button.defaultMessage }),
      ).not.toBeInTheDocument();
    });
  });
});
