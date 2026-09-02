import { TaxonomyType } from './constants';

/** Whether a taxonomy holds competencies rather than plain tags */
export const isCompetencyTaxonomy = (
  taxonomy: { taxonomyType?: TaxonomyType; },
) => taxonomy.taxonomyType === TaxonomyType.Competency;
