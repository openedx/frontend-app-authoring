import {
  ReactNode, useCallback, useEffect, useRef, useState,
} from 'react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useSearchParams } from 'react-router-dom';
import {
  Dropdown,
  Form,
  Hyperlink,
  Icon,
  IconButton,
  IconButtonWithTooltip,
  Stack,
  useToggle,
} from '@openedx/paragon';
import {
  MoreVert as MoveVertIcon,
  EditOutline as EditIcon,
  Sync as SyncIcon,
} from '@openedx/paragon/icons';

import { useContentTagsCount } from '@src/generic/data/apiHooks';
import { ContentTagsDrawerSheet } from '@src/content-tags-drawer';
import TagCount from '@src/generic/tag-count';
import { useEscapeClick } from '@src/hooks';
import { XBlockActions } from '@src/data/types';
import { useUpdateCourseBlockName } from '@src/course-outline/data/apiHooks';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { ITEM_BADGE_STATUS } from '../constants';
import { scrollToElement } from '../utils';
import CardStatus from './CardStatus';
import messages from './messages';
import { useOutlineSidebarContext } from '../outline-sidebar/OutlineSidebarContext';

interface CardHeaderProps {
  title: string;
  status: string;
  cardId: string,
  hasChanges: boolean;
  onClickPublish: () => void;
  onClickConfigure: () => void;
  onClickMenuButton: () => void;
  onClickDelete: () => void;
  onClickUnlink: () => void;
  onClickDuplicate: () => void;
  onClickMoveUp: () => void;
  onClickMoveDown: () => void;
  onClickCopy?: () => void;
  onClickCard?: (e: React.MouseEvent) => void;
  onClickManageTags?: () => void;
  titleComponent: ReactNode;
  namePrefix: string;
  proctoringExamConfigurationLink?: string,
  actions: XBlockActions,
  enableCopyPasteUnits?: boolean;
  isVertical?: boolean;
  isSequential?: boolean;
  discussionEnabled?: boolean;
  discussionsSettings?: {
    providerType: string;
    enableGradedUnits: boolean;
  };
  parentInfo?: {
    graded: boolean;
    isTimeLimited?: boolean;
  },
  // An optional component that is rendered before the dropdown. This is used by the Subsection
  // and Unit card components to render their plugin slots.
  extraActionsComponent?: ReactNode,
  onClickSync?: () => void;
  readyToSync?: boolean;
}

