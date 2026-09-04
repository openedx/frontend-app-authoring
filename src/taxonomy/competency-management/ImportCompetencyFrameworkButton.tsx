import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, useToggle } from '@openedx/paragon';
import { useNavigate } from 'react-router-dom';

import CompetencyIcon from '@src/generic/CompetencyIcon';
import { useTaxonomyList } from '../data/apiHooks';
import { TaxonomyType } from '../data/constants';
import { ImportTagsWizard } from '../import-tags';
import messages from './messages';

/**
 * Button that imports a competency framework file as a brand new competency taxonomy, and then
 * sends the user to the Competency Management page of what was just created.
 */
export const ImportCompetencyFrameworkButton = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  const { data: taxonomyListData } = useTaxonomyList();

  const [isImportModalOpen, importModalOpen, importModalClose] = useToggle(false);

  if (!taxonomyListData?.canAddTaxonomy) {
    return null;
  }

  return (
    <>
      {isImportModalOpen && (
        <ImportTagsWizard
          isOpen={isImportModalOpen}
          onClose={importModalClose}
          defaultTaxonomyType={TaxonomyType.Competency}
          onImportSuccess={(newTaxonomy) => navigate(`/taxonomy/${newTaxonomy.id}/competencies`)}
        />
      )}
      <Button
        className="text-nowrap"
        iconBefore={CompetencyIcon}
        onClick={importModalOpen}
        data-testid="import-competency-framework-button"
      >
        {intl.formatMessage(messages.importCompetencyFrameworkButton)}
      </Button>
    </>
  );
};
