import { TaxonomyType } from './constants';

/** Whether a taxonomy holds competencies rather than plain tags */
export const isCompetencyTaxonomy = (
  taxonomy: { taxonomyType?: TaxonomyType; },
) => taxonomy.taxonomyType === TaxonomyType.Competency;

/** Whether competencies from this taxonomy can be applied to course content. */
export const canApplyCompetencies = (
  taxonomy: { taxonomyType?: TaxonomyType; canTagObject?: boolean; },
) => !!taxonomy.canTagObject && isCompetencyTaxonomy(taxonomy);
