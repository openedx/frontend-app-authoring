import { MemoryRouter } from 'react-router-dom';
import {
  act, render, fireEvent, waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { ITEM_BADGE_STATUS } from '../constants';
import CardHeader from './CardHeader';
import BaseTitleWithStatusBadge from './BaseTitleWithStatusBadge';
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
  namePrefix: 'section',
  actions: {
    draggable: true,
    childAddable: true,
    deletable: true,
    duplicable: true,
  },
};

const renderComponent = (props, entry = '/') => {
  const titleComponent = (
    <TitleButton
      isExpanded
      onTitleClick={onExpandMock}
      namePrefix={cardHeaderProps.namePrefix}
      {...props}
    >
      <BaseTitleWithStatusBadge
        title={cardHeaderProps.title}
        status={cardHeaderProps.status}
        namePrefix={cardHeaderProps.namePrefix}
        {...props}
      />
    </TitleButton>
  );

  return render(
    <IntlProvider locale="en">
      <MemoryRouter initialEntries={[entry]}>
        <CardHeader
          {...cardHeaderProps}
          titleComponent={titleComponent}
          {...props}
        />
      </MemoryRouter>,
    </IntlProvider>,
  );
};

describe('<CardHeader />', () => {
  it('render CardHeader component correctly', async () => {
    const { findByText, findByTestId, queryByTestId } = renderComponent();

    expect(await findByText(cardHeaderProps.title)).toBeInTheDocument();
    expect(await findByTestId('section-card-header__expanded-btn')).toBeInTheDocument();
    expect(await findByTestId('section-card-header__badge-status')).toBeInTheDocument();
    expect(await findByTestId('section-card-header__menu')).toBeInTheDocument();
    await waitFor(() => {
      expect(queryByTestId('edit field')).not.toBeInTheDocument();
    });
  });

  it('render status badge as live', async () => {
    const { findByText } = renderComponent();
    expect(await findByText(messages.statusBadgeLive.defaultMessage)).toBeInTheDocument();
  });

  it('render status badge as published_not_live', async () => {
    const { findByText } = renderComponent({
      ...cardHeaderProps,
      status: ITEM_BADGE_STATUS.publishedNotLive,
    });

    expect(await findByText(messages.statusBadgePublishedNotLive.defaultMessage)).toBeInTheDocument();
  });

  it('render status badge as staff_only', async () => {
    const { findByText } = renderComponent({
      ...cardHeaderProps,
      status: ITEM_BADGE_STATUS.staffOnly,
    });

    expect(await findByText(messages.statusBadgeStaffOnly.defaultMessage)).toBeInTheDocument();
  });

  it('render status badge as draft', async () => {
    const { findByText } = renderComponent({
      ...cardHeaderProps,
      status: ITEM_BADGE_STATUS.draft,
    });

    expect(await findByText(messages.statusBadgeDraft.defaultMessage)).toBeInTheDocument();
  });

  it('check publish menu item is disabled when section status is live or published not live and it has no changes', async () => {
    const { findByText, findByTestId } = renderComponent({
      ...cardHeaderProps,
      status: ITEM_BADGE_STATUS.publishedNotLive,
    });

    const menuButton = await findByTestId('section-card-header__menu-button');
    fireEvent.click(menuButton);
    expect(await findByText(messages.menuPublish.defaultMessage)).toHaveAttribute('aria-disabled', 'true');
  });

  it('check publish menu item is enabled when section status is live or published not live and it has changes', async () => {
    const { findByText, findByTestId } = renderComponent({
      ...cardHeaderProps,
      status: ITEM_BADGE_STATUS.publishedNotLive,
      hasChanges: true,
    });

    const menuButton = await findByTestId('section-card-header__menu-button');
    fireEvent.click(menuButton);
    expect(await findByText(messages.menuPublish.defaultMessage)).not.toHaveAttribute('aria-disabled');
  });

  it('calls handleExpanded when button is clicked', async () => {
    const { findByTestId } = renderComponent();

    const expandButton = await findByTestId('section-card-header__expanded-btn');
    fireEvent.click(expandButton);
    expect(onExpandMock).toHaveBeenCalled();
  });

  it('calls onClickMenuButton when menu is clicked', async () => {
    const { findByTestId } = renderComponent();

    const menuButton = await findByTestId('section-card-header__menu-button');
    await act(async () => fireEvent.click(menuButton));
    expect(onClickMenuButtonMock).toHaveBeenCalled();
  });

  it('calls onClickPublish when item is clicked', async () => {
    const { findByText, findByTestId } = renderComponent({
      ...cardHeaderProps,
      status: ITEM_BADGE_STATUS.draft,
    });

    const menuButton = await findByTestId('section-card-header__menu-button');
    fireEvent.click(menuButton);

    const publishMenuItem = await findByText(messages.menuPublish.defaultMessage);
    await act(async () => fireEvent.click(publishMenuItem));
    expect(onClickPublishMock).toHaveBeenCalled();
  });

  it('calls onClickEdit when the button is clicked', async () => {
    const { findByTestId } = renderComponent();

    const editButton = await findByTestId('section-edit-button');
    await act(async () => fireEvent.click(editButton));
    expect(onClickEditMock).toHaveBeenCalled();
  });

  it('check is field visible when isFormOpen is true', async () => {
    const { findByTestId, queryByTestId } = renderComponent({
      ...cardHeaderProps,
      isFormOpen: true,
    });

    expect(await findByTestId('section-edit-field')).toBeInTheDocument();
    waitFor(() => {
      expect(queryByTestId('section-card-header__expanded-btn')).not.toBeInTheDocument();
      expect(queryByTestId('edit-button')).not.toBeInTheDocument();
    });
  });

  it('check is field disabled when isDisabledEditField is true', async () => {
    const { findByTestId } = renderComponent({
      ...cardHeaderProps,
      isFormOpen: true,
      isDisabledEditField: true,
    });

    expect(await findByTestId('section-edit-field')).toBeDisabled();
  });

  it('calls onClickDelete when item is clicked', async () => {
    const { findByText, findByTestId } = renderComponent();

    const menuButton = await findByTestId('section-card-header__menu-button');
    await act(async () => fireEvent.click(menuButton));
    const deleteMenuItem = await findByText(messages.menuDelete.defaultMessage);
    await act(async () => fireEvent.click(deleteMenuItem));
    expect(onClickDeleteMock).toHaveBeenCalledTimes(1);
  });

  it('calls onClickDuplicate when item is clicked', async () => {
    const { findByText, findByTestId } = renderComponent();

    const menuButton = await findByTestId('section-card-header__menu-button');
    fireEvent.click(menuButton);

    const duplicateMenuItem = await findByText(messages.menuDuplicate.defaultMessage);
    fireEvent.click(duplicateMenuItem);
    await act(async () => fireEvent.click(duplicateMenuItem));
    expect(onClickDuplicateMock).toHaveBeenCalled();
  });

  it('check if proctoringExamConfigurationLink is visible', async () => {
    const { findByText, findByTestId } = renderComponent({
      ...cardHeaderProps,
      proctoringExamConfigurationLink: 'https://localhost:8000/',
      isSequential: true,
    });

    const menuButton = await findByTestId('section-card-header__menu-button');
    await act(async () => fireEvent.click(menuButton));

    expect(await findByText(messages.menuProctoringLinkText.defaultMessage)).toBeInTheDocument();
  });

  it('check if discussion enabled badge is visible', async () => {
    const { queryByText } = renderComponent({
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

    expect(queryByText(messages.discussionEnabledBadgeText.defaultMessage)).toBeInTheDocument();
  });
});
