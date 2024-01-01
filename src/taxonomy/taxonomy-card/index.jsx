import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  OverlayTrigger,
  Popover,
} from '@openedx/paragon';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import classNames from 'classnames';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import TaxonomyCardMenu from './TaxonomyCardMenu';
import ExportModal from '../export-modal';
import DeleteDialog from '../delete-dialog';
import SystemDefinedBadge from '../system-defined-badge';

const orgsCountEnabled = (orgsCount) => orgsCount !== undefined && orgsCount !== 0;

const HeaderSubtitle = ({
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

HeaderSubtitle.defaultProps = {
  orgsCount: undefined,
};

HeaderSubtitle.propTypes = {
  id: PropTypes.number.isRequired,
  showSystemBadge: PropTypes.bool.isRequired,
  orgsCount: PropTypes.number,
};

const HeaderTitle = ({ taxonomyId, title }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const containerWidth = containerRef.current.clientWidth;
    const textWidth = textRef.current.offsetWidth;
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

HeaderTitle.propTypes = {
  taxonomyId: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
};

const TaxonomyCard = ({ className, original, onDeleteTaxonomy }) => {
  const {
    id, name, description, systemDefined, orgsCount, tagsCount,
  } = original;

  const intl = useIntl();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMenuEnalbed, setIsMenuEnabled] = useState(true);

  useEffect(() => {
    // Resets the card to the initial state
    setIsMenuEnabled(true);
  }, [id]);

  // Add here more menu item actions
  const menuItemActions = {
    export: () => setIsExportModalOpen(true),
    delete: () => setIsDeleteDialogOpen(true),
  };
  const menuItems = ['export', 'delete'];
  const systemDefinedMenuItems = ['export'];

  const onClickMenuItem = (menuName) => (
    menuItemActions[menuName]?.()
  );

  const onClickDeleteTaxonomy = () => {
    setIsMenuEnabled(false);
    onDeleteTaxonomy(id, name);
  };

  const getHeaderActions = () => {
    let enabledMenuItems = menuItems;
    if (systemDefined) {
      enabledMenuItems = systemDefinedMenuItems;
    }
    return (
      <TaxonomyCardMenu
        id={id}
        name={name}
        onClickMenuItem={onClickMenuItem}
        disabled={!isMenuEnalbed}
        menuItems={enabledMenuItems}
      />
    );
  };

  const renderExportModal = () => isExportModalOpen && (
    <ExportModal
      isOpen={isExportModalOpen}
      onClose={() => setIsExportModalOpen(false)}
      taxonomyId={id}
    />
  );

  const renderDeleteDialog = () => isDeleteDialogOpen && (
    <DeleteDialog
      isOpen={isDeleteDialogOpen}
      onClose={() => setIsDeleteDialogOpen(false)}
      onDelete={onClickDeleteTaxonomy}
      taxonomyName={name}
      tagsCount={tagsCount}
    />
  );

  return (
    <>
      <Card
        isClickable
        as={NavLink}
        to={`/taxonomy/${id}/`}
        className={classNames('taxonomy-card', className)}
        data-testid={`taxonomy-card-${id}`}
      >
        <Card.Header
          title={<HeaderTitle taxonomyId={id} title={name} />}
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
      {renderExportModal()}
      {renderDeleteDialog()}
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
    tagsCount: PropTypes.number,
  }).isRequired,
  onDeleteTaxonomy: PropTypes.func.isRequired,
};

export default TaxonomyCard;
