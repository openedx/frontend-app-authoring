import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Stack,
  Stepper,
} from '@openedx/paragon';
import { Download } from '@openedx/paragon/icons';

import { getTaxonomyExportFile } from '@src/taxonomy/data/api';

import messages from '../messages';
import { ImportTaxonomy } from '../types';

interface ExportStepProps {
  taxonomy: ImportTaxonomy;
}

/**
 * Wizard step that offers to export the existing taxonomy, so that the user can edit the exported
 * file and then re-import it.
 */
export const ExportStep = ({ taxonomy }: ExportStepProps) => {
  const intl = useIntl();

  return (
    <Stepper.Step eventKey="export" title={intl.formatMessage(messages.importWizardStepperExportStepTitle)}>
      <Stack gap={3} data-testid="export-step">
        <p className="mb-0">
          <FormattedMessage {...messages.importWizardStepExportReplaceWarning} />
        </p>
        <p className="mb-0">
          <FormattedMessage {...messages.importWizardStepExportBackupSuggestion} />
        </p>
        <Stack gap={3} direction="horizontal">
          <Button
            iconBefore={Download}
            variant="outline-primary"
            onClick={() => getTaxonomyExportFile(taxonomy.id, 'csv')}
            data-testid="export-csv-button"
          >
            {intl.formatMessage(messages.importWizardStepExportCSVButton)}
          </Button>
          <Button
            iconBefore={Download}
            variant="outline-primary"
            onClick={() => getTaxonomyExportFile(taxonomy.id, 'json')}
            data-testid="export-json-button"
          >
            {intl.formatMessage(messages.importWizardStepExportJSONButton)}
          </Button>
        </Stack>
      </Stack>
    </Stepper.Step>
  );
};
