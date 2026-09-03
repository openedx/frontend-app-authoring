import { TaxonomyType } from '@src/taxonomy/data/constants';
import messages from '../messages';

/**
 * The taxonomy types a user can pick when importing a taxonomy.
 *
 * A `Tags` taxonomy is just a way to label content: its tags carry no rules for demonstrating
 * mastery of what they describe. A `Competency` taxonomy is a taxonomy of skills, and choosing it
 * enables the Competency Management page, where the rules used to demonstrate mastery of those
 * skills are configured.
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
