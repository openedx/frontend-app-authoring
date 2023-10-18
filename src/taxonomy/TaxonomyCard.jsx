import React, { useState } from 'react';
import {
  Badge,
  IconButton,
  Card,
  OverlayTrigger,
  Popover,
  ModalPopup,
  Menu,
  Icon,
  MenuItem,
} from '@edx/paragon';
import { MoreVert } from '@edx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import messages from './messages';

const TaxonomyCard = ({ className, original, intl }) => {
  const {
    id, name, description, systemDefined, orgsCount,
  } = original;

  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const [menuTarget, setMenuTarget] = useState(null);

  const orgsCountEnabled = () => orgsCount !== undefined && orgsCount !== 0;

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

  const onClickExport = () => {
    setMenuIsOpen(false);
  };

  const getHeaderActions = () => (
    <>
      <IconButton
        variant="primary"
        onClick={() => setMenuIsOpen(true)}
        ref={setMenuTarget}
        src={MoreVert}
        iconAs={Icon}
        alt={intl.formatMessage(messages.taxonomyMenuAlt, { name })}
        data-testid={`taxonomy-card-menu-button-${id}`}
      />
      <ModalPopup
        positionRef={menuTarget}
        isOpen={menuIsOpen}
        onClose={() => setMenuIsOpen(false)}
      >
        <Menu data-testid={`taxonomy-card-menu-${id}`}>
          <MenuItem className="taxonomy-menu-item" onClick={onClickExport}>
            {intl.formatMessage(messages.taxonomyCardExportMenu)}
          </MenuItem>
        </Menu>
      </ModalPopup>
    </>
  );

  return (
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
