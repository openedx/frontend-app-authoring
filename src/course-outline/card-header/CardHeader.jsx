import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Dropdown,
  Form,
  Icon,
  IconButton,
  OverlayTrigger,
  Tooltip,
  Truncate,
} from '@edx/paragon';
import {
  ArrowDropDown as ArrowDownIcon,
  ArrowDropUp as ArrowUpIcon,
  MoreVert as MoveVertIcon,
  EditOutline as EditIcon,
} from '@edx/paragon/icons';
import classNames from 'classnames';

import { useEscapeClick } from '../../hooks';
import { ITEM_BADGE_STATUS } from '../constants';
import { getItemStatusBadgeContent } from '../utils';
import messages from './messages';

const CardHeader = ({
  title,
  status,
  hasChanges,
  isExpanded,
  onClickPublish,
  onClickConfigure,
  onClickMenuButton,
  onClickEdit,
  onExpand,
  isFormOpen,
  onEditSubmit,
  closeForm,
  isDisabledEditField,
  onClickDelete,
  onClickDuplicate,
  namePrefix,
}) => {
  const intl = useIntl();
  const [titleValue, setTitleValue] = useState(title);

  const { badgeTitle, badgeIcon } = getItemStatusBadgeContent(status, messages, intl);
  const isDisabledPublish = (status === ITEM_BADGE_STATUS.live
    || status === ITEM_BADGE_STATUS.publishedNotLive) && !hasChanges;

  useEscapeClick({
    onEscape: () => {
      setTitleValue(title);
      closeForm();
    },
    dependency: title,
  });

  return (
    <div className="item-card-header" data-testid={`${namePrefix}-card-header`}>
      {isFormOpen ? (
        <Form.Group className="m-0">
          <Form.Control
            data-testid="edit field"
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
        <OverlayTrigger
          placement="bottom-start"
          overlay={(
            <Tooltip
              id={intl.formatMessage(messages.expandTooltip)}
              className="item-card-header-tooltip"
            >
              {intl.formatMessage(messages.expandTooltip)}
            </Tooltip>
          )}
        >
          <Button
            iconBefore={isExpanded ? ArrowUpIcon : ArrowDownIcon}
            variant="tertiary"
            data-testid={`${namePrefix}-card-header__expanded-btn`}
            className="item-card-header__expanded-btn"
            onClick={() => onExpand((prevState) => !prevState)}
          >
            <Truncate lines={1} className={`${namePrefix}-card-title mb-0`}>{title}</Truncate>
            {badgeTitle && (
              <div className="item-card-header__badge-status" data-testid={`${namePrefix}-card-header__badge-status`}>
                {badgeIcon && (
                  <Icon
                    src={badgeIcon}
                    size="sm"
                    className={classNames({ 'text-success-500': status === ITEM_BADGE_STATUS.live })}
                  />
                )}
                <span className="small">{badgeTitle}</span>
              </div>
            )}
          </Button>
        </OverlayTrigger>
      )}
      <div className="ml-auto d-flex">
        {!isFormOpen && (
          <IconButton
            data-testid="edit-button"
            alt={intl.formatMessage(messages.altButtonEdit)}
            iconAs={EditIcon}
            onClick={onClickEdit}
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
            <Dropdown.Item
              disabled={isDisabledPublish}
              onClick={onClickPublish}
            >
              {intl.formatMessage(messages.menuPublish)}
            </Dropdown.Item>
            <Dropdown.Item onClick={onClickConfigure}>{intl.formatMessage(messages.menuConfigure)}</Dropdown.Item>
            <Dropdown.Item onClick={onClickDuplicate}>{intl.formatMessage(messages.menuDuplicate)}</Dropdown.Item>
            <Dropdown.Item onClick={onClickDelete}>{intl.formatMessage(messages.menuDelete)}</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

CardHeader.propTypes = {
  title: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  hasChanges: PropTypes.bool.isRequired,
  isExpanded: PropTypes.bool.isRequired,
  onExpand: PropTypes.func.isRequired,
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
  namePrefix: PropTypes.string.isRequired,
};

export default CardHeader;
