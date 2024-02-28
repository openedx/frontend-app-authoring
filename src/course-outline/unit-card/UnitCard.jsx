import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useToggle, Sheet } from '@openedx/paragon';

import { setCurrentItem, setCurrentSection, setCurrentSubsection } from '../data/slice';
import { RequestStatus } from '../../data/constants';
import CardHeader from '../card-header/CardHeader';
import ConditionalSortableElement from '../drag-helper/ConditionalSortableElement';
import TitleLink from '../card-header/TitleLink';
import XBlockStatus from '../xblock-status/XBlockStatus';
import { getItemStatus, getItemStatusBorder, scrollToElement } from '../utils';
import { ContentTagsDrawer } from '../../content-tags-drawer';

const UnitCard = ({
  unit,
  subsection,
  section,
  isSelfPaced,
  isCustomRelativeDatesActive,
  index,
  canMoveItem,
  onOpenPublishModal,
  onOpenConfigureModal,
  onEditSubmit,
  savingStatus,
  onOpenDeleteModal,
  onDuplicateSubmit,
  getTitleLink,
  onOrderChange,
  onCopyToClipboardClick,
  discussionsSettings,
  tagsCount,
}) => {
  const currentRef = useRef(null);
  const dispatch = useDispatch();
  const [isFormOpen, openForm, closeForm] = useToggle(false);
  const namePrefix = 'unit';
  const [showManageTags, setShowManageTags] = useState(false);

  const {
    id,
    displayName,
    hasChanges,
    published,
    visibilityState,
    actions: unitActions,
    isHeaderVisible = true,
    enableCopyPasteUnits = false,
    discussionEnabled,
  } = unit;

  // re-create actions object for customizations
  const actions = { ...unitActions };
  // add actions to control display of move up & down menu buton.
  actions.allowMoveUp = canMoveItem(index, -1);
  actions.allowMoveDown = canMoveItem(index, 1);

  const parentInfo = {
    graded: subsection.graded,
    isTimeLimited: subsection.isTimeLimited,
  };

  const unitStatus = getItemStatus({
    published,
    visibilityState,
    hasChanges,
  });
  const borderStyle = getItemStatusBorder(unitStatus);

  const handleClickMenuButton = () => {
    dispatch(setCurrentItem(unit));
    dispatch(setCurrentSection(section));
    dispatch(setCurrentSubsection(subsection));
  };

  const handleEditSubmit = (titleValue) => {
    if (displayName !== titleValue) {
      onEditSubmit(id, section.id, titleValue);
      return;
    }

    closeForm();
  };

  const handleUnitMoveUp = () => {
    onOrderChange(index, index - 1);
  };

  const handleUnitMoveDown = () => {
    onOrderChange(index, index + 1);
  };

  const handleCopyClick = () => {
    onCopyToClipboardClick(unit.id);
  };

  const titleComponent = (
    <TitleLink
      title={displayName}
      titleLink={getTitleLink(id)}
      namePrefix={namePrefix}
    />
  );

  useEffect(() => {
    // if this items has been newly added, scroll to it.
    // we need to check section.shouldScroll as whole section is fetched when a
    // unit is duplicated under it.
    if (currentRef.current && (section.shouldScroll || unit.shouldScroll)) {
      scrollToElement(currentRef.current);
    }
  }, []);

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      closeForm();
    }
  }, [savingStatus]);

  if (!isHeaderVisible) {
    return null;
  }

  const isDraggable = actions.draggable && (actions.allowMoveUp || actions.allowMoveDown);

  return (
    <>
      <ConditionalSortableElement
        id={id}
        key={id}
        draggable={isDraggable}
        componentStyle={{
          background: '#fdfdfd',
          ...borderStyle,
        }}
      >
        <div
          className="unit-card"
          data-testid="unit-card"
          ref={currentRef}
        >
          <CardHeader
            title={displayName}
            status={unitStatus}
            hasChanges={hasChanges}
            onClickMenuButton={handleClickMenuButton}
            onClickPublish={onOpenPublishModal}
            onClickConfigure={onOpenConfigureModal}
            onClickManageTags={() => setShowManageTags(true)}
            onClickEdit={openForm}
            onClickDelete={onOpenDeleteModal}
            onClickMoveUp={handleUnitMoveUp}
            onClickMoveDown={handleUnitMoveDown}
            isFormOpen={isFormOpen}
            closeForm={closeForm}
            onEditSubmit={handleEditSubmit}
            isDisabledEditField={savingStatus === RequestStatus.IN_PROGRESS}
            onClickDuplicate={onDuplicateSubmit}
            titleComponent={titleComponent}
            namePrefix={namePrefix}
            actions={actions}
            isVertical
            enableCopyPasteUnits={enableCopyPasteUnits}
            onClickCopy={handleCopyClick}
            discussionEnabled={discussionEnabled}
            discussionsSettings={discussionsSettings}
            parentInfo={parentInfo}
            tagsCount={tagsCount}
          />
          <div className="unit-card__content item-children" data-testid="unit-card__content">
            <XBlockStatus
              isSelfPaced={isSelfPaced}
              isCustomRelativeDatesActive={isCustomRelativeDatesActive}
              blockData={unit}
            />
          </div>
        </div>
      </ConditionalSortableElement>
      <Sheet
        position="right"
        show={showManageTags}
        onClose={() => setShowManageTags(false)}
      >
        <ContentTagsDrawer
          id={id}
          onClose={() => setShowManageTags(false)}
        />
      </Sheet>
    </>
  );
};

