import {
  ReactNode, useEffect, useRef, useState,
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
import { ITEM_BADGE_STATUS } from '../constants';
import { scrollToElement } from '../utils';
import CardStatus from './CardStatus';
import messages from './messages';

interface CardHeaderProps {
  title: string;
  status: string;
  cardId?: string,
  hasChanges: boolean;
  onClickPublish: () => void;
  onClickConfigure: () => void;
  onClickMenuButton: () => void;
  onClickEdit: () => void;
  isFormOpen: boolean;
  onEditSubmit: (titleValue: string) => void;
  closeForm: () => void;
  isDisabledEditField: boolean;
  onClickDelete: () => void;
  onClickDuplicate: () => void;
  onClickMoveUp: () => void;
  onClickMoveDown: () => void;
  onClickCopy?: () => void;
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
  onClickEdit,
  isFormOpen,
  onEditSubmit,
  closeForm,
  isDisabledEditField,
  onClickDelete,
  onClickDuplicate,
  onClickMoveUp,
  onClickMoveDown,
  onClickCopy,
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
  const [isManageTagsDrawerOpen, openManageTagsDrawer, closeManageTagsDrawer] = useToggle(false);

  // Use studio url as base if proctoringExamConfigurationLink is a relative link
  const fullProctoringExamConfigurationLink = () => (
    proctoringExamConfigurationLink && new URL(proctoringExamConfigurationLink, getConfig().STUDIO_BASE_URL).href
  );

  const isDisabledPublish = (status === ITEM_BADGE_STATUS.live
    || status === ITEM_BADGE_STATUS.publishedNotLive) && !hasChanges;

  const { data: contentTagCount } = useContentTagsCount(cardId);

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
    onEscape: () => {
      setTitleValue(title);
      closeForm();
    },
    dependency: title,
  });

  return (
    <>
      <div
        className="item-card-header"
        data-testid={`${namePrefix}-card-header`}
        ref={cardHeaderRef}
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
              onBlur={() => onEditSubmit(titleValue)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onEditSubmit(titleValue);
                }
              }}
              disabled={isDisabledEditField}
            />
          </Form.Group>
        ) : (
          <>
            {titleComponent}
            {readyToSync && (
              <IconButton
                className="item-card-button-icon"
                data-testid={`${namePrefix}-sync-button`}
                alt={intl.formatMessage(messages.readyToSyncButtonAlt)}
                iconAs={SyncIcon}
                onClick={onClickSync}
              />
            )}
            <IconButton
              className="item-card-button-icon"
              data-testid={`${namePrefix}-edit-button`}
              alt={intl.formatMessage(messages.altButtonEdit)}
              iconAs={EditIcon}
              onClick={onClickEdit}
              // @ts-ignore
              disabled={isDisabledEditField}
            />
          </>
        )}
        <div className="ml-auto d-flex">
          {(isVertical || isSequential) && (
            <CardStatus status={status} showDiscussionsEnabledBadge={showDiscussionsEnabledBadge || false} />
          )}
          { getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true' && !!contentTagCount && (
            <TagCount count={contentTagCount} onClick={openManageTagsDrawer} />
          )}
          {extraActionsComponent}
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
                disabled={isDisabledEditField}
                onClick={onClickConfigure}
              >
                {intl.formatMessage(messages.menuConfigure)}
              </Dropdown.Item>
              {getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true' && (
                <Dropdown.Item
                  data-testid={`${namePrefix}-card-header__menu-manage-tags-button`}
                  disabled={isDisabledEditField}
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
              {actions.deletable && (
                <Dropdown.Item
                  className="border-top border-light"
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
        onClose={/* istanbul ignore next */ () => closeManageTagsDrawer()}
        showSheet={isManageTagsDrawerOpen}
      />
    </>
  );
};

export default CardHeader;
