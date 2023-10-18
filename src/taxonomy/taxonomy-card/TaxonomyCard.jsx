import React, { useState } from 'react';
import {
  Badge,
  Card,
  OverlayTrigger,
  Popover,
} from '@edx/paragon';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import messages from '../messages';
import TaxonomyCardMenu from './TaxonomyCardMenu';
import ExportModal from '../modals/ExportModal';

const TaxonomyCard = ({ className, original, intl }) => {
  const {
    id, name, description, systemDefined, orgsCount,
  } = original;

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const orgsCountEnabled = () => orgsCount !== undefined && orgsCount !== 0;

  const onClickMenuItem = (menuName) => {
    switch (menuName) {
    case 'export':
      setIsExportModalOpen(true);
      break;
    default:
      break;
    }
  };

  const getSystemBadgeToolTip = () => (
    <Popover id={`system-defined-tooltip-${id}`}>
      <Popover.Title as="h5">
        {intl.formatMessage(messages.systemTaxonomyPopoverTitle)}
      </Popover.Title>
      <Popover.Content>
        {intl.formatMessage(messages.systemTaxonomyPopoverBody)}
      </Popover.Content>
    </Popover>
  );

  const getHeaderSubtitle = () => {
    if (systemDefined) {
      return (
        <OverlayTrigger
          key={`system-defined-overlay-${id}`}
          placement="top"
          overlay={getSystemBadgeToolTip(id)}
        >
          <Badge variant="light">
            {intl.formatMessage(messages.systemDefinedBadge)}
          </Badge>
        </OverlayTrigger>
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

  const getHeaderActions = () => (
    <TaxonomyCardMenu id={id} name={name} onClickMenuItem={onClickMenuItem} />
  );

  const renderModals = () => (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {isExportModalOpen && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </>
  );

  return (
    <>
      <Card className={classNames('taxonomy-card', className)} data-testid={`taxonomy-card-${id}`}>
        <Card.Header
          title={name}
          subtitle={getHeaderSubtitle()}
          actions={getHeaderActions()}
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
      {renderModals()}
    </>
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