UnitCard.defaultProps = {
  discussionsSettings: {},
  tagsCount: undefined,
};

UnitCard.propTypes = {
  unit: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    published: PropTypes.bool.isRequired,
    hasChanges: PropTypes.bool.isRequired,
    visibilityState: PropTypes.string.isRequired,
    shouldScroll: PropTypes.bool,
    actions: PropTypes.shape({
      deletable: PropTypes.bool.isRequired,
      draggable: PropTypes.bool.isRequired,
      childAddable: PropTypes.bool.isRequired,
      duplicable: PropTypes.bool.isRequired,
    }).isRequired,
    isHeaderVisible: PropTypes.bool,
    enableCopyPasteUnits: PropTypes.bool,
    discussionEnabled: PropTypes.bool,
  }).isRequired,
  subsection: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    published: PropTypes.bool.isRequired,
    hasChanges: PropTypes.bool.isRequired,
    visibilityState: PropTypes.string.isRequired,
    shouldScroll: PropTypes.bool,
    isTimeLimited: PropTypes.bool,
    graded: PropTypes.bool,
  }).isRequired,
  section: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    published: PropTypes.bool.isRequired,
    hasChanges: PropTypes.bool.isRequired,
    visibilityState: PropTypes.string.isRequired,
    shouldScroll: PropTypes.bool,
  }).isRequired,
  onOpenPublishModal: PropTypes.func.isRequired,
  onOpenConfigureModal: PropTypes.func.isRequired,
  onEditSubmit: PropTypes.func.isRequired,
  savingStatus: PropTypes.string.isRequired,
  onOpenDeleteModal: PropTypes.func.isRequired,
  onDuplicateSubmit: PropTypes.func.isRequired,
  getTitleLink: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  canMoveItem: PropTypes.func.isRequired,
  onOrderChange: PropTypes.func.isRequired,
  isSelfPaced: PropTypes.bool.isRequired,
  isCustomRelativeDatesActive: PropTypes.bool.isRequired,
  onCopyToClipboardClick: PropTypes.func.isRequired,
  discussionsSettings: PropTypes.shape({
    providerType: PropTypes.string,
    enableGradedUnits: PropTypes.bool,
  }),
  tagsCount: PropTypes.number,
};

export default UnitCard;
