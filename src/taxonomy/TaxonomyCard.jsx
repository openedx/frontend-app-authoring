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
    name, description, isSystemDefined, orgsCount,
  } = original;

  const orgsCountEnabled = () => orgsCount !== undefined && orgsCount !== 0;

  const getHeaderSubtitle = () => {
    if (isSystemDefined) {
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
    <Card className={classNames('taxonomy-card', className)}>
      <Card.Header
        title={name}
        subtitle={getHeaderSubtitle()}
        actions={<Button variant="link"><Icon className="text-dark-900" src={MoreVert} /></Button>}
      />
      <Card.Body className={classNames('taxonomy-card-body', {
        'taxonomy-card-body-overflow-m': !isSystemDefined && !orgsCountEnabled(),
        'taxonomy-card-body-overflow-sm': isSystemDefined || orgsCountEnabled(),
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
    name: PropTypes.string,
    description: PropTypes.string,
    isSystemDefined: PropTypes.bool,
    orgsCount: PropTypes.number,
  }).isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(TaxonomyCard);
