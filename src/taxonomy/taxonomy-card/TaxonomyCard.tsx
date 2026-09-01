import { Card } from '@openedx/paragon';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';

import { TaxonomyMenu } from '../taxonomy-menu';
import { TaxonomyCardHeaderSubtitle } from './TaxonomyCardHeaderSubtitle';
import { TaxonomyCardHeaderTitle } from './TaxonomyCardHeaderTitle';
import { orgsCountEnabled } from './utils';
import { TaxonomyType } from '../data/constants';
import { TaxonomyData } from '../data/types';

type TaxonomyCardFields = Pick<
  TaxonomyData,
  'id' | 'name' | 'description' | 'readOnly' | 'tagsCount' | 'canChangeTaxonomy' | 'canDeleteTaxonomy'
>;

/** The data of the taxonomy shown on a taxonomy card */
export interface TaxonomyCardData extends TaxonomyCardFields {
  taxonomyType?: TaxonomyType;
  orgsCount?: number;
}

interface TaxonomyCardProps {
  className?: string;
  original: TaxonomyCardData;
}

export const TaxonomyCard = ({ className = '', original }: TaxonomyCardProps) => {
  const {
    id,
    name,
    description,
    readOnly,
    orgsCount,
    taxonomyType,
  } = original;

  return (
    <Card
      isClickable
      as={NavLink}
      to={`/taxonomy/${id}/`}
      className={classNames('taxonomy-card', className)}
      data-testid={`taxonomy-card-${id}`}
    >
      <Card.Header
        title={
          <TaxonomyCardHeaderTitle
            taxonomyId={id}
            title={name}
            taxonomyType={taxonomyType}
          />
        }
        subtitle={
          <TaxonomyCardHeaderSubtitle
            showReadOnlyBadge={readOnly}
            orgsCount={orgsCount}
          />
        }
        actions={
          <TaxonomyMenu
            taxonomy={original}
            iconMenu
          />
        }
      />
      <Card.Body
        className={classNames('taxonomy-card-body', {
          'taxonomy-card-body-overflow-m': !readOnly && !orgsCountEnabled(orgsCount),
          'taxonomy-card-body-overflow-sm': readOnly || orgsCountEnabled(orgsCount),
        })}
      >
        <Card.Section>
          {description}
        </Card.Section>
      </Card.Body>
    </Card>
  );
};
