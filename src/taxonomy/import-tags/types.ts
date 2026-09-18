import type { TaxonomyType } from '@src/taxonomy/data/constants';
import type { TaxonomyData } from '@src/taxonomy/data/types';

/**
 * The taxonomy that tags are being imported into.
 */
export type ImportTaxonomy = Pick<TaxonomyData, 'id' | 'name'>;

/** The steps of the import wizard, in the order the user goes through them. */
export type ImportWizardStep = 'export' | 'upload' | 'populate' | 'plan' | 'confirm';

/** The details of the new taxonomy that is being created from the uploaded file. */
export interface TaxonomyPopulateData {
  taxonomyName: string;
  taxonomyDesc: string;
  taxonomyType: TaxonomyType;
}
