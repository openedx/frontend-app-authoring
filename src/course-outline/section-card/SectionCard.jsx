import React, {
  forwardRef, useEffect, useState, useRef,
} from 'react';
import { useDrag, useDrop } from 'react-dnd';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Badge, Button, useToggle } from '@edx/paragon';
import { Add as IconAdd } from '@edx/paragon/icons';

import { setCurrentItem, setCurrentSection } from '../data/slice';
import { RequestStatus } from '../../data/constants';
import CardHeader from '../card-header/CardHeader';
import { getItemStatus } from '../utils';
import messages from './messages';
import ItemTypes from './itemTypes';

const SectionCard = forwardRef(({
  section,
  index,
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
  moveSection,
  finalizeSectionOrder,
}, lastItemRef) => {
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
    hasChanges,
    published,
    releasedToStudents,
    visibleToStaffOnly = false,
    visibilityState,
    staffOnlyMessage,
    highlights,
  } = section;

  const moveRef = useRef(null);

  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.SECTION,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!moveRef.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }
      // Determine rectangle on screen
      const hoverBoundingRect = moveRef.current?.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      // Time to actually perform the action
      moveSection(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      // eslint-disable-next-line no-param-reassign
      item.index = hoverIndex;
    },
  });

  const indexCopy = index;
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.SECTION,
    item: () => ({ id, index, startingIndex: indexCopy }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => !isFormOpen,
    end: (item) => {
      const { startingIndex } = item;
      if (index !== startingIndex) {
        finalizeSectionOrder();
      }
    },
  });
  const opacity = isDragging ? 0 : 1;
  drag(drop(moveRef));

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

  return (
    <div
      className="section-card"
      data-testid="section-card"
      data-handler-id={handlerId}
      style={{ opacity }}
      ref={moveRef}
    >
      <div ref={lastItemRef}>
        <CardHeader
          sectionId={id}
          title={displayName}
          status={sectionStatus}
          hasChanges={hasChanges}
          isExpanded={isExpanded}
          onExpand={handleExpandContent}
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
          namePrefix="section"
          className="nodrag"
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
          <>
            <div data-testid="section-card__subsections" className="section-card__subsections">
              {children}
            </div>
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
          </>
        )}
      </div>
    </div>
  );
});

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
  }).isRequired,
  index: PropTypes.number.isRequired,
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
  moveSection: PropTypes.func.isRequired,
  finalizeSectionOrder: PropTypes.func.isRequired,
};

export default SectionCard;