const CardHeader = ({
  title,
  status,
  cardId,
  hasChanges,
  onClickPublish,
  onClickConfigure,
  onClickMenuButton,
  onClickDelete,
  onClickUnlink,
  onClickDuplicate,
  onClickMoveUp,
  onClickMoveDown,
  onClickCopy,
  onClickCard,
  onClickManageTags,
  titleComponent,
  namePrefix,
  actions,
  enableCopyPasteUnits,
  isVertical,
  isSequential,
  proctoringExamConfigurationLink,
  discussionEnabled,
  discussionsSettings,
  parentInfo,
  extraActionsComponent,
  onClickSync,
  readyToSync,
}: CardHeaderProps) => {
  const intl = useIntl();
  const [searchParams] = useSearchParams();
  const [titleValue, setTitleValue] = useState(title);
  const cardHeaderRef = useRef(null);
  const [isLegacyManageTagsDrawerOpen, openLegacyTagsDrawer, closeLegacyTagsDrawer] = useToggle(false);
  const { setCurrentPageKey } = useOutlineSidebarContext();

  const openManageTagsDrawer = useCallback(() => {
    const showNewSidebar = getConfig().ENABLE_COURSE_OUTLINE_NEW_DESIGN?.toString().toLowerCase() === 'true';
    const showAlignSidebar = getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true';
    if (showNewSidebar && showAlignSidebar) {
      setCurrentPageKey('align');
      onClickMenuButton();
      onClickManageTags?.();
    } else {
      openLegacyTagsDrawer();
    }
  }, [setCurrentPageKey, openLegacyTagsDrawer, cardId]);
  const { courseId, currentSelection } = useCourseAuthoringContext();
  const [isFormOpen, openForm, closeForm] = useToggle(false);

  // Use studio url as base if proctoringExamConfigurationLink is a relative link
  const fullProctoringExamConfigurationLink = () => (
    proctoringExamConfigurationLink && new URL(proctoringExamConfigurationLink, getConfig().STUDIO_BASE_URL).href
  );

  const isDisabledPublish = (status === ITEM_BADGE_STATUS.live
    || status === ITEM_BADGE_STATUS.publishedNotLive) && !hasChanges;

  const { data: contentTagCount } = useContentTagsCount(cardId);

  const onEditClick = () => {
    onClickMenuButton();
    openForm();
  };

  useEffect(() => {
    const locatorId = searchParams.get('show');
    if (!locatorId) {
      return;
    }

    if (cardHeaderRef.current && locatorId === cardId) {
      scrollToElement(cardHeaderRef.current);
    }
  }, []);

  const showDiscussionsEnabledBadge = (
    isVertical
      && !parentInfo?.isTimeLimited
      && discussionEnabled
      && discussionsSettings?.providerType === 'openedx'
      && (
        discussionsSettings?.enableGradedUnits
          || (!discussionsSettings?.enableGradedUnits && !parentInfo?.graded)
      )
  );

  useEscapeClick({
    onEscape: /* istanbul ignore next */ () => {
      setTitleValue(title);
      closeForm();
    },
    dependency: [title],
  });

  const editMutation = useUpdateCourseBlockName(courseId);
  const handleEditSubmit = useCallback(() => {
    if (title !== titleValue) {
      editMutation.mutate({
        itemId: cardId,
        displayName: titleValue,
        subsectionId: currentSelection?.subsectionId,
        sectionId: currentSelection?.sectionId,
      }, {
        onSettled: () => closeForm(),
      });
    } else {
      closeForm();
    }
  }, [title, titleValue, cardId, editMutation]);

  return (
    <>
      {
        /* This is a special case; we can skip accessibility here (tabbing and select with keyboard) since the
        `SortableItem` component handles that for the whole `{Container}Card`.
        This `onClick` allows the user to select the Card by clicking on white areas of this component. */
      }
      <div // eslint-disable-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
        className="item-card-header"
        data-testid={`${namePrefix}-card-header`}
        ref={cardHeaderRef}
        onClick={onClickCard}
      >
        {isFormOpen ? (
          <Form.Group className="m-0 w-75">
            <Form.Control
              data-testid={`${namePrefix}-edit-field`}
              ref={(e) => e && e.focus()}
              value={titleValue}
              name="displayName"
              onChange={(e) => setTitleValue(e.target.value)}
              aria-label={intl.formatMessage(messages.editFieldAriaLabel)}
              onBlur={handleEditSubmit}
              onKeyDown={/* istanbul ignore next */ (e) => {
                if (e.key === 'Enter') {
                  handleEditSubmit();
                } else if (e.key === ' ') {
                  // Avoid passing propagation to the `SortableItem` in the card,
                  // which executes a `preventDefault`. If propagation is not prevented,
                  // spaces cannot be added to names.
                  e.stopPropagation();
                }
              }}
              disabled={editMutation.isPending}
            />
          </Form.Group>
        ) : (
          <Stack direction="horizontal" gap={2}>
            {titleComponent}
            <IconButtonWithTooltip
              className="item-card-button-icon"
              data-testid={`${namePrefix}-edit-button`}
              alt={intl.formatMessage(messages.altButtonRename)}
              tooltipContent={<div>{intl.formatMessage(messages.altButtonRename)}</div>}
              iconAs={EditIcon}
              onClick={onEditClick}
              disabled={editMutation.isPending}
            />
          </Stack>
        )}
        <div className="ml-auto d-flex">
          {(isVertical || isSequential) && (
            <CardStatus status={status} showDiscussionsEnabledBadge={showDiscussionsEnabledBadge || false} />
          )}
          { getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true' && !!contentTagCount && (
            <TagCount count={contentTagCount} onClick={openManageTagsDrawer} />
          )}
          {extraActionsComponent}
          {readyToSync && (
            <IconButtonWithTooltip
              data-testid={`${namePrefix}-sync-button`}
              alt={intl.formatMessage(messages.readyToSyncButtonAlt)}
              iconAs={SyncIcon}
              tooltipContent={<div>{intl.formatMessage(messages.readyToSyncButtonAlt)}</div>}
              onClick={onClickSync}
            />
          )}
          <Dropdown data-testid={`${namePrefix}-card-header__menu`} onClick={onClickMenuButton}>
            <Dropdown.Toggle
              className="item-card-header__menu"
              id={`${namePrefix}-card-header__menu`}
              data-testid={`${namePrefix}-card-header__menu-button`}
              as={IconButton}
              src={MoveVertIcon}
              alt={`${namePrefix}-card-header__menu`}
              iconAs={Icon}
            />
            <Dropdown.Menu>
              {isSequential && proctoringExamConfigurationLink && (
                <Dropdown.Item
                  as={Hyperlink}
                  target="_blank"
                  destination={fullProctoringExamConfigurationLink()}
                  href={fullProctoringExamConfigurationLink()}
                  externalLinkTitle={intl.formatMessage(messages.proctoringLinkTooltip)}
                >
                  {intl.formatMessage(messages.menuProctoringLinkText)}
                </Dropdown.Item>
              )}
              <Dropdown.Item
                data-testid={`${namePrefix}-card-header__menu-publish-button`}
                disabled={isDisabledPublish}
                onClick={onClickPublish}
              >
                {intl.formatMessage(messages.menuPublish)}
              </Dropdown.Item>
              <Dropdown.Item
                data-testid={`${namePrefix}-card-header__menu-configure-button`}
                disabled={editMutation.isPending}
                onClick={onClickConfigure}
              >
                {intl.formatMessage(messages.menuConfigure)}
              </Dropdown.Item>
              {getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true' && (
                <Dropdown.Item
                  data-testid={`${namePrefix}-card-header__menu-manage-tags-button`}
                  disabled={editMutation.isPending}
                  onClick={openManageTagsDrawer}
                >
                  {intl.formatMessage(messages.menuManageTags)}
                </Dropdown.Item>
              )}

              {isVertical && enableCopyPasteUnits && (
                <Dropdown.Item onClick={onClickCopy}>
                  {intl.formatMessage(messages.menuCopy)}
                </Dropdown.Item>
              )}
              {actions.duplicable && (
                <Dropdown.Item
                  data-testid={`${namePrefix}-card-header__menu-duplicate-button`}
                  onClick={onClickDuplicate}
                >
                  {intl.formatMessage(messages.menuDuplicate)}
                </Dropdown.Item>
              )}
              {actions.draggable && (
              <>
                <Dropdown.Item
                  data-testid={`${namePrefix}-card-header__menu-move-up-button`}
                  onClick={onClickMoveUp}
                  disabled={!actions.allowMoveUp}
                >
                  {intl.formatMessage(messages.menuMoveUp)}
                </Dropdown.Item>
                <Dropdown.Item
                  data-testid={`${namePrefix}-card-header__menu-move-down-button`}
                  onClick={onClickMoveDown}
                  disabled={!actions.allowMoveDown}
                >
                  {intl.formatMessage(messages.menuMoveDown)}
                </Dropdown.Item>
              </>
              )}
              {((actions.unlinkable ?? null) !== null || actions.deletable) && <Dropdown.Divider />}
              {(actions.unlinkable ?? null) !== null && (
              <Dropdown.Item
                data-testid={`${namePrefix}-card-header__menu-unlink-button`}
                onClick={onClickUnlink}
                disabled={!actions.unlinkable}
                className="allow-hover-on-disabled"
                title={!actions.unlinkable ? intl.formatMessage(messages.menuUnlinkDisabledTooltip) : undefined}
              >
                {intl.formatMessage(messages.menuUnlink)}
              </Dropdown.Item>
              )}
              {actions.deletable && (
              <Dropdown.Item
                data-testid={`${namePrefix}-card-header__menu-delete-button`}
                onClick={onClickDelete}
              >
                {intl.formatMessage(messages.menuDelete)}
              </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      <ContentTagsDrawerSheet
        id={cardId}
        onClose={/* istanbul ignore next */ () => closeLegacyTagsDrawer()}
        showSheet={isLegacyManageTagsDrawerOpen}
      />
    </>
  );
};

export default CardHeader;
