import React, {
  useEffect, useState, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Badge, Button, useToggle } from '@edx/paragon';
import { Add as IconAdd } from '@edx/paragon/icons';

import { setCurrentItem, setCurrentSection } from '../data/slice';
import { RequestStatus } from '../../data/constants';
import CardHeader from '../card-header/CardHeader';
import BaseTitleWithStatusBadge from '../card-header/BaseTitleWithStatusBadge';
import TitleButton from '../card-header/TitleButton';
import { getItemStatus, scrollToElement } from '../utils';
import messages from './messages';

const SectionCard = ({
  section,
  children,
  onOpenHighlightsModal,
  onOpenPublishModal,
  onOpenConfigureModal,
  onEditSectionSubmit,
  savingStatus,
  onOpenDeleteModal,
  onDuplicateSubmit,
  isSectionsExpanded,
  onNewSubsectionSubmit,
}) => {
  const currentRef = useRef(null);
  const intl = useIntl();
  const dispatch = useDispatch();
  const [isExpanded, setIsExpanded] = useState(isSectionsExpanded);
  const [isFormOpen, openForm, closeForm] = useToggle(false);
  const namePrefix = 'section';

  useEffect(() => {
    setIsExpanded(isSectionsExpanded);
  }, [isSectionsExpanded]);

  useEffect(() => {
    // if this items has been newly added, scroll to it.
    if (currentRef.current && section.shouldScroll) {
      scrollToElement(currentRef.current);
    }
  }, []);

  const {
    id,
    displayName,
    hasChanges,
    published,
    releasedToStudents,
    visibleToStaffOnly = false,
    visibilityState,
    staffOnlyMessage,
    highlights,
  } = section;

  const sectionStatus = getItemStatus({
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
    dispatch(setCurrentItem(section));
    dispatch(setCurrentSection(section));
  };

  const handleEditSubmit = (titleValue) => {
    if (displayName !== titleValue) {
      // both itemId and sectionId are same
      onEditSectionSubmit(id, id, titleValue);
      return;
    }

    closeForm();
  };

  const handleOpenHighlightsModal = () => {
    onOpenHighlightsModal(section);
  };

  const handleNewSubsectionSubmit = () => {
    onNewSubsectionSubmit(id);
  };

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      closeForm();
    }
  }, [savingStatus]);

  const titleComponent = (
    <TitleButton
      isExpanded={isExpanded}
      onTitleClick={handleExpandContent}
      namePrefix={namePrefix}
    >
      <BaseTitleWithStatusBadge
        title={displayName}
        status={sectionStatus}
        namePrefix={namePrefix}
      />
    </TitleButton>
  );

  return (
    <div
      className="section-card"
      data-testid="section-card"
      ref={currentRef}
    >
      <div>
        <CardHeader
          sectionId={id}
          title={displayName}
          status={sectionStatus}
          hasChanges={hasChanges}
          onClickMenuButton={handleClickMenuButton}
          onClickPublish={onOpenPublishModal}
          onClickConfigure={onOpenConfigureModal}
          onClickEdit={openForm}
          onClickDelete={onOpenDeleteModal}
          isFormOpen={isFormOpen}
          closeForm={closeForm}
          onEditSubmit={handleEditSubmit}
          isDisabledEditField={savingStatus === RequestStatus.IN_PROGRESS}
          onClickDuplicate={onDuplicateSubmit}
          titleComponent={titleComponent}
          namePrefix={namePrefix}
        />
        <div className="section-card__content" data-testid="section-card__content">
          <div className="outline-section__status">
            <Button
              className="section-card__highlights"
              data-destid="section-card-highlights-button"
              variant="tertiary"
              onClick={handleOpenHighlightsModal}
            >
              <Badge className="highlights-badge">{highlights.length}</Badge>
              <p className="m-0 text-black">{messages.sectionHighlightsBadge.defaultMessage}</p>
            </Button>
          </div>
        </div>
        {isExpanded && (
          <div data-testid="section-card__subsections" className="section-card__subsections">
            {children}
            <Button
              data-testid="new-subsection-button"
              className="mt-4"
              variant="outline-primary"
              iconBefore={IconAdd}
              block
              onClick={handleNewSubsectionSubmit}
            >
              {intl.formatMessage(messages.newSubsectionButton)}
            </Button>
          </div>
        )}
      </div>
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
    hasChanges: PropTypes.bool.isRequired,
    releasedToStudents: PropTypes.bool.isRequired,
    visibleToStaffOnly: PropTypes.bool,
    visibilityState: PropTypes.string.isRequired,
    staffOnlyMessage: PropTypes.bool.isRequired,
    highlights: PropTypes.arrayOf(PropTypes.string).isRequired,
    shouldScroll: PropTypes.bool,
  }).isRequired,
  children: PropTypes.node,
  onOpenHighlightsModal: PropTypes.func.isRequired,
  onOpenPublishModal: PropTypes.func.isRequired,
  onOpenConfigureModal: PropTypes.func.isRequired,
  onEditSectionSubmit: PropTypes.func.isRequired,
  savingStatus: PropTypes.string.isRequired,
  onOpenDeleteModal: PropTypes.func.isRequired,
  onDuplicateSubmit: PropTypes.func.isRequired,
  isSectionsExpanded: PropTypes.bool.isRequired,
  onNewSubsectionSubmit: PropTypes.func.isRequired,
};

export default SectionCard;
