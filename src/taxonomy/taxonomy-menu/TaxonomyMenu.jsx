// @ts-check
import React, { useCallback, useContext } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  useToggle,
  Button,
  Dropdown,
  Icon,
  IconButton,
} from '@openedx/paragon';
import { MoreVert } from '@openedx/paragon/icons';
import { pickBy } from 'lodash';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

import ExportModal from '../export-modal';
import { useDeleteTaxonomy } from '../data/apiHooks';
import { TaxonomyContext } from '../common/context';
import DeleteDialog from '../delete-dialog';
import { ImportTagsWizard } from '../import-tags';
import { ManageOrgsModal } from '../manage-orgs';
import messages from './messages';

/** @typedef {import('../data/types.js').TaxonomyData} TaxonomyData */
// Note: to make mocking easier for tests, the types below only specify the subset of TaxonomyData that we actually use.

/**
 * A menu that provides actions for editing a specific taxonomy.
 * @type {React.FC<{
 *   taxonomy: Pick<TaxonomyData, 'id'|'name'|'tagsCount'|'systemDefined'|'canChangeTaxonomy'|'canDeleteTaxonomy'>,
 *   iconMenu?: boolean
 * }>}
 */
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
  const [isImportModalOpen, importModalOpen, importModalClose] = useToggle(false);
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
      action: importModalOpen,
      show: taxonomy.canChangeTaxonomy && !taxonomy.systemDefined,
    },
    export: {
      title: intl.formatMessage(messages.exportMenu),
      action: exportModalOpen,
      show: true, // if we can view the taxonomy, we can export it
    },
    delete: {
      title: intl.formatMessage(messages.deleteMenu),
      action: deleteDialogOpen,
      show: taxonomy.canDeleteTaxonomy && !taxonomy.systemDefined,
    },
    manageOrgs: {
      title: intl.formatMessage(messages.manageOrgsMenu),
      action: manageOrgsModalOpen,
      show: taxonomy.canChangeTaxonomy,
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
      {isImportModalOpen && (
        <ImportTagsWizard
          taxonomy={taxonomy}
          isOpen={isImportModalOpen}
          onClose={importModalClose}
          reimport
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

  const toggleProps = iconMenu ? {
    as: IconButton,
    src: MoreVert,
    iconAs: Icon,
  } : {
    as: Button,
  };

  return (
    <Dropdown id={`taxonomy-menu-${taxonomy.id}`} onToggle={(_isOpen, ev) => ev.preventDefault()}>
      <Dropdown.Toggle
        id={`taxonomy-menu-toggle-${taxonomy.id}`}
        {...toggleProps}
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
            as="button" // Prevents <a> cannot appear as a descendant of <a> warning
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
    systemDefined: PropTypes.bool.isRequired,
    canChangeTaxonomy: PropTypes.bool.isRequired,
    canDeleteTaxonomy: PropTypes.bool.isRequired,
  }).isRequired,
  iconMenu: PropTypes.bool,
};

TaxonomyMenu.defaultProps = {
  iconMenu: false,
};

export default TaxonomyMenu;
