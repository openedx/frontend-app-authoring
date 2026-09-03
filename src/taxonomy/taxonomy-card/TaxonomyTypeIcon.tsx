import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon } from '@openedx/paragon';
import { Tag } from '@openedx/paragon/icons';

import CompetencyIcon from '@src/generic/CompetencyIcon';
import messages from './messages';
import { TaxonomyType } from '../data/constants';

const taxonomyTypeIcons = {
  [TaxonomyType.Competency]: {
    src: CompetencyIcon,
    altText: messages.competencyTypeIconAltText,
  },
  [TaxonomyType.Tags]: {
    src: Tag,
    altText: messages.tagsTypeIconAltText,
  },
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
  const intl = useIntl();

  const iconType = taxonomyType && taxonomyType in taxonomyTypeIcons
    ? taxonomyType
    : TaxonomyType.Tags;

  const { src, altText } = taxonomyTypeIcons[iconType];

  return (
    <Icon
      src={src}
      className={className}
      screenReaderText={intl.formatMessage(altText)}
      data-testid={`taxonomy-type-icon-${iconType}`}
    />
  );
};
