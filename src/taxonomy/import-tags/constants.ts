import messages from './messages';

/**
 * The type of a taxonomy.
 *
 * Note: the backend also has a "system" type, reserved for platform-defined
 * taxonomies. It is intentionally not selectable by users.
 */
export enum TaxonomyType {
  Tags = 'tags',
  Competency = 'competency',
}

/**
 * The taxonomy types a user can pick when importing a taxonomy.
 * The backend also supports a "system" type, but it is reserved for
 * platform-defined taxonomies and must not be offered here.
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
