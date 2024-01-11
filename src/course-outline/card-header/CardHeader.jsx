import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Dropdown,
  Form,
  Icon,
  IconButton,
} from '@edx/paragon';
import {
  MoreVert as MoveVertIcon,
  EditOutline as EditIcon,
} from '@edx/paragon/icons';

import { useEscapeClick } from '../../hooks';
import { ITEM_BADGE_STATUS } from '../constants';
import messages from './messages';

const CardHeader = ({
  title,
  status,
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
  titleComponent,
  namePrefix,
}) => {
  const intl = useIntl();
  const [titleValue, setTitleValue] = useState(title);

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
        titleComponent
      )}
      <div className="ml-auto d-flex">
        {!isFormOpen && (
          <IconButton
            data-testid={`${namePrefix}-edit-button`}
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
            <Dropdown.Item
              data-testid={`${namePrefix}-card-header__menu-duplicate-button`}
              onClick={onClickDuplicate}
            >
              {intl.formatMessage(messages.menuDuplicate)}
            </Dropdown.Item>
            <Dropdown.Item
              data-testid={`${namePrefix}-card-header__menu-delete-button`}
              onClick={onClickDelete}
            >
              {intl.formatMessage(messages.menuDelete)}
            </Dropdown.Item>
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
  titleComponent: PropTypes.node.isRequired,
  namePrefix: PropTypes.string.isRequired,
};

export default CardHeader;
