import type { MouseEvent } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Card } from '@openedx/paragon';
import { NavLink, useNavigate } from 'react-router-dom';
import classNames from 'classnames';

import { TaxonomyMenu } from '../taxonomy-menu';
import { TaxonomyCardHeaderSubtitle } from './TaxonomyCardHeaderSubtitle';
import { TaxonomyCardHeaderTitle } from './TaxonomyCardHeaderTitle';
import messages from './messages';
import { orgsCountEnabled } from './utils';
import { isCompetencyTaxonomy } from '../data/utils';
import { TaxonomyData } from '../data/types';

type TaxonomyCardFields = Pick<
  TaxonomyData,
  | 'id'
  | 'name'
  | 'description'
  | 'readOnly'
  | 'tagsCount'
  | 'canChangeTaxonomy'
  | 'canDeleteTaxonomy'
  | 'taxonomyType'
  | 'canTagObject'
>;

/** The data of the taxonomy shown on a taxonomy card */
export interface TaxonomyCardData extends TaxonomyCardFields {
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
    canTagObject,
  } = original;

  const intl = useIntl();
  const navigate = useNavigate();

  const showApplyCompetencies = canTagObject && isCompetencyTaxonomy(original);

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
          'taxonomy-card-body-with-footer': showApplyCompetencies,
        })}
      >
        <Card.Section>
          {description}
        </Card.Section>
      </Card.Body>
      {showApplyCompetencies && (
        <Card.Footer>
          <Button
            variant="primary"
            onClick={(e: MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/taxonomy/${id}/competencies`);
            }}
          >
            {intl.formatMessage(messages.applyCompetenciesButton)}
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
};
