import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Form,
  Stack,
  Stepper,
} from '@openedx/paragon';

import type { TaxonomyType } from '@src/taxonomy/data/constants';
import messages from '../messages';
import type { TaxonomyPopulateData } from '../types';
import { TAXONOMY_TYPE_OPTIONS } from './constants';

interface PopulateStepProps {
  taxonomyPopulateData: TaxonomyPopulateData;
  setTaxonomyPopulateData: (data: TaxonomyPopulateData) => void;
}

/**
 * Wizard step where the user describes the new taxonomy that will be created from the uploaded file.
 */
export const PopulateStep = ({ taxonomyPopulateData, setTaxonomyPopulateData }: PopulateStepProps) => {
  const intl = useIntl();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaxonomyPopulateData({ ...taxonomyPopulateData, taxonomyName: e.target.value });
  };

  const handleDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTaxonomyPopulateData({ ...taxonomyPopulateData, taxonomyDesc: e.target.value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTaxonomyPopulateData({ ...taxonomyPopulateData, taxonomyType: e.target.value as TaxonomyType });
  };

  return (
    <Stepper.Step eventKey="populate" title={intl.formatMessage(messages.importWizardStepperPopulateStepTitle)}>
      <Stack gap={3} data-testid="populate-step">
        <Form.Group>
          <Form.Label>{intl.formatMessage(messages.importWizardStepPopulateTaxonomyName)}</Form.Label>
          <Form.Control value={taxonomyPopulateData.taxonomyName} onChange={handleNameChange} />
        </Form.Group>
        <Form.Group>
          <Form.Label>{intl.formatMessage(messages.importWizardStepPopulateTaxonomyDesc)}</Form.Label>
          <Form.Control
            as="textarea"
            autoResize
            value={taxonomyPopulateData.taxonomyDesc}
            onChange={handleDescChange}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>
            {intl.formatMessage(messages.importWizardStepPopulateTaxonomyType)}
          </Form.Label>
          <Form.Control
            as="select"
            data-testid="taxonomy-type-select"
            value={taxonomyPopulateData.taxonomyType}
            onChange={handleTypeChange}
          >
            {TAXONOMY_TYPE_OPTIONS.map(({ value, message }) => (
              <option key={value} value={value}>
                {intl.formatMessage(message)}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      </Stack>
    </Stepper.Step>
  );
};
