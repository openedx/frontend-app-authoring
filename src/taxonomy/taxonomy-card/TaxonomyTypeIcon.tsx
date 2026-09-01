import { Icon } from '@openedx/paragon';
import { Tag } from '@openedx/paragon/icons';

import CompetencyIcon from '@src/generic/CompetencyIcon';
import { TaxonomyType } from '../data/constants';

const taxonomyTypeIcons = {
  [TaxonomyType.Competency]: CompetencyIcon,
  [TaxonomyType.Tags]: Tag,
};

interface TaxonomyTypeIconProps {
  taxonomyType?: TaxonomyType;
  className?: string;
}

/**
 * Icon that tells apart the two types of taxonomy: competency and tags.
 * Taxonomies without a known type are shown as tags taxonomies, so that
 * every taxonomy gets exactly one icon.
 */
export const TaxonomyTypeIcon = ({ taxonomyType, className }: TaxonomyTypeIconProps) => {
  const iconType = taxonomyType && taxonomyType in taxonomyTypeIcons
    ? taxonomyType
    : TaxonomyType.Tags;

  const src = taxonomyTypeIcons[iconType];

  return (
    <Icon
      src={src}
      className={className}
      data-testid={`taxonomy-type-icon-${iconType}`}
    />
  );
};
