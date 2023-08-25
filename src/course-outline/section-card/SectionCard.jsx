import React, { useState } from 'react';
import PropTypes from 'prop-types';

import CardHeader from '../card-header/CardHeader';
import { getSectionStatus } from '../utils';

const SectionCard = ({
  section,
  children,
  onOpenPublishModal,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    displayName,
    published,
    releasedToStudents,
    visibleToStaffOnly,
    visibilityState,
    staffOnlyMessage,
  } = section;

  const sectionStatus = getSectionStatus({
    published,
    releasedToStudents,
    visibleToStaffOnly,
    visibilityState,
    staffOnlyMessage,
  });

  const handleExpandContent = () => {
    setIsExpanded((prevState) => !prevState);
  };

  const handleClickMenuButton = () => {
  };

  return (
    <div className="section-card">
      <CardHeader
        title={displayName}
        sectionStatus={sectionStatus}
        isExpanded={isExpanded}
        onExpand={handleExpandContent}
        onClickMenuButton={handleClickMenuButton}
        onClickPublish={onOpenPublishModal}
      />
      <div className="section-card__content" data-testid="section-card__content">
        <div className="outline-section__status">
          {/* TODO: add section highlight widget */}
          <h4 className="h4 font-weight-normal">Section status</h4>
        </div>
      </div>
      {isExpanded && children && (
        <div className="section-card__subsections" data-testid="section-card__subsections">
          {children}
          <h4>children</h4>
        </div>
      )}
    </div>
  );
};

SectionCard.defaultProps = {
  children: null,
};

SectionCard.propTypes = {
  section: PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    published: PropTypes.bool.isRequired,
    releasedToStudents: PropTypes.bool.isRequired,
    visibleToStaffOnly: PropTypes.bool.isRequired,
    visibilityState: PropTypes.string.isRequired,
    staffOnlyMessage: PropTypes.bool.isRequired,
  }).isRequired,
  children: PropTypes.node,
  onOpenPublishModal: PropTypes.func.isRequired,
};

export default SectionCard;
