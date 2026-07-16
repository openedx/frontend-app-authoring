import { useEffect, useRef, useState } from 'react';
import {
  Card,
  OverlayTrigger,
  Popover,
} from '@openedx/paragon';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';

import { TaxonomyMenu } from '@src/taxonomy/taxonomy-menu';
import type { TaxonomyData } from '@src/taxonomy/data/types';

import { TaxonomyBadges } from '../taxonomy-badges/TaxonomyBadges';

interface HeaderTitleProps {
  taxonomyId: number;
  title: string;
}

const HeaderTitle = ({ taxonomyId, title }: HeaderTitleProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const textWidth = textRef.current?.offsetWidth ?? 0;
    setIsTruncated(textWidth > containerWidth);
  }, [title]);

  const getToolTip = () => (
    <Popover
      id={`taxonomy-card-title-tooltip-${taxonomyId}`}
      className="mw-300px"
    >
      <Popover.Content>
        {title}
      </Popover.Content>
    </Popover>
  );

  return (
    <OverlayTrigger
      key={`taxonomy-card-title-overlay-${taxonomyId}`}
      placement="top"
      overlay={getToolTip()}
      show={!isTruncated ? false : undefined}
    >
      <div ref={containerRef} className="text-truncate">
        <span ref={textRef}>{title}</span>
      </div>
    </OverlayTrigger>
  );
};

interface TaxonomyCardProps {
  className?: string;
  original: TaxonomyData;
}

const TaxonomyCard = ({ className = '', original }: TaxonomyCardProps) => {
  const {
    id,
    name,
    description,
    systemDefined,
  } = original;
  const orgsCount = original.orgs.length;

  return (
    <Card
      isClickable={original.enabled}
      as={NavLink}
      to={`/taxonomy/${id}/`}
      className={classNames('taxonomy-card', className)}
      data-testid={`taxonomy-card-${id}`}
    >
      <Card.Header
        title={<HeaderTitle taxonomyId={id} title={name} />}
        subtitle={<TaxonomyBadges taxonomy={original}/>}
        actions={<TaxonomyMenu taxonomy={original} iconMenu />}
      />
      <Card.Body
        className={classNames('taxonomy-card-body', {
          'taxonomy-card-body-overflow-m': !systemDefined && !orgsCount,
          'taxonomy-card-body-overflow-sm': systemDefined || orgsCount,
        })}
      >
        <Card.Section>
          {description}
        </Card.Section>
      </Card.Body>
    </Card>
  );
};

export default TaxonomyCard;
