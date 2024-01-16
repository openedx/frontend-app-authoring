import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useToggle } from '@edx/paragon';

import { setCurrentItem, setCurrentSection, setCurrentSubsection } from '../data/slice';
import { RequestStatus } from '../../data/constants';
import CardHeader from '../card-header/CardHeader';
import BaseTitleWithStatusBadge from '../card-header/BaseTitleWithStatusBadge';
import ConditionalSortableElement from '../drag-helper/ConditionalSortableElement';
import TitleLink from '../card-header/TitleLink';
import { getItemStatus, getItemStatusBorder, scrollToElement } from '../utils';

const UnitCard = ({
  unit,
  subsection,
  section,
  index,
  canMoveItem,
  onOpenPublishModal,
  onEditSubmit,
  savingStatus,
  onOpenDeleteModal,
  onDuplicateSubmit,
  getTitleLink,
  onOrderChange,
}) => {
  const currentRef = useRef(null);
  const dispatch = useDispatch();
  const [isFormOpen, openForm, closeForm] = useToggle(false);
  const namePrefix = 'unit';

  const {
    id,
    displayName,
    hasChanges,
    published,
    visibilityState,
    actions: unitActions,
    isHeaderVisible = true,
  } = unit;

  // re-create actions object for customizations
  const actions = { ...unitActions };
  // add actions to control display of move up & down menu buton.
  actions.allowMoveUp = canMoveItem(index, -1);
  actions.allowMoveDown = canMoveItem(index, 1);

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

  const titleComponent = (
    <TitleLink
      titleLink={getTitleLink(id)}
      namePrefix={namePrefix}
    >
      <BaseTitleWithStatusBadge
        title={displayName}
        status={unitStatus}
        namePrefix={namePrefix}
      />
    </TitleLink>
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
        />
      </div>
    </ConditionalSortableElement>
  );
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
  }).isRequired,
  subsection: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    published: PropTypes.bool.isRequired,
    hasChanges: PropTypes.bool.isRequired,
    visibilityState: PropTypes.string.isRequired,
    shouldScroll: PropTypes.bool,
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
  onEditSubmit: PropTypes.func.isRequired,
  savingStatus: PropTypes.string.isRequired,
  onOpenDeleteModal: PropTypes.func.isRequired,
  onDuplicateSubmit: PropTypes.func.isRequired,
  getTitleLink: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  canMoveItem: PropTypes.func.isRequired,
  onOrderChange: PropTypes.func.isRequired,
};

export default UnitCard;
