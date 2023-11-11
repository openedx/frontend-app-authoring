import React, { useState } from 'react';
import {
  IconButton,
  ModalPopup,
  Menu,
  Icon,
  MenuItem,
} from '@edx/paragon';
import { MoreVert } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

const TaxonomyCardMenu = ({
  id, name, onClickMenuItem,
}) => {
  const intl = useIntl();
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [menuTarget, setMenuTarget] = useState(null);

  const onClickItem = (e, menuName) => {
    e.preventDefault();
    setMenuIsOpen(false);
    onClickMenuItem(menuName);
  };

  return (
    <>
      <IconButton
        variant="primary"
        onClick={(e) => {
          e.preventDefault();
          setMenuIsOpen(true);
        }}
        ref={setMenuTarget}
        src={MoreVert}
        iconAs={Icon}
        alt={intl.formatMessage(messages.taxonomyMenuAlt, { name })}
        data-testid={`taxonomy-card-menu-button-${id}`}
      />
      <ModalPopup
        positionRef={menuTarget}
        isOpen={menuIsOpen}
        onClose={() => setMenuIsOpen(false)}
      >
        <Menu data-testid={`taxonomy-card-menu-${id}`}>
          {/* Add more menu items here */}
          <MenuItem className="taxonomy-menu-item" onClick={(e) => onClickItem(e, 'export')}>
            {intl.formatMessage(messages.taxonomyCardExportMenu)}
          </MenuItem>
        </Menu>
      </ModalPopup>
    </>
  );
};

TaxonomyCardMenu.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  onClickMenuItem: PropTypes.func.isRequired,
};

export default TaxonomyCardMenu;
