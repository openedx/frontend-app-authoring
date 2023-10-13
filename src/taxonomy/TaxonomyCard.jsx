import React from 'react';
import {
  Badge,
  Button,
  Card,
  Icon,
} from '@edx/paragon';
import { MoreVert } from '@edx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import messages from './messages';
import './TaxonomyCard.scss';

const TaxonomyCard = ({ className, original, intl }) => {
  const {
    id, name, description, systemDefined, orgsCount,
  } = original;

  const orgsCountEnabled = () => orgsCount !== undefined && orgsCount !== 0;

  const getHeaderSubtitle = () => {
    if (systemDefined) {
      return (
        <Badge variant="light">
          {intl.formatMessage(messages.systemDefinedBadge)}
        </Badge>
      );
    }
    if (orgsCountEnabled()) {
      return (
        <div className="font-italic">
          {intl.formatMessage(messages.assignedToOrgsLabel, { orgsCount })}
        </div>
      );
    }
    return undefined;
  };

  return (
    <Card className={classNames('taxonomy-card', className)} data-testid={`taxonomy-card-${id}`}>
      <Card.Header
        title={name}
        subtitle={getHeaderSubtitle()}
        actions={<Button variant="link"><Icon className="text-dark-900" src={MoreVert} /></Button>}
      />
      <Card.Body className={classNames('taxonomy-card-body', {
        'taxonomy-card-body-overflow-m': !systemDefined && !orgsCountEnabled(),
        'taxonomy-card-body-overflow-sm': systemDefined || orgsCountEnabled(),
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
  }).isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(TaxonomyCard);
