import { setConfig, getConfig } from '@edx/frontend-platform';

import { ITEM_BADGE_STATUS } from '@src/course-outline/constants';
import {
  act, fireEvent, initializeMocks, render, screen, waitFor,
} from '@src/testUtils';
import CardHeader from './CardHeader';
import TitleButton from './TitleButton';
import messages from './messages';

const onExpandMock = jest.fn();
const onClickMenuButtonMock = jest.fn();
const onClickPublishMock = jest.fn();
const onClickEditMock = jest.fn();
const onClickDeleteMock = jest.fn();
const onClickDuplicateMock = jest.fn();
const onClickConfigureMock = jest.fn();
const onClickMoveUpMock = jest.fn();
const onClickMoveDownMock = jest.fn();
const closeFormMock = jest.fn();

const mockGetTagsCount = jest.fn();

jest.mock('../../generic/data/api', () => ({
  ...jest.requireActual('../../generic/data/api'),
  getTagsCount: () => mockGetTagsCount(),
}));

const cardHeaderProps = {
  title: 'Some title',
  status: ITEM_BADGE_STATUS.live,
  cardId: '12345',
  hasChanges: false,
  onClickMenuButton: onClickMenuButtonMock,
  onClickPublish: onClickPublishMock,
  onClickEdit: onClickEditMock,
  isFormOpen: false,
  onEditSubmit: jest.fn(),
  closeForm: closeFormMock,
  isDisabledEditField: false,
  onClickDelete: onClickDeleteMock,
  onClickDuplicate: onClickDuplicateMock,
  onClickConfigure: onClickConfigureMock,
  onClickMoveUp: onClickMoveUpMock,
  onClickMoveDown: onClickMoveDownMock,
  isSequential: true,
  namePrefix: 'subsection',
  actions: {
    draggable: true,
    childAddable: true,
    deletable: true,
    duplicable: true,
  },
};

const renderComponent = (props?: object, entry = '/') => {
  const titleComponent = (
    <TitleButton
      isExpanded
      title={cardHeaderProps.title}
      onTitleClick={onExpandMock}
      namePrefix={cardHeaderProps.namePrefix}
      {...props}
    />
  );

  return render(
    <CardHeader
      {...cardHeaderProps}
      titleComponent={titleComponent}
      {...props}
    />,
    {
      path: '/',
      routerProps: {
        initialEntries: [entry],
      },
    },
  );
};

