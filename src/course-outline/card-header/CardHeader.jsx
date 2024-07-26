// @ts-check
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
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
} from '@openedx/paragon/icons';

import { useContentTagsCount } from '../../generic/data/apiHooks';
import { ContentTagsDrawerSheet } from '../../content-tags-drawer';
import TagCount from '../../generic/tag-count';
import { useEscapeClick } from '../../hooks';
import { ITEM_BADGE_STATUS } from '../constants';
import { scrollToElement } from '../utils';
import CardStatus from './CardStatus';
import messages from './messages';

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
}) => {
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
          || (!discussionsSettings?.enableGradedUnits && !parentInfo.graded)
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
              aria-label="edit field"
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
            <IconButton
              className="item-card-edit-icon"
              data-testid={`${namePrefix}-edit-button`}
              alt={intl.formatMessage(messages.altButtonEdit)}
              iconAs={EditIcon}
              onClick={onClickEdit}
            />
          </>
        )}
        <div className="ml-auto d-flex">
          {(isVertical || isSequential) && (
            <CardStatus status={status} showDiscussionsEnabledBadge={showDiscussionsEnabledBadge} />
          )}
          { getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true' && !!contentTagCount && (
            <TagCount count={contentTagCount} onClick={openManageTagsDrawer} />
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
                onClick={onClickConfigure}
              >
                {intl.formatMessage(messages.menuConfigure)}
              </Dropdown.Item>
              {getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true' && (
                <Dropdown.Item
                  data-testid={`${namePrefix}-card-header__menu-manage-tags-button`}
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

CardHeader.defaultProps = {
  enableCopyPasteUnits: false,
  isVertical: false,
  isSequential: false,
  onClickCopy: null,
  proctoringExamConfigurationLink: null,
  discussionEnabled: false,
  discussionsSettings: {},
  parentInfo: {},
  cardId: '',
};

CardHeader.propTypes = {
  title: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  cardId: PropTypes.string,
  hasChanges: PropTypes.bool.isRequired,
  onClickPublish: PropTypes.func.isRequired,
  onClickConfigure: PropTypes.func.isRequired,
  onClickMenuButton: PropTypes.func.isRequired,
  onClickEdit: PropTypes.func.isRequired,
  isFormOpen: PropTypes.bool.isRequired,
  onEditSubmit: PropTypes.func.isRequired,
  closeForm: PropTypes.func.isRequired,
  isDisabledEditField: PropTypes.bool.isRequired,
  onClickDelete: PropTypes.func.isRequired,
  onClickDuplicate: PropTypes.func.isRequired,
  onClickMoveUp: PropTypes.func.isRequired,
  onClickMoveDown: PropTypes.func.isRequired,
  onClickCopy: PropTypes.func,
  titleComponent: PropTypes.node.isRequired,
  namePrefix: PropTypes.string.isRequired,
  proctoringExamConfigurationLink: PropTypes.string,
  actions: PropTypes.shape({
    deletable: PropTypes.bool.isRequired,
    draggable: PropTypes.bool.isRequired,
    childAddable: PropTypes.bool.isRequired,
    duplicable: PropTypes.bool.isRequired,
    allowMoveUp: PropTypes.bool,
    allowMoveDown: PropTypes.bool,
  }).isRequired,
  enableCopyPasteUnits: PropTypes.bool,
  isVertical: PropTypes.bool,
  isSequential: PropTypes.bool,
  discussionEnabled: PropTypes.bool,
  discussionsSettings: PropTypes.shape({
    providerType: PropTypes.string,
    enableGradedUnits: PropTypes.bool,
  }),
  parentInfo: PropTypes.shape({
    isTimeLimited: PropTypes.bool,
    graded: PropTypes.bool,
  }),
};

export default CardHeader;
