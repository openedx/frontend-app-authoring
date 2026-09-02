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
import pickBy from 'lodash/pickBy';
import { useNavigate } from 'react-router-dom';

import ExportModal from '../export-modal';
import { useDeleteTaxonomy } from '../data/apiHooks';
import { TaxonomyContext } from '../common/context';
import DeleteDialog from '../delete-dialog';
import { ImportTagsWizard } from '../import-tags';
import { ManageOrgsModal } from '../manage-orgs';
import messages from './messages';
import { isCompetencyTaxonomy } from '../data/utils';
import type { TaxonomyData } from '../data/types';

// Note: to make mocking easier for tests, the types below only specify the subset of TaxonomyData that we actually use.
interface Props {
  taxonomy:
    & Pick<TaxonomyData, 'id' | 'name' | 'tagsCount' | 'readOnly' | 'canChangeTaxonomy' | 'canDeleteTaxonomy'>
    // Taxonomies whose type we don't know are treated as tags taxonomies, like the card type icon does.
    & Partial<Pick<TaxonomyData, 'taxonomyType'>>;
  iconMenu?: boolean;
}

interface MenuItem {
  /** The title of the menu item */
  title: string;
  /** The action to perform when the menu item is clicked */
  action: () => void;
  /** Whether or not to show the menu item */
  show?: boolean;
}

/**
 * A menu that provides actions for editing a specific taxonomy.
 */
const TaxonomyMenu = ({
  taxonomy,
  iconMenu = false,
}: Props) => {
  const intl = useIntl();
  const navigate = useNavigate();

  const deleteTaxonomy = useDeleteTaxonomy();
  const { setToastMessage } = useContext(TaxonomyContext);

  const onDeleteTaxonomy = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
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

  let menuItems: Record<string, MenuItem> = {
    import: {
      title: intl.formatMessage(messages.importMenu),
      action: importModalOpen,
      show: taxonomy.canChangeTaxonomy && !taxonomy.readOnly,
    },
    export: {
      title: intl.formatMessage(messages.exportMenu),
      action: exportModalOpen,
      show: true, // if we can view the taxonomy, we can export it
    },
    delete: {
      title: intl.formatMessage(messages.deleteMenu),
      action: deleteDialogOpen,
      show: taxonomy.canDeleteTaxonomy && !taxonomy.readOnly,
    },
    manageOrgs: {
      title: intl.formatMessage(messages.manageOrgsMenu),
      action: manageOrgsModalOpen,
      show: taxonomy.canChangeTaxonomy,
    },
    applyCompetencies: {
      title: intl.formatMessage(messages.applyCompetenciesMenu),
      action: () => navigate(`/taxonomy/${taxonomy.id}/competencies`),
      show: taxonomy.canChangeTaxonomy && isCompetencyTaxonomy(taxonomy),
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

  const toggleProps = iconMenu ?
    {
      as: IconButton,
      src: MoreVert,
      iconAs: Icon,
    } :
    {
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
            onClick={(e) => {
              e.preventDefault();
              menuItems[key].action();
            }}
          >
            {menuItems[key].title}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
      {renderModals()}
    </Dropdown>
  );
};

export default TaxonomyMenu;