describe('<CardHeader />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('render CardHeader component correctly', async () => {
    renderComponent();

    expect(await screen.findByText(cardHeaderProps.title)).toBeInTheDocument();
    expect(await screen.findByTestId('subsection-card-header__expanded-btn')).toBeInTheDocument();
    expect(await screen.findByTestId('subsection-card-header__menu')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByTestId('edit field')).not.toBeInTheDocument();
    });
  });

  it('render status badge as live', async () => {
    renderComponent();
    expect(await screen.findByText(messages.statusBadgeLive.defaultMessage)).toBeInTheDocument();
  });

  it('render status badge as published_not_live', async () => {
    renderComponent({
      ...cardHeaderProps,
      status: ITEM_BADGE_STATUS.publishedNotLive,
    });

    expect(await screen.findByText(messages.statusBadgePublishedNotLive.defaultMessage)).toBeInTheDocument();
  });

  it('render status badge as staff_only', async () => {
    renderComponent({
      ...cardHeaderProps,
      status: ITEM_BADGE_STATUS.staffOnly,
    });

    expect(await screen.findByText(messages.statusBadgeStaffOnly.defaultMessage)).toBeInTheDocument();
  });

  it('render status badge as draft', async () => {
    renderComponent({
      ...cardHeaderProps,
      status: ITEM_BADGE_STATUS.draft,
    });

    expect(await screen.findByText(messages.statusBadgeDraft.defaultMessage)).toBeInTheDocument();
  });

  it('check publish menu item is disabled when subsection status is live or published not live and it has no changes', async () => {
    renderComponent({
      ...cardHeaderProps,
      status: ITEM_BADGE_STATUS.publishedNotLive,
    });

    const menuButton = await screen.findByTestId('subsection-card-header__menu-button');
    fireEvent.click(menuButton);
    expect(await screen.findByText(messages.menuPublish.defaultMessage)).toHaveAttribute('aria-disabled', 'true');
  });

  it('check publish menu item is enabled when subsection status is live or published not live and it has changes', async () => {
    renderComponent({
      ...cardHeaderProps,
      status: ITEM_BADGE_STATUS.publishedNotLive,
      hasChanges: true,
    });

    const menuButton = await screen.findByTestId('subsection-card-header__menu-button');
    fireEvent.click(menuButton);
    expect(await screen.findByText(messages.menuPublish.defaultMessage)).not.toHaveAttribute('aria-disabled');
  });

  it('calls handleExpanded when button is clicked', async () => {
    renderComponent();

    const expandButton = await screen.findByTestId('subsection-card-header__expanded-btn');
    fireEvent.click(expandButton);
    expect(onExpandMock).toHaveBeenCalled();
  });

  it('calls onClickMenuButton when menu is clicked', async () => {
    renderComponent();

    const menuButton = await screen.findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(menuButton));
    expect(onClickMenuButtonMock).toHaveBeenCalled();
  });

  it('calls onClickPublish when item is clicked', async () => {
    renderComponent({
      ...cardHeaderProps,
      status: ITEM_BADGE_STATUS.draft,
    });

    const menuButton = await screen.findByTestId('subsection-card-header__menu-button');
    fireEvent.click(menuButton);

    const publishMenuItem = await screen.findByText(messages.menuPublish.defaultMessage);
    await act(async () => fireEvent.click(publishMenuItem));
    expect(onClickPublishMock).toHaveBeenCalled();
  });

  it('only shows Manage tags menu if the waffle flag is enabled', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'false',
    });
    renderComponent();
    const menuButton = await screen.findByTestId('subsection-card-header__menu-button');
    fireEvent.click(menuButton);

    expect(screen.queryByText(messages.menuManageTags.defaultMessage)).not.toBeInTheDocument();
  });

  it('shows ContentTagsDrawer when the menu is clicked', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
    });
    renderComponent();
    const menuButton = await screen.findByTestId('subsection-card-header__menu-button');
    fireEvent.click(menuButton);

    const manageTagsMenuItem = await screen.findByText(messages.menuManageTags.defaultMessage);
    fireEvent.click(manageTagsMenuItem);

    // Check if the drawer is open
    expect(screen.getAllByText('Manage tags').length).toBe(2);
  });

  it('calls onClickEdit when the button is clicked', async () => {
    renderComponent();

    const editButton = await screen.findByTestId('subsection-edit-button');
    await act(async () => fireEvent.click(editButton));
    expect(onClickEditMock).toHaveBeenCalled();
  });

  it('check is field visible when isFormOpen is true', async () => {
    renderComponent({
      ...cardHeaderProps,
      isFormOpen: true,
    });

    expect(await screen.findByTestId('subsection-edit-field')).toBeInTheDocument();
    waitFor(() => {
      expect(screen.queryByTestId('subsection-card-header__expanded-btn')).not.toBeInTheDocument();
      expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
    });
  });

  it('check is field disabled when isDisabledEditField is true', async () => {
    renderComponent({
      ...cardHeaderProps,
      isFormOpen: true,
      isDisabledEditField: true,
    });

    expect(await screen.findByTestId('subsection-edit-field')).toBeDisabled();
  });

  it('check editing is enabled when isDisabledEditField is false', async () => {
    renderComponent({ ...cardHeaderProps });

    expect(screen.getByTestId('subsection-edit-button')).toBeEnabled();

    // Ensure menu items related to editing are enabled
    const menuButton = screen.getByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(menuButton));
    expect(await screen.findByTestId('subsection-card-header__menu-configure-button')).not.toHaveAttribute('aria-disabled');
    expect(await screen.findByTestId('subsection-card-header__menu-manage-tags-button')).not.toHaveAttribute('aria-disabled');
  });

  it('check editing is disabled when isDisabledEditField is true', async () => {
    renderComponent({ ...cardHeaderProps, isDisabledEditField: true });

    expect(await screen.findByTestId('subsection-edit-button')).toBeDisabled();

    // Ensure menu items related to editing are disabled
    const menuButton = await screen.findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(menuButton));
    expect(await screen.findByTestId('subsection-card-header__menu-configure-button')).toHaveAttribute('aria-disabled', 'true');
    expect(await screen.findByTestId('subsection-card-header__menu-manage-tags-button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('calls onClickDelete when item is clicked', async () => {
    renderComponent();

    const menuButton = await screen.findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(menuButton));
    const deleteMenuItem = await screen.findByText(messages.menuDelete.defaultMessage);
    await act(async () => fireEvent.click(deleteMenuItem));
    expect(onClickDeleteMock).toHaveBeenCalledTimes(1);
  });

  it('calls onClickDuplicate when item is clicked', async () => {
    renderComponent();

    const menuButton = await screen.findByTestId('subsection-card-header__menu-button');
    fireEvent.click(menuButton);

    const duplicateMenuItem = await screen.findByText(messages.menuDuplicate.defaultMessage);
    fireEvent.click(duplicateMenuItem);
    await act(async () => fireEvent.click(duplicateMenuItem));
    expect(onClickDuplicateMock).toHaveBeenCalled();
  });

  it('check if proctoringExamConfigurationLink is visible', async () => {
    renderComponent({
      ...cardHeaderProps,
      proctoringExamConfigurationLink: 'proctoringlink',
      isSequential: true,
    });

    const menuButton = await screen.findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(menuButton));

    const element = await screen.findByText(messages.menuProctoringLinkText.defaultMessage);
    expect(element).toBeInTheDocument();
    expect(element.getAttribute('href')).toBe(`${getConfig().STUDIO_BASE_URL}/proctoringlink`);
  });

  it('check if proctoringExamConfigurationLink is absolute', async () => {
    renderComponent({
      ...cardHeaderProps,
      proctoringExamConfigurationLink: 'http://localhost:9000/proctoringlink',
      isSequential: true,
    });

    const menuButton = await screen.findByTestId('subsection-card-header__menu-button');
    await act(async () => fireEvent.click(menuButton));

    const element = await screen.findByText(messages.menuProctoringLinkText.defaultMessage);
    expect(element).toBeInTheDocument();
    expect(element.getAttribute('href')).toBe('http://localhost:9000/proctoringlink');
  });

  it('check if discussion enabled badge is visible', async () => {
    renderComponent({
      ...cardHeaderProps,
      isVertical: true,
      discussionEnabled: true,
      discussionsSettings: {
        providerType: 'openedx',
        enableGradedUnits: true,
      },
      parentInfo: {
        isTimeLimited: false,
        graded: false,
      },
    });

    expect(screen.queryByText(messages.discussionEnabledBadgeText.defaultMessage)).toBeInTheDocument();
  });

  it('should render tag count if is not zero and the waffle flag is enabled', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
    });
    mockGetTagsCount.mockResolvedValue({ 12345: 17 });
    renderComponent();
    expect(await screen.findByText('17')).toBeInTheDocument();
  });

  it('shouldn render tag count if the waffle flag is disabled', async () => {
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'false',
    });
    mockGetTagsCount.mockResolvedValue({ 12345: 17 });
    renderComponent();
    expect(screen.queryByText('17')).not.toBeInTheDocument();
  });

  it('should not render tag count if is zero', () => {
    setConfig({
      ...getConfig(),
      ENABLE_TAGGING_TAXONOMY_PAGES: 'true',
    });
    mockGetTagsCount.mockResolvedValue({ 12345: 0 });
    renderComponent();
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should render sync button when is ready to sync', () => {
    const mockClickSync = jest.fn();

    renderComponent({
      readyToSync: true,
      onClickSync: mockClickSync,
    });

    const syncButton = screen.getByRole('button', { name: /update available - click to sync/i });
    expect(syncButton).toBeInTheDocument();
    fireEvent.click(syncButton);

    expect(mockClickSync).toHaveBeenCalled();
  });
});
