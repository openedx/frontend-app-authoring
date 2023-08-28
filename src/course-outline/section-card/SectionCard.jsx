import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { Add as IconAdd } from '@edx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import CardHeader from '../card-header/CardHeader';
import { getSectionStatus } from '../utils';
import messages from './messages';

const SectionCard = ({
  section,
  children,
  onOpenPublishModal,
  onClickNewSubsection,
}) => {
  const intl = useIntl();
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
        onClickEdit={() => ({})}
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
        </div>
      )}
      {isExpanded && (
        <Button
          data-testid="new-subsection-button"
          className="mt-4"
          variant="outline-primary"
          iconBefore={IconAdd}
          onClick={onClickNewSubsection}
          block
        >
          {intl.formatMessage(messages.newSubsectionButton)}
        </Button>
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
  onClickNewSubsection: PropTypes.func.isRequired,
};

export default SectionCard;
