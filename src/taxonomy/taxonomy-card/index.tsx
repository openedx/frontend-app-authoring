import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  OverlayTrigger,
  Popover,
} from '@openedx/paragon';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import { useIntl } from '@edx/frontend-platform/i18n';

import { TaxonomyMenu } from '../taxonomy-menu';
import messages from './messages';
import SystemDefinedBadge from '../system-defined-badge';
import { TaxonomyData } from '../data/types';

const orgsCountEnabled = (orgsCount?: number) => orgsCount !== undefined && orgsCount !== 0;

interface HeaderSubtitleProps {
  id: number;
  showSystemBadge: boolean;
  orgsCount?: number;
}

const HeaderSubtitle: React.FC<HeaderSubtitleProps> = ({
  id, showSystemBadge, orgsCount,
}) => {
  const intl = useIntl();

  // Show system defined badge
  if (showSystemBadge) {
    return <SystemDefinedBadge taxonomyId={id} />;
  }

  // Or show orgs count
  if (orgsCountEnabled(orgsCount)) {
    return (
      <div className="font-italic">
        {intl.formatMessage(messages.assignedToOrgsLabel, { orgsCount })}
      </div>
    );
  }

  // Or none
  return null;
};

interface HeaderTitleProps {
  taxonomyId: number;
  title: string;
}

const HeaderTitle: React.FC<HeaderTitleProps> = ({ taxonomyId, title }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const textWidth = textRef.current.offsetWidth;
      setIsTruncated(textWidth > containerWidth);
    }
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
  original: Partial<TaxonomyData> & { orgsCount?: number };
}

const TaxonomyCard: React.FC<TaxonomyCardProps> = ({ className = '', original }) => {
  const {
    id, name, description, systemDefined, orgsCount,
  } = original;

  const getHeaderActions = () => (
    <TaxonomyMenu
      taxonomy={original as any}
      iconMenu
    />
  );

  return (
    <Card
      isClickable
      as={NavLink}
      to={`/taxonomy/${id}/`}
      className={classNames('taxonomy-card', className)}
      data-testid={`taxonomy-card-${id}`}
    >
      <Card.Header
        title={<HeaderTitle taxonomyId={id!} title={name!} />}
        subtitle={(
          <HeaderSubtitle
            id={id!}
            showSystemBadge={systemDefined!}
            orgsCount={orgsCount}
          />
        )}
        actions={getHeaderActions()}
      />
      <Card.Body className={classNames('taxonomy-card-body', {
        'taxonomy-card-body-overflow-m': !systemDefined && !orgsCountEnabled(orgsCount),
        'taxonomy-card-body-overflow-sm': systemDefined || orgsCountEnabled(orgsCount),
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
