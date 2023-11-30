// ts-check
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  useToggle,
  Button,
  Dropdown,
  Icon,
  IconButton,
} from '@edx/paragon';
import { MoreVert } from '@edx/paragon/icons';
import PropTypes from 'prop-types';

import ExportModal from '../export-modal';
import { importTaxonomyTags } from '../import-tags';
import messages from './messages';

const TaxonomyMenu = ({
  taxonomy, iconMenu,
}) => {
  const intl = useIntl();

  const getTaxonomyMenuItems = () => {
    const { systemDefined, allowFreeText } = taxonomy;
    const menuItems = ['import', 'export'];
    if (systemDefined) {
      // System defined taxonomies cannot be imported
      return menuItems.filter((item) => !['import'].includes(item));
    }
    if (allowFreeText) {
      // Free text taxonomies cannot be imported
      return menuItems.filter((item) => !['import'].includes(item));
    }
    return menuItems;
  };

  const menuItems = getTaxonomyMenuItems();

  const [isExportModalOpen, exportModalOpen, exportModalClose] = useToggle(false);

  const menuItemActions = {
    import: () => importTaxonomyTags(taxonomy.id, intl),
    export: exportModalOpen,
  };

  const menuItemMessages = {
    import: messages.importMenu,
    export: messages.exportMenu,
  };

  const onClickMenuItem = (e, menuName) => {
    e.preventDefault();
    menuItemActions[menuName]?.();
  };

  const renderModals = () => isExportModalOpen && (
    <ExportModal
      isOpen={isExportModalOpen}
      onClose={exportModalClose}
      taxonomyId={taxonomy.id}
      taxonomyName={taxonomy.name}
    />
  );

  return (
    <Dropdown onToggle={(isOpen, ev) => ev.preventDefault()}>
      <Dropdown.Toggle
        as={iconMenu ? IconButton : Button}
        src={MoreVert}
        iconAs={Icon}
        variant="primary"
        alt={intl.formatMessage(messages.actionsButtonAlt, { name: taxonomy.name })}
        data-testid="taxonomy-menu-button"
        disabled={menuItems.length === 0}
      >
        {intl.formatMessage(messages.actionsButtonLabel)}
      </Dropdown.Toggle>
      <Dropdown.Menu data-testid="taxonomy-menu">
        {menuItems.map((item) => (
          <Dropdown.Item
            key={item}
            data-testid={`taxonomy-menu-${item}`}
            onClick={(e) => onClickMenuItem(e, item)}
          >
            {intl.formatMessage(menuItemMessages[item])}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
      {renderModals()}
    </Dropdown>
  );
};

TaxonomyMenu.propTypes = {
  taxonomy: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    systemDefined: PropTypes.bool.isRequired,
    allowFreeText: PropTypes.bool.isRequired,
  }).isRequired,
  iconMenu: PropTypes.bool.isRequired,
};

export default TaxonomyMenu;
