import { TaxonomyType } from './constants';
import { canApplyCompetencies, isCompetencyTaxonomy } from './utils';

describe('isCompetencyTaxonomy', () => {
  it('is true only for competency taxonomies', () => {
    expect(isCompetencyTaxonomy({ taxonomyType: TaxonomyType.Competency })).toBe(true);
    expect(isCompetencyTaxonomy({ taxonomyType: TaxonomyType.Tags })).toBe(false);
    expect(isCompetencyTaxonomy({})).toBe(false);
  });
});

describe('canApplyCompetencies', () => {
  it('is true for a competency taxonomy the user can tag with', () => {
    expect(canApplyCompetencies({ taxonomyType: TaxonomyType.Competency, canTagObject: true })).toBe(true);
  });

  it('is false without tagging permission', () => {
    expect(canApplyCompetencies({ taxonomyType: TaxonomyType.Competency, canTagObject: false })).toBe(false);
    expect(canApplyCompetencies({ taxonomyType: TaxonomyType.Competency })).toBe(false);
  });

  it('is false for a non-competency taxonomy', () => {
    expect(canApplyCompetencies({ taxonomyType: TaxonomyType.Tags, canTagObject: true })).toBe(false);
    expect(canApplyCompetencies({ canTagObject: true })).toBe(false);
  });
});
