import React, {
  useContext, useEffect, useState, useRef, useCallback, ReactNode,
} from 'react';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Icon, StandardModal, useToggle } from '@openedx/paragon';
import { Newsstand } from '@openedx/paragon/icons';
import classNames from 'classnames';
import { isEmpty } from 'lodash';

import CourseOutlineSubsectionCardExtraActionsSlot from '@src/plugin-slots/CourseOutlineSubsectionCardExtraActionsSlot';
import { setCurrentItem, setCurrentSection, setCurrentSubsection } from '@src/course-outline/data/slice';
import { RequestStatus } from '@src/data/constants';
import CardHeader from '@src/course-outline/card-header/CardHeader';
import SortableItem from '@src/course-outline/drag-helper/SortableItem';
import { DragContext } from '@src/course-outline/drag-helper/DragContextProvider';
import { useClipboard, PasteComponent } from '@src/generic/clipboard';
import TitleButton from '@src/course-outline/card-header/TitleButton';
import XBlockStatus from '@src/course-outline/xblock-status/XBlockStatus';
import { getItemStatus, getItemStatusBorder, scrollToElement } from '@src/course-outline/utils';
import { ComponentPicker, SelectedComponent } from '@src/library-authoring';
import { COMPONENT_TYPES } from '@src/generic/block-type-utils/constants';
import { ContainerType } from '@src/generic/key-utils';
import { ContentType } from '@src/library-authoring/routes';
import OutlineAddChildButtons from '@src/course-outline/OutlineAddChildButtons';
import { XBlock } from '@src/data/types';
import messages from './messages';

interface SubsectionCardProps {
  section: XBlock,
  subsection: XBlock,
  children: ReactNode
  isSectionsExpanded: boolean,
  isSelfPaced: boolean,
  isCustomRelativeDatesActive: boolean,
  onOpenPublishModal: () => void,
  onEditSubmit: (itemId: string, sectionId: string, displayName: string) => void,
  savingStatus: string,
  onOpenDeleteModal: () => void,
  onDuplicateSubmit: () => void,
  onNewUnitSubmit: (subsectionId: string) => void,
  onAddUnitFromLibrary: (options: {
    type: string,
    category?: string,
    parentLocator: string,
    displayName?: string,
    boilerplate?: string,
    stagedContent?: string,
    libraryContentKey: string,
  }) => void,
  index: number,
  getPossibleMoves: (index: number, step: number) => void,
  onOrderChange: (section: XBlock, moveDetails: any) => void,
  onOpenConfigureModal: () => void,
  onPasteClick: (parentLocator: string, sectionId: string) => void,
  resetScrollState: () => void,
}

