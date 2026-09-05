import {
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
} from '@src/testUtils';
import deleteModalMessages from '@src/generic/delete-modal/messages';
import { Group } from '@src/group-configurations/types';
import { contentGroupsMock } from '../__mocks__';
import commonMessages from '../common/messages';
import rootMessages from '../messages';
import messages from './messages';
import ContentGroupCard from './ContentGroupCard';

const courseId = 'course-v1:org+101+101';
const handleCreateMock = jest.fn();
const handleDeleteMock = jest.fn();
const handleEditMock = jest.fn();
const contentGroupActions = {
  handleCreate: handleCreateMock,
  handleDelete: handleDeleteMock,
  handleEdit: handleEditMock,
};

const handleEditGroupMock = jest.fn();
const contentGroup = contentGroupsMock.groups[0] as Group;
const contentGroupWithUsages = contentGroupsMock.groups[1] as Group;
const contentGroupWithOnlyOneUsage = contentGroupsMock.groups[2] as Group;

const renderComponent = (props = {}) =>
  render(
    <ContentGroupCard
      group={contentGroup}
      groupNames={contentGroupsMock.groups?.map((group) => group.name)}
      parentGroupId={contentGroupsMock.id}
      contentGroupActions={contentGroupActions}
      handleEditGroup={handleEditGroupMock}
      {...props}
    />,
    { path: '/course/:courseId/group_configurations', params: { courseId } },
  );

/** The card title is a button whose accessible name includes the group name and its id. */
const getCardTitle = (group: Group) => screen.getByRole('button', { name: new RegExp(group.name) });

describe('<ContentGroupCard />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders component correctly', () => {
    renderComponent();

    expect(screen.getByText(contentGroup.name)).toBeInTheDocument();
    expect(
      screen.getByText(
        commonMessages.titleId.defaultMessage.replace('{id}', String(contentGroup.id)),
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(rootMessages.notInUse.defaultMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.actionEdit.defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.actionDelete.defaultMessage })).toBeInTheDocument();
  });

  it('expands/collapses the container group content on title click', async () => {
    const user = userEvent.setup();
    renderComponent();
    const cardTitle = getCardTitle(contentGroup);

    await user.click(cardTitle);
    expect(screen.queryByText(rootMessages.notInUse.defaultMessage)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: messages.courseOutline.defaultMessage })).toBeInTheDocument();

    await user.click(cardTitle);
    expect(screen.getByText(rootMessages.notInUse.defaultMessage)).toBeInTheDocument();
  });

  it('renders content group badge with used only one location', () => {
    renderComponent({ group: contentGroupWithOnlyOneUsage });

    expect(screen.getByText('Used in 1 location')).toBeInTheDocument();
  });

  it('renders content group badge with used locations', () => {
    renderComponent({ group: contentGroupWithUsages });

    expect(
      screen.getByText(`Used in ${contentGroupWithUsages.usage?.length} locations`),
    ).toBeInTheDocument();
  });

  it('renders group controls without access to units', async () => {
    const user = userEvent.setup();
    renderComponent();

    expect(screen.queryByText(commonMessages.accessTo.defaultMessage)).not.toBeInTheDocument();

    await user.click(getCardTitle(contentGroup));
    expect(screen.getByRole('link', { name: messages.courseOutline.defaultMessage })).toBeInTheDocument();
  });

  it('deletes the group with its parent id on delete confirmation', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: messages.actionDelete.defaultMessage }));
    await user.click(
      screen.getByRole('button', { name: deleteModalMessages.deleteButton.defaultMessage }),
    );

    expect(handleDeleteMock).toHaveBeenCalledWith(contentGroupsMock.id, contentGroup.id);
  });

  it('does not delete when the card has no parent group id', async () => {
    const user = userEvent.setup();
    renderComponent({ parentGroupId: undefined });

    await user.click(screen.getByRole('button', { name: messages.actionDelete.defaultMessage }));
    await user.click(
      screen.getByRole('button', { name: deleteModalMessages.deleteButton.defaultMessage }),
    );

    expect(handleDeleteMock).not.toHaveBeenCalled();
  });

  it('edits the group with its id on save', async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole('button', { name: messages.actionEdit.defaultMessage }));
    const nameInput = screen.getByPlaceholderText(
      messages.newGroupInputPlaceholder.defaultMessage,
    );
    await user.clear(nameInput);
    await user.type(nameInput, 'Renamed group');
    await user.click(
      screen.getByRole('button', { name: messages.saveButton.defaultMessage }),
    );

    await waitFor(() => {
      expect(handleEditGroupMock).toHaveBeenCalledWith(
        contentGroup.id,
        expect.objectContaining({ newGroupName: 'Renamed group' }),
        expect.any(Function),
      );
    });
  });
});
