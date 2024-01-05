import { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, useToggle } from '@edx/paragon';
import { Add as IconAdd } from '@edx/paragon/icons';
import classNames from 'classnames';

import { setCurrentItem, setCurrentSection, setCurrentSubsection } from '../data/slice';
import { RequestStatus } from '../../data/constants';
import CardHeader from '../card-header/CardHeader';
import BaseTitleWithStatusBadge from '../card-header/BaseTitleWithStatusBadge';
import ConditionalSortableElement from '../drag-helper/ConditionalSortableElement';
import TitleButton from '../card-header/TitleButton';
import { getItemStatus, getItemStatusBorder, scrollToElement } from '../utils';
import messages from './messages';

const SubsectionCard = ({
  section,
  subsection,
  children,
  index,
  canMoveItem,
  onOpenPublishModal,
  onEditSubmit,
  savingStatus,
  onOpenDeleteModal,
  onDuplicateSubmit,
  onNewUnitSubmit,
  onOrderChange,
  onOpenConfigureModal,
}) => {
  const currentRef = useRef(null);
  const intl = useIntl();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const locatorId = searchParams.get('show');
  const isScrolledToElement = locatorId === subsection.id;
  const [isFormOpen, openForm, closeForm] = useToggle(false);
  const namePrefix = 'subsection';

  const {
    id,
    displayName,
    hasChanges,
    published,
    visibilityState,
    actions: subsectionActions,
    isHeaderVisible = true,
  } = subsection;

  // re-create actions object for customizations
  const actions = { ...subsectionActions };
  // add actions to control display of move up & down menu buton.
  actions.allowMoveUp = canMoveItem(index, -1);
  actions.allowMoveDown = canMoveItem(index, 1);

  const [isExpanded, setIsExpanded] = useState(locatorId ? isScrolledToElement : !isHeaderVisible);
  const subsectionStatus = getItemStatus({
    published,
    visibilityState,
    hasChanges,
  });
  const borderStyle = getItemStatusBorder(subsectionStatus);

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

  const handleSubsectionMoveUp = () => {
    onOrderChange(index, index - 1);
  };

  const handleSubsectionMoveDown = () => {
    onOrderChange(index, index + 1);
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

  const isDraggable = (
    actions.draggable
      && (actions.allowMoveUp || actions.allowMoveDown)
      && !(isHeaderVisible === false)
  );

  return (
    <ConditionalSortableElement
      id={id}
      key={id}
      draggable={isDraggable}
      componentStyle={{
        background: '#f8f7f6',
        ...borderStyle,
      }}
    >
      <div className="subsection-card" data-testid="subsection-card" ref={currentRef} data-locator={subsection.id}>
        {isHeaderVisible && (
          <CardHeader
            title={displayName}
            status={subsectionStatus}
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
          />
        )}
        {isExpanded && (
          <div
            data-testid="subsection-card__units"
            className={classNames('subsection-card__units', { 'item-children': isDraggable })}
          >
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
    </ConditionalSortableElement>
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
    visibilityState: PropTypes.string.isRequired,
    shouldScroll: PropTypes.bool,
  }).isRequired,
  subsection: PropTypes.shape({
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
  children: PropTypes.node,
  onOpenPublishModal: PropTypes.func.isRequired,
  onEditSubmit: PropTypes.func.isRequired,
  savingStatus: PropTypes.string.isRequired,
  onOpenDeleteModal: PropTypes.func.isRequired,
  onDuplicateSubmit: PropTypes.func.isRequired,
  onNewUnitSubmit: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  canMoveItem: PropTypes.func.isRequired,
  onOrderChange: PropTypes.func.isRequired,
  onOpenConfigureModal: PropTypes.func.isRequired,
};

export default SubsectionCard;
