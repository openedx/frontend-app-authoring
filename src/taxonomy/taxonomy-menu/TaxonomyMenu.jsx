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
import { pickBy } from 'lodash';
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

  /**
    * @typedef {Object} MenuItem
    * @property {string} title - The title of the menu item
    * @property {() => void} action - The action to perform when the menu item is clicked
    * @property {boolean} [show] - Whether or not to show the menu item
    *
    * @constant
    * @type {Record<string, MenuItem>}
    */
  let menuItems = {
    import: {
      title: intl.formatMessage(messages.importMenu),
      action: () => importTaxonomyTags(taxonomy.id, intl),
      show: taxonomy.canChange,
    },
    export: {
      title: intl.formatMessage(messages.exportMenu),
      action: exportModalOpen,
      show: true, // if we can view the taxonomy, we can export it
    },
    delete: {
      title: intl.formatMessage(messages.deleteMenu),
      action: deleteDialogOpen,
      show: taxonomy.canDelete,
    },
    manageOrgs: {
      title: intl.formatMessage(messages.manageOrgsMenu),
      action: manageOrgsModalOpen,
      show: taxonomy.canChange,
    },
  };

  // Remove hidden menu items
  menuItems = pickBy(menuItems, (value) => value.show);

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
        disabled={Object.keys(menuItems).length === 0}
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
                menuItems[key].action();
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
    tagsCount: PropTypes.number.isRequired,
    canChange: PropTypes.bool,
    canDelete: PropTypes.bool,
  }).isRequired,
  iconMenu: PropTypes.bool,
};

TaxonomyMenu.defaultProps = {
  iconMenu: false,
};

export default TaxonomyMenu;
