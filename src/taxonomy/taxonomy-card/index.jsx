import React from 'react';
import {
  Badge,
  Card,
  OverlayTrigger,
  Popover,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { useIntl } from '@edx/frontend-platform/i18n';

import { TaxonomyMenu } from '../taxonomy-menu';
import messages from './messages';

const orgsCountEnabled = (orgsCount) => orgsCount !== undefined && orgsCount !== 0;

const HeaderSubtitle = ({
  id, showSystemBadge, orgsCount,
}) => {
  const intl = useIntl();
  const getSystemToolTip = () => (
    <Popover id={`system-defined-tooltip-${id}`}>
      <Popover.Title as="h5">
        {intl.formatMessage(messages.systemTaxonomyPopoverTitle)}
      </Popover.Title>
      <Popover.Content>
        {intl.formatMessage(messages.systemTaxonomyPopoverBody)}
      </Popover.Content>
    </Popover>
  );

  // Show system defined badge
  if (showSystemBadge) {
    return (
      <OverlayTrigger
        key={`system-defined-overlay-${id}`}
        placement="top"
        overlay={getSystemToolTip()}
      >
        <Badge variant="light">
          {intl.formatMessage(messages.systemDefinedBadge)}
        </Badge>
      </OverlayTrigger>
    );
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

HeaderSubtitle.propTypes = {
  id: PropTypes.number.isRequired,
  showSystemBadge: PropTypes.bool.isRequired,
  orgsCount: PropTypes.number.isRequired,
};

const TaxonomyCard = ({ className, original }) => {
  const {
    id, name, description, systemDefined, orgsCount,
  } = original;

  const intl = useIntl();

  const getHeaderActions = () => (
    <TaxonomyMenu
      taxonomy={original}
      iconMenu
    />
  );

  return (
    <Card
      isClickable
      as={Link}
      to={`/taxonomy/${id}`}
      className={classNames('taxonomy-card', className)}
      data-testid={`taxonomy-card-${id}`}
    >
      <Card.Header
        title={name}
        subtitle={(
          <HeaderSubtitle
            id={id}
            showSystemBadge={systemDefined}
            orgsCount={orgsCount}
            intl={intl}
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

TaxonomyCard.defaultProps = {
  className: '',
};

TaxonomyCard.propTypes = {
  className: PropTypes.string,
  original: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string,
    systemDefined: PropTypes.bool,
    orgsCount: PropTypes.number,
    tagsCount: PropTypes.number,
  }).isRequired,
};

export default TaxonomyCard;
