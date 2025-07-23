import {
  useContext, useEffect, useState, useRef, useCallback, ReactNode,
} from 'react';
import { useDispatch } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Bubble, Button, Icon, StandardModal, useToggle,
} from '@openedx/paragon';
import { Newsstand } from '@openedx/paragon/icons';
import { useSearchParams } from 'react-router-dom';
import classNames from 'classnames';

import { setCurrentItem, setCurrentSection } from '@src/course-outline/data/slice';
import { RequestStatus } from '@src/data/constants';
import CardHeader from '@src/course-outline/card-header/CardHeader';
import SortableItem from '@src/course-outline/drag-helper/SortableItem';
import { DragContext } from '@src/course-outline/drag-helper/DragContextProvider';
import TitleButton from '@src/course-outline/card-header/TitleButton';
import XBlockStatus from '@src/course-outline/xblock-status/XBlockStatus';
import { getItemStatus, getItemStatusBorder, scrollToElement } from '@src/course-outline/utils';
import OutlineAddChildButtons from '@src/course-outline/OutlineAddChildButtons';
import { ContainerType } from '@src/generic/key-utils';
import { ComponentPicker, SelectedComponent } from '@src/library-authoring';
import { ContentType } from '@src/library-authoring/routes';
import { COMPONENT_TYPES } from '@src/generic/block-type-utils/constants';
import { XBlock } from '@src/data/types';
import messages from './messages';

interface SectionCardProps {
  section: XBlock,
  isSelfPaced: boolean,
  isCustomRelativeDatesActive: boolean,
  children: ReactNode,
  onOpenHighlightsModal: (section: XBlock) => void,
  onOpenPublishModal: () => void,
  onOpenConfigureModal: () => void,
  onEditSectionSubmit: (itemId: string, sectionId: string, displayName: string) => void,
  savingStatus: string,
  onOpenDeleteModal: () => void,
  onDuplicateSubmit: () => void,
  isSectionsExpanded: boolean,
  onNewSubsectionSubmit: (id: string) => void,
  onAddSubsectionFromLibrary: (props: object) => {},
  index: number,
  canMoveItem: (oldIndex: number, newIndex: number) => boolean,
  onOrderChange: (oldIndex: number, newIndex: number) => void,
  resetScrollState: () => void,
}

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
  onAddSubsectionFromLibrary,
  onOrderChange,
  resetScrollState,
}: SectionCardProps) => {
  const currentRef = useRef(null);
  const intl = useIntl();
  const dispatch = useDispatch();
  const { activeId, overId } = useContext(DragContext);
  const [searchParams] = useSearchParams();
  const locatorId = searchParams.get('show');
  const isScrolledToElement = locatorId === section.id;
  const [
    isAddLibrarySubsectionModalOpen,
    openAddLibrarySubsectionModal,
    closeAddLibrarySubsectionModal,
  ] = useToggle(false);

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
      scrollToElement(currentRef.current, alignWithTop, true);
      resetScrollState();
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

  const handleEditSubmit = (titleValue: string) => {
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

  /**
  * Callback to handle the selection of a library subsection to be imported to course.
  * @param {Object} selectedSubection - The selected subsection details.
  * @returns {void}
  */
  const handleSelectLibrarySubsection = useCallback((selectedSubection: SelectedComponent) => {
    onAddSubsectionFromLibrary({
      type: COMPONENT_TYPES.libraryV2,
      category: ContainerType.Sequential,
      parentLocator: id,
      libraryContentKey: selectedSubection.usageKey,
    });
    closeAddLibrarySubsectionModal();
  }, [id, onAddSubsectionFromLibrary, closeAddLibrarySubsectionModal]);

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
      prefixIcon={!!section.upstreamInfo?.upstreamRef && (
        <Icon src={Newsstand} className="mr-1" />
      )}
    />
  );

  const isDraggable = actions.draggable && (actions.allowMoveUp || actions.allowMoveDown);

  return (
    <>
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
                  <OutlineAddChildButtons
                    handleNewButtonClick={handleNewSubsectionSubmit}
                    handleUseFromLibraryClick={openAddLibrarySubsectionModal}
                    childType={ContainerType.Subsection}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </SortableItem>
      <StandardModal
        title={intl.formatMessage(messages.subsectionPickerModalTitle)}
        isOpen={isAddLibrarySubsectionModalOpen}
        onClose={closeAddLibrarySubsectionModal}
        isOverflowVisible={false}
        size="xl"
      >
        <ComponentPicker
          showOnlyPublished
          extraFilter={['block_type = "subsection"']}
          componentPickerMode="single"
          onComponentSelected={handleSelectLibrarySubsection}
          visibleTabs={[ContentType.subsections]}
        />
      </StandardModal>
    </>
  );
};

export default SectionCard;
