// ts-check
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Dropdown,
  DropdownButton,
} from '@edx/paragon';
import PropTypes from 'prop-types';

import messages from './messages';

const menuMessages = {
  export: messages.exportMenu,
  delete: messages.deleteMenu,
};

const TaxonomyDetailMenu = ({
  id, name, disabled, onClickMenuItem, menuItems,
}) => {
  const intl = useIntl();

  return (
    <DropdownButton
      id={id}
      title={intl.formatMessage(messages.actionsButtonLabel)}
      alt={intl.formatMessage(messages.actionsButtonAlt, { name })}
      disabled={disabled}
    >
      { menuItems.map(item => (
        <Dropdown.Item
          onClick={() => onClickMenuItem(item)}
        >
          {intl.formatMessage(menuMessages[item])}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  );
};

TaxonomyDetailMenu.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  onClickMenuItem: PropTypes.func.isRequired,
  menuItems: PropTypes.arrayOf(PropTypes.string).isRequired,
};

TaxonomyDetailMenu.defaultProps = {
  disabled: false,
};

export default TaxonomyDetailMenu;
