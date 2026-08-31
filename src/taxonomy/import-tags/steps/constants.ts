import { TaxonomyType } from '@src/taxonomy/data/constants';
import messages from '../messages';

/**
 * The taxonomy types a user can pick when importing a taxonomy.
 */
export const TAXONOMY_TYPE_OPTIONS = [
  {
    value: TaxonomyType.Tags,
    message: messages.importWizardStepPopulateTaxonomyTypeTags,
  },
  {
    value: TaxonomyType.Competency,
    message: messages.importWizardStepPopulateTaxonomyTypeCompetency,
  },
];
