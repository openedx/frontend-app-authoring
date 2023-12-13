// @ts-check
import React, { useCallback, useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  useToggle,
  Button,
  Dropdown,
  Icon,
  IconButton,
} from '@edx/paragon';
import { MoreVert } from '@edx/paragon/icons';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import ExportModal from '../export-modal';
import { useDeleteTaxonomy } from '../data/apiHooks';
import { TaxonomyContext } from '../common/context';
import DeleteDialog from '../delete-dialog';
import { importTaxonomyTags } from '../import-tags';
import { ManageOrgsModal } from '../manage-orgs';
import messages from './messages';

const TaxonomyMenu = ({
  taxonomy, iconMenu,
}) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const deleteTaxonomy = useDeleteTaxonomy();
  const { setToastMessage } = useContext(TaxonomyContext);

  const onDeleteTaxonomy = useCallback(() => {
    deleteTaxonomy({ pk: taxonomy.id }, {
      onSuccess: () => {
        if (setToastMessage) {
          // @ts-ignore ToDo: fix type error
          setToastMessage(intl.formatMessage(messages.taxonomyDeleteToast, { name: taxonomy.name }));
        }
        navigate('/taxonomies');
      },
      onError: () => {
        // TODO: display the error to the user
      },
    });
  }, [setToastMessage, taxonomy]);

  const [isDeleteDialogOpen, deleteDialogOpen, deleteDialogClose] = useToggle(false);
  const [isExportModalOpen, exportModalOpen, exportModalClose] = useToggle(false);
  const [isManageOrgsModalOpen, manageOrgsModalOpen, manageOrgsModalClose] = useToggle(false);

  const getTaxonomyMenuItems = () => {
    let menuItems = {
      import: {
        title: intl.formatMessage(messages.importMenu),
        action: () => importTaxonomyTags(taxonomy.id, intl),
        // Hide import menu item if taxonomy is system defined or allows free text
        hide: taxonomy.systemDefined || taxonomy.allowFreeText,
      },
      manageOrgs: {
        title: intl.formatMessage(messages.manageOrgsMenu),
        action: manageOrgsModalOpen,
        hide: taxonomy.systemDefined,
      },
      export: {
        title: intl.formatMessage(messages.exportMenu),
        action: exportModalOpen,
      },
      delete: {
        title: intl.formatMessage(messages.deleteMenu),
        action: deleteDialogOpen,
        // Hide delete menu item if taxonomy is system defined
        hide: taxonomy.systemDefined,
      },
    };

    // Remove hidden menu items
    menuItems = _.omitBy(menuItems, (value) => value.hide);

    return menuItems;
  };

  const menuItems = getTaxonomyMenuItems();

  const renderModals = () => (
    <>
      {isDeleteDialogOpen && (
        <DeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={deleteDialogClose}
          onDelete={onDeleteTaxonomy}
          taxonomyName={taxonomy.name}
          tagsCount={taxonomy.tagsCount}
        />
      )}
      {isExportModalOpen && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={exportModalClose}
          taxonomyId={taxonomy.id}
        />
      )}
      {isManageOrgsModalOpen && (
        <ManageOrgsModal
          isOpen={isManageOrgsModalOpen}
          onClose={manageOrgsModalClose}
          taxonomyId={taxonomy.id}
        />
      )}
    </>
  );

  return (
    <Dropdown onToggle={(_isOpen, ev) => ev.preventDefault()}>
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
    tagsCount: PropTypes.number.isRequired,
  }).isRequired,
  iconMenu: PropTypes.bool,
};

TaxonomyMenu.defaultProps = {
  iconMenu: false,
};

export default TaxonomyMenu;
