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
import _ from 'lodash';

import ExportModal from '../export-modal';
import { importTaxonomyTags } from '../import-tags';
import messages from './messages';

const TaxonomyMenu = ({
  taxonomy, iconMenu,
}) => {
  const intl = useIntl();

  const [isExportModalOpen, exportModalOpen, exportModalClose] = useToggle(false);

  const getTaxonomyMenuItems = () => {
    let menuItems = {
      import: {
        title: intl.formatMessage(messages.importMenu),
        action: () => importTaxonomyTags(taxonomy.id, intl),
        // Hide import menu item if taxonomy is system defined or allows free text
        hide: taxonomy.systemDefined || taxonomy.allowFreeText,
      },
      export: {
        title: intl.formatMessage(messages.exportMenu),
        action: exportModalOpen,
      },
    };

    // Remove hidden menu items
    menuItems = _.pickBy(menuItems, (value) => !value.hide);

    return menuItems;
  };

  const menuItems = getTaxonomyMenuItems();

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
        {Object.keys(menuItems).map((key) => (
          <Dropdown.Item
            key={key}
            data-testid={`taxonomy-menu-${key}`}
            onClick={
              (e) => {
                e.preventDefault();
                menuItems[key].action?.();
              }
            }
          >
            {menuItems[key].title}
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