const SubsectionCard = ({
  section,
  subsection,
  isSectionsExpanded,
  isSelfPaced,
  isCustomRelativeDatesActive,
  children,
  index,
  getPossibleMoves,
  onOpenPublishModal,
  onEditSubmit,
  savingStatus,
  onOpenDeleteModal,
  onDuplicateSubmit,
  onNewUnitSubmit,
  onAddUnitFromLibrary,
  onOrderChange,
  onOpenConfigureModal,
  onPasteClick,
  resetScrollState,
}: SubsectionCardProps) => {
  const currentRef = useRef(null);
  const intl = useIntl();
  const dispatch = useDispatch();
  const { activeId, overId } = useContext(DragContext);
  const [searchParams] = useSearchParams();
  const locatorId = searchParams.get('show');
  const isScrolledToElement = locatorId === subsection.id;
  const [isFormOpen, openForm, closeForm] = useToggle(false);
  const namePrefix = 'subsection';
  const { sharedClipboardData, showPasteUnit } = useClipboard();
  const [
    isAddLibraryUnitModalOpen,
    openAddLibraryUnitModal,
    closeAddLibraryUnitModal,
  ] = useToggle(false);

  const {
    id,
    category,
    displayName,
    hasChanges,
    published,
    visibilityState,
    actions: subsectionActions,
    isHeaderVisible = true,
    enableCopyPasteUnits = false,
    proctoringExamConfigurationLink,
  } = subsection;

  // re-create actions object for customizations
  const actions = { ...subsectionActions };
  // add actions to control display of move up & down menu button.
  const moveUpDetails = getPossibleMoves(index, -1);
  const moveDownDetails = getPossibleMoves(index, 1);
  actions.allowMoveUp = !isEmpty(moveUpDetails);
  actions.allowMoveDown = !isEmpty(moveDownDetails);

  // Expand the subsection if a search result should be shown/scrolled to
  const containsSearchResult = () => {
    if (locatorId) {
      return !!subsection.childInfo?.children?.filter((child) => child.id === locatorId).length;
    }

    return false;
  };
  const [isExpanded, setIsExpanded] = useState(containsSearchResult() || !isHeaderVisible || isSectionsExpanded);
  const subsectionStatus = getItemStatus({
    published,
    visibilityState,
    hasChanges,
  });
  const borderStyle = getItemStatusBorder(subsectionStatus);

  useEffect(() => {
    setIsExpanded(isSectionsExpanded);
  }, [isSectionsExpanded]);

  const handleExpandContent = () => {
    setIsExpanded((prevState) => !prevState);
  };

  const handleClickMenuButton = () => {
    dispatch(setCurrentSection(section));
    dispatch(setCurrentSubsection(subsection));
    dispatch(setCurrentItem(subsection));
  };

  const handleEditSubmit = (titleValue: string) => {
    if (displayName !== titleValue) {
      onEditSubmit(id, section.id, titleValue);
      return;
    }

    closeForm();
  };

  const handleSubsectionMoveUp = () => {
    onOrderChange(section, moveUpDetails);
  };

  const handleSubsectionMoveDown = () => {
    onOrderChange(section, moveDownDetails);
  };

  const handleNewButtonClick = () => onNewUnitSubmit(id);
  const handlePasteButtonClick = () => onPasteClick(id, section.id);

  const titleComponent = (
    <TitleButton
      title={displayName}
      isExpanded={isExpanded}
      onTitleClick={handleExpandContent}
      namePrefix={namePrefix}
      prefixIcon={!!subsection.upstreamInfo?.upstreamRef && (
        <Icon src={Newsstand} className="mr-1" />
      )}
    />
  );

  const extraActionsComponent = (
    <CourseOutlineSubsectionCardExtraActionsSlot
      subsection={subsection}
      section={section}
    />
  );

  useEffect(() => {
    if (activeId === id && isExpanded) {
      setIsExpanded(false);
    } else if (overId === id && !isExpanded) {
      setIsExpanded(true);
    }
  }, [activeId, overId]);

  useEffect(() => {
    // if this items has been newly added, scroll to it.
    if (currentRef.current && (subsection.shouldScroll || isScrolledToElement)) {
      // Align element closer to the top of the screen if scrolling for search result
      const alignWithTop = !!isScrolledToElement;
      scrollToElement(currentRef.current, alignWithTop, true);
      resetScrollState();
    }
  }, [isScrolledToElement]);

  useEffect(() => {
    // If the locatorId is set/changed, we need to make sure that the subsection is expanded
    // if it contains the result, in order to scroll to it
    setIsExpanded((prevState) => (containsSearchResult() || prevState));
  }, [locatorId, setIsExpanded]);

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      closeForm();
    }
  }, [savingStatus]);

  const isDraggable = (
    actions.draggable
      && (actions.allowMoveUp || actions.allowMoveDown)
      && !(isHeaderVisible === false)
  );

  const handleSelectLibraryUnit = useCallback((selectedUnit: SelectedComponent) => {
    onAddUnitFromLibrary({
      type: COMPONENT_TYPES.libraryV2,
      category: ContainerType.Vertical,
      parentLocator: id,
      libraryContentKey: selectedUnit.usageKey,
    });
    closeAddLibraryUnitModal();
  }, [id, onAddUnitFromLibrary, closeAddLibraryUnitModal]);

  return (
    <>
      <SortableItem
        id={id}
        category={category}
        key={id}
        isDraggable={isDraggable}
        isDroppable={actions.childAddable}
        componentStyle={{
          background: '#f8f7f6',
          ...borderStyle,
        }}
      >
        <div
          className={`subsection-card ${isScrolledToElement ? 'highlight' : ''}`}
          data-testid="subsection-card"
          ref={currentRef}
        >
          {isHeaderVisible && (
            <>
              <CardHeader
                title={displayName}
                status={subsectionStatus}
                cardId={id}
                hasChanges={hasChanges}
                onClickMenuButton={handleClickMenuButton}
                onClickPublish={onOpenPublishModal}
                onClickEdit={openForm}
                onClickDelete={onOpenDeleteModal}
                onClickMoveUp={handleSubsectionMoveUp}
                onClickMoveDown={handleSubsectionMoveDown}
                onClickConfigure={onOpenConfigureModal}
                isFormOpen={isFormOpen}
                closeForm={closeForm}
                onEditSubmit={handleEditSubmit}
                isDisabledEditField={savingStatus === RequestStatus.IN_PROGRESS}
                onClickDuplicate={onDuplicateSubmit}
                titleComponent={titleComponent}
                namePrefix={namePrefix}
                actions={actions}
                proctoringExamConfigurationLink={proctoringExamConfigurationLink}
                isSequential
                extraActionsComponent={extraActionsComponent}
              />
              <div className="subsection-card__content item-children" data-testid="subsection-card__content">
                <XBlockStatus
                  isSelfPaced={isSelfPaced}
                  isCustomRelativeDatesActive={isCustomRelativeDatesActive}
                  blockData={subsection}
                />
              </div>
            </>
          )}
          {(isExpanded) && (
            <div
              data-testid="subsection-card__units"
              className={classNames('subsection-card__units', { 'item-children': isDraggable })}
            >
              {children}
              {actions.childAddable && (
                <>
                  <OutlineAddChildButtons
                    handleNewButtonClick={handleNewButtonClick}
                    handleUseFromLibraryClick={openAddLibraryUnitModal}
                    childType={ContainerType.Unit}
                  />
                  {enableCopyPasteUnits && showPasteUnit && sharedClipboardData && (
                    <PasteComponent
                      className="mt-4 border-gray-500 rounded-0"
                      text={intl.formatMessage(messages.pasteButton)}
                      clipboardData={sharedClipboardData}
                      onClick={handlePasteButtonClick}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </SortableItem>
      <StandardModal
        title={intl.formatMessage(messages.unitPickerModalTitle)}
        isOpen={isAddLibraryUnitModalOpen}
        onClose={closeAddLibraryUnitModal}
        isOverflowVisible={false}
        size="xl"
      >
        <ComponentPicker
          showOnlyPublished
          extraFilter={['block_type = "unit"']}
          componentPickerMode="single"
          onComponentSelected={handleSelectLibraryUnit}
          visibleTabs={[ContentType.units]}
        />
      </StandardModal>
    </>
  );
};

export default SubsectionCard;
