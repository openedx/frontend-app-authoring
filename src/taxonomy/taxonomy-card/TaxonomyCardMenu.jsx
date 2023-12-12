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

const TaxonomyCardMenu = ({
  id, name, onClickMenuItem,
}) => {
  const intl = useIntl();

  const onClickItem = (e, menuName) => {
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
      />
      <Dropdown.Menu data-testid={`taxonomy-card-menu-${id}`}>
        {/* Add more menu items here */}
        <Dropdown.Item
          className="taxonomy-menu-item"
          data-testid={`taxonomy-card-menu-export-${id}`}
          onClick={(e) => onClickItem(e, 'export')}
        >
          {intl.formatMessage(messages.taxonomyCardExportMenu)}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

TaxonomyCardMenu.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  onClickMenuItem: PropTypes.func.isRequired,
};

export default TaxonomyCardMenu;
