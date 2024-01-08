import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, useToggle } from '@edx/paragon';
import { Add as IconAdd } from '@edx/paragon/icons';

import { setCurrentItem, setCurrentSection, setCurrentSubsection } from '../data/slice';
import { RequestStatus } from '../../data/constants';
import CardHeader from '../card-header/CardHeader';
import BaseTitleWithStatusBadge from '../card-header/BaseTitleWithStatusBadge';
import TitleButton from '../card-header/TitleButton';
import { getItemStatus, scrollToElement } from '../utils';
import messages from './messages';

const SubsectionCard = ({
  section,
  subsection,
  children,
  onOpenPublishModal,
  onEditSubmit,
  savingStatus,
  onOpenDeleteModal,
  onDuplicateSubmit,
  onNewUnitSubmit,
}) => {
  const currentRef = useRef(null);
  const intl = useIntl();
  const dispatch = useDispatch();
  const [isFormOpen, openForm, closeForm] = useToggle(false);
  const namePrefix = 'subsection';

  const {
    id,
    displayName,
    hasChanges,
    published,
    releasedToStudents,
    visibleToStaffOnly = false,
    visibilityState,
    staffOnlyMessage,
    actions,
    isHeaderVisible = true,
  } = subsection;

  const [isExpanded, setIsExpanded] = useState(!isHeaderVisible);
  const subsectionStatus = getItemStatus({
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
    dispatch(setCurrentSubsection(subsection));
    dispatch(setCurrentItem(subsection));
  };

  const handleEditSubmit = (titleValue) => {
    if (displayName !== titleValue) {
      onEditSubmit(id, section.id, titleValue);
      return;
    }

    closeForm();
  };

  const handleNewButtonClick = () => onNewUnitSubmit(id);

  const titleComponent = (
    <TitleButton
      isExpanded={isExpanded}
      onTitleClick={handleExpandContent}
      namePrefix={namePrefix}
    >
      <BaseTitleWithStatusBadge
        title={displayName}
        status={subsectionStatus}
        namePrefix={namePrefix}
      />
    </TitleButton>
  );

  useEffect(() => {
    // if this items has been newly added, scroll to it.
    // we need to check section.shouldScroll as whole section is fetched when a
    // subsection is duplicated under it.
    if (currentRef.current && (section.shouldScroll || subsection.shouldScroll)) {
      scrollToElement(currentRef.current);
    }
  }, []);

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      closeForm();
    }
  }, [savingStatus]);

  return (
    <div className="subsection-card" data-testid="subsection-card" ref={currentRef}>
      {isHeaderVisible && (
        <CardHeader
          title={displayName}
          status={subsectionStatus}
          hasChanges={hasChanges}
          onClickMenuButton={handleClickMenuButton}
          onClickPublish={onOpenPublishModal}
          onClickEdit={openForm}
          onClickDelete={onOpenDeleteModal}
          isFormOpen={isFormOpen}
          closeForm={closeForm}
          onEditSubmit={handleEditSubmit}
          isDisabledEditField={savingStatus === RequestStatus.IN_PROGRESS}
          onClickDuplicate={onDuplicateSubmit}
          titleComponent={titleComponent}
          namePrefix={namePrefix}
          actions={actions}
        />
      )}
      {isExpanded && (
        <div data-testid="subsection-card__units" className="item-children subsection-card__units">
          {children}
          {actions.childAddable && (
            <Button
              data-testid="new-unit-button"
              className="mt-4"
              variant="outline-primary"
              iconBefore={IconAdd}
              block
              onClick={handleNewButtonClick}
            >
              {intl.formatMessage(messages.newUnitButton)}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

SubsectionCard.defaultProps = {
  children: null,
};

SubsectionCard.propTypes = {
  section: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    published: PropTypes.bool.isRequired,
    hasChanges: PropTypes.bool.isRequired,
    releasedToStudents: PropTypes.bool.isRequired,
    visibleToStaffOnly: PropTypes.bool,
    visibilityState: PropTypes.string.isRequired,
    staffOnlyMessage: PropTypes.bool.isRequired,
    shouldScroll: PropTypes.bool,
  }).isRequired,
  subsection: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    published: PropTypes.bool.isRequired,
    hasChanges: PropTypes.bool.isRequired,
    releasedToStudents: PropTypes.bool.isRequired,
    visibleToStaffOnly: PropTypes.bool,
    visibilityState: PropTypes.string.isRequired,
    staffOnlyMessage: PropTypes.bool.isRequired,
    shouldScroll: PropTypes.bool,
    actions: PropTypes.shape({
      deletable: PropTypes.bool.isRequired,
      draggable: PropTypes.bool.isRequired,
      childAddable: PropTypes.bool.isRequired,
      duplicable: PropTypes.bool.isRequired,
    }).isRequired,
    isHeaderVisible: PropTypes.bool,
  }).isRequired,
  children: PropTypes.node,
  onOpenPublishModal: PropTypes.func.isRequired,
  onEditSubmit: PropTypes.func.isRequired,
  savingStatus: PropTypes.string.isRequired,
  onOpenDeleteModal: PropTypes.func.isRequired,
  onDuplicateSubmit: PropTypes.func.isRequired,
  onNewUnitSubmit: PropTypes.func.isRequired,
};

export default SubsectionCard;
