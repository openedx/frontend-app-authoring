// @ts-check
import React, {
  useContext, useEffect, useState, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Bubble, Button, useToggle } from '@openedx/paragon';
import { Add as IconAdd } from '@openedx/paragon/icons';
import { useSearchParams } from 'react-router-dom';
import classNames from 'classnames';

import { setCurrentItem, setCurrentSection } from '../data/slice';
import { RequestStatus } from '../../data/constants';
import CardHeader from '../card-header/CardHeader';
import SortableItem from '../../generic/drag-helper/SortableItem';
import { DragContext } from '../../generic/drag-helper/DragContextProvider';
import TitleButton from '../card-header/TitleButton';
import XBlockStatus from '../xblock-status/XBlockStatus';
import { getItemStatus, getItemStatusBorder, scrollToElement } from '../utils';
import messages from './messages';

const SectionCard = ({
  section,
  isSelfPaced,
  isCustomRelativeDatesActive,
  children,
  index,
  canMoveItem,
  onOpenHighlightsModal,
  onOpenPublishModal,
  onOpenConfigureModal,
  onEditSectionSubmit,
  savingStatus,
  onOpenDeleteModal,
  onDuplicateSubmit,
  isSectionsExpanded,
  onNewSubsectionSubmit,
  onOrderChange,
}) => {
  const currentRef = useRef(null);
  const intl = useIntl();
  const dispatch = useDispatch();
  const { activeId, overId } = useContext(DragContext);
  const [searchParams] = useSearchParams();
  const locatorId = searchParams.get('show');
  const isScrolledToElement = locatorId === section.id;

  // Expand the section if a search result should be shown/scrolled to
  const containsSearchResult = () => {
    if (locatorId) {
      const subsections = section.childInfo?.children;
      if (subsections) {
        for (let i = 0; i < subsections.length; i++) {
          const subsection = subsections[i];

          // Check if the search result is one of the subsections
          const matchedSubsection = subsection.id === locatorId;
          if (matchedSubsection) {
            return true;
          }

          // Check if the search result is one of the units
          const matchedUnit = !!subsection.childInfo?.children?.filter((child) => child.id === locatorId).length;
          if (matchedUnit) {
            return true;
          }
        }
      }
    }

    return false;
  };
  const [isExpanded, setIsExpanded] = useState(containsSearchResult() || isSectionsExpanded);
  const [isFormOpen, openForm, closeForm] = useToggle(false);
  const namePrefix = 'section';

  useEffect(() => {
    setIsExpanded(isSectionsExpanded);
  }, [isSectionsExpanded]);

  const {
    id,
    category,
    displayName,
    hasChanges,
    published,
    visibilityState,
    highlights,
    actions: sectionActions,
    isHeaderVisible = true,
  } = section;

  useEffect(() => {
    if (activeId === id && isExpanded) {
      setIsExpanded(false);
    } else if (overId === id && !isExpanded) {
      setIsExpanded(true);
    }
  }, [activeId, overId]);

  useEffect(() => {
    if (currentRef.current && (section.shouldScroll || isScrolledToElement)) {
      // Align element closer to the top of the screen if scrolling for search result
      const alignWithTop = !!isScrolledToElement;
      scrollToElement(currentRef.current, alignWithTop);
    }
  }, [isScrolledToElement]);

  useEffect(() => {
    // If the locatorId is set/changed, we need to make sure that the section is expanded
    // if it contains the result, in order to scroll to it
    setIsExpanded((prevState) => containsSearchResult() || prevState);
  }, [locatorId, setIsExpanded]);

  // re-create actions object for customizations
  const actions = { ...sectionActions };
  // add actions to control display of move up & down menu buton.
  actions.allowMoveUp = canMoveItem(index, -1);
  actions.allowMoveDown = canMoveItem(index, 1);

  const sectionStatus = getItemStatus({
    published,
    visibilityState,
    hasChanges,
  });

  // remove border when section is expanded
  const borderStyle = getItemStatusBorder(!isExpanded ? sectionStatus : '');

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

  const handleSectionMoveUp = () => {
    onOrderChange(index, index - 1);
  };

  const handleSectionMoveDown = () => {
    onOrderChange(index, index + 1);
  };

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      closeForm();
    }
  }, [savingStatus]);

  const titleComponent = (
    <TitleButton
      title={displayName}
      isExpanded={isExpanded}
      onTitleClick={handleExpandContent}
      namePrefix={namePrefix}
    />
  );

  const isDraggable = actions.draggable && (actions.allowMoveUp || actions.allowMoveDown);

  return (
    <SortableItem
      id={id}
      category={category}
      isDraggable={isDraggable}
      isDroppable={actions.childAddable}
      componentStyle={{
        padding: '1.75rem',
        ...borderStyle,
      }}
    >
      <div
        className={`section-card ${isScrolledToElement ? 'highlight' : ''}`}
        data-testid="section-card"
        ref={currentRef}
      >
        <div>
          {isHeaderVisible && (
            <CardHeader
              cardId={id}
              title={displayName}
              status={sectionStatus}
              hasChanges={hasChanges}
              onClickMenuButton={handleClickMenuButton}
              onClickPublish={onOpenPublishModal}
              onClickConfigure={onOpenConfigureModal}
              onClickEdit={openForm}
              onClickDelete={onOpenDeleteModal}
              onClickMoveUp={handleSectionMoveUp}
              onClickMoveDown={handleSectionMoveDown}
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
          <div className="section-card__content" data-testid="section-card__content">
            <div className="outline-section__status mb-1">
              <Button
                className="p-0 bg-transparent"
                data-destid="section-card-highlights-button"
                variant="tertiary"
                onClick={handleOpenHighlightsModal}
              >
                <Bubble className="mr-1">
                  {highlights.length}
                </Bubble>
                <p className="m-0 text-black">{messages.sectionHighlightsBadge.defaultMessage}</p>
              </Button>
            </div>
            <XBlockStatus
              isSelfPaced={isSelfPaced}
              isCustomRelativeDatesActive={isCustomRelativeDatesActive}
              blockData={section}
            />
          </div>
          {isExpanded && (
            <div
              data-testid="section-card__subsections"
              className={classNames('section-card__subsections', { 'item-children': isDraggable })}
            >
              {children}
              {actions.childAddable && (
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
              )}
            </div>
          )}
        </div>
      </div>
    </SortableItem>
  );
};

SectionCard.defaultProps = {
  children: null,
};

SectionCard.propTypes = {
  section: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    published: PropTypes.bool.isRequired,
    hasChanges: PropTypes.bool.isRequired,
    visibilityState: PropTypes.string.isRequired,
    highlights: PropTypes.arrayOf(PropTypes.string).isRequired,
    shouldScroll: PropTypes.bool,
    actions: PropTypes.shape({
      deletable: PropTypes.bool.isRequired,
      draggable: PropTypes.bool.isRequired,
      childAddable: PropTypes.bool.isRequired,
      duplicable: PropTypes.bool.isRequired,
    }).isRequired,
    isHeaderVisible: PropTypes.bool,
    childInfo: PropTypes.shape({
      children: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          childInfo: PropTypes.shape({
            children: PropTypes.arrayOf(
              PropTypes.shape({
                id: PropTypes.string.isRequired,
              }),
            ).isRequired,
          }).isRequired,
        }),
      ).isRequired,
    }).isRequired,
  }).isRequired,
  isSelfPaced: PropTypes.bool.isRequired,
  isCustomRelativeDatesActive: PropTypes.bool.isRequired,
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
  index: PropTypes.number.isRequired,
  canMoveItem: PropTypes.func.isRequired,
  onOrderChange: PropTypes.func.isRequired,
};

export default SectionCard;
