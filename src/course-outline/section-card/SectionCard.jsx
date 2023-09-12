import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Badge, Button, useToggle } from '@edx/paragon';
import { Add as IconAdd } from '@edx/paragon/icons';

import { setCurrentSection } from '../data/slice';
import { RequestStatus } from '../../data/constants';
import CardHeader from '../card-header/CardHeader';
import { getSectionStatus } from '../utils';
import messages from './messages';

const SectionCard = ({
  section,
  children,
  onOpenHighlightsModal,
  onOpenPublishModal,
  onClickNewSubsection,
  onEditSectionSubmit,
  savingStatus,
  onOpenDeleteModal,
  onDuplicateSubmit,
  isSectionsExpanded,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(isSectionsExpanded);
  const [isFormOpen, openForm, closeForm] = useToggle(false);

  useEffect(() => {
    setIsExpanded(isSectionsExpanded);
  }, [isSectionsExpanded]);

  const {
    id,
    displayName,
    published,
    releasedToStudents,
    visibleToStaffOnly,
    visibilityState,
    staffOnlyMessage,
    highlights,
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
    dispatch(setCurrentSection(section));
  };

  const handleEditSubmit = (titleValue) => {
    if (displayName !== titleValue) {
      onEditSectionSubmit(id, titleValue);
      return;
    }

    closeForm();
  };

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      closeForm();
    }
  }, [savingStatus]);

  return (
    <div className="section-card" data-testid="section-card">
      <CardHeader
        sectionId={id}
        title={displayName}
        sectionStatus={sectionStatus}
        isExpanded={isExpanded}
        onExpand={handleExpandContent}
        onClickMenuButton={handleClickMenuButton}
        onClickPublish={onOpenPublishModal}
        onClickEdit={openForm}
        onClickDelete={onOpenDeleteModal}
        isFormOpen={isFormOpen}
        closeForm={closeForm}
        onEditSubmit={handleEditSubmit}
        isDisabledEditField={savingStatus === RequestStatus.IN_PROGRESS}
        onClickDuplicate={onDuplicateSubmit}
      />
      <div className="section-card__content" data-testid="section-card__content">
        <div className="outline-section__status">
          <Button
            className="section-card__highlights"
            variant="tertiary"
            onClick={() => onOpenHighlightsModal(section)}
          >
            <Badge className="highlights-badge">{highlights.length}</Badge>
            <p className="m-0 text-black">Section highlights</p>
          </Button>
        </div>
      </div>
      {isExpanded && (
        <div data-testid="section-card__subsections" className="section-card__subsections">
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
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    published: PropTypes.bool.isRequired,
    releasedToStudents: PropTypes.bool.isRequired,
    visibleToStaffOnly: PropTypes.bool.isRequired,
    visibilityState: PropTypes.string.isRequired,
    staffOnlyMessage: PropTypes.bool.isRequired,
    highlights: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  children: PropTypes.node,
  onOpenHighlightsModal: PropTypes.func.isRequired,
  onOpenPublishModal: PropTypes.func.isRequired,
  onClickNewSubsection: PropTypes.func.isRequired,
  onEditSectionSubmit: PropTypes.func.isRequired,
  savingStatus: PropTypes.string.isRequired,
  onOpenDeleteModal: PropTypes.func.isRequired,
  onDuplicateSubmit: PropTypes.func.isRequired,
  isSectionsExpanded: PropTypes.bool.isRequired,
};

export default SectionCard;
