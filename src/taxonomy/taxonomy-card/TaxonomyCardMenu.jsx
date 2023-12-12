import React from 'react';
import {
  Dropdown,
  IconButton,
  Icon,
} from '@edx/paragon';
import { MoreVert } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

const menuMessages = {
  export: messages.taxonomyCardExportMenu,
  delete: messages.taxonomyCardDeleteMenu,
};

const TaxonomyCardMenu = ({
  id, name, onClickMenuItem, disabled, menuItems,
}) => {
  const intl = useIntl();

  const onClickItem = (menuName) => (e) => {
    e.preventDefault();
    onClickMenuItem(menuName);
  };

  return (
    <Dropdown onToggle={(isOpen, ev) => ev.preventDefault()}>
      <Dropdown.Toggle
        as={IconButton}
        src={MoreVert}
        iconAs={Icon}
        variant="primary"
        alt={intl.formatMessage(messages.taxonomyMenuAlt, { name })}
        id={`taxonomy-card-menu-button-${id}`}
        data-testid={`taxonomy-card-menu-button-${id}`}
        disabled={disabled}
      />
      <Dropdown.Menu data-testid={`taxonomy-card-menu-${id}`}>
        { menuItems.map(item => (
          <Dropdown.Item
            className="taxonomy-menu-item"
            data-testid={`taxonomy-card-menu-${item}-${id}`}
            onClick={onClickItem(item)}
          >
            {intl.formatMessage(menuMessages[item])}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

TaxonomyCardMenu.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  onClickMenuItem: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  menuItems: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default TaxonomyCardMenu;
