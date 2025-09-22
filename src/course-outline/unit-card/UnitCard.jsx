// @ts-check
import { useToggle } from '@openedx/paragon';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useIntl } from '@edx/frontend-platform/i18n';
import { File05 } from '@untitledui/icons';
import Badge from '../../shared/Components/Common/Badge';
import { isUnitReadOnly } from '../../course-unit/data/utils';
import { PreviewLibraryXBlockChanges } from '../../course-unit/preview-changes';
import { RequestStatus } from '../../data/constants';
import { useClipboard } from '../../generic/clipboard';
import CourseOutlineUnitCardExtraActionsSlot from '../../plugin-slots/CourseOutlineUnitCardExtraActionsSlot';
import CardHeaderWithDropdownOnly from '../card-header/CardHeaderWithDropdownOnly';
import messages from '../card-header/messages';
import TitleLink from '../card-header/TitleLink';
import { setCurrentItem, setCurrentSection, setCurrentSubsection } from '../data/slice';
import { fetchCourseSectionQuery } from '../data/thunk';
import SortableItem from '../drag-helper/SortableItem';
import { getItemStatus, getItemStatusBadgeContent, scrollToElement } from '../utils';

const UnitCard = ({
  unit,
  subsection,
  section,
  index,
  isLastUnit,
  getPossibleMoves,
  onOpenPublishModal,
  onOpenConfigureModal,
  onEditSubmit,
  savingStatus,
  onOpenDeleteModal,
  onDuplicateSubmit,
  getTitleLink,
  onOrderChange,
  discussionsSettings,
}) => {
  const currentRef = useRef(null);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const locatorId = searchParams.get('show');
  const isScrolledToElement = locatorId === unit.id;
  const [isFormOpen, openForm, closeForm] = useToggle(false);
  const [isSyncModalOpen, openSyncModal, closeSyncModal] = useToggle(false);
  const namePrefix = 'unit';

  const { copyToClipboard } = useClipboard();
  const navigate = useNavigate();
  const {
    id,
    category,
    displayName,
    hasChanges,
    published,
    visibilityState,
    actions: unitActions,
    isHeaderVisible = true,
    enableCopyPasteUnits = false,
    discussionEnabled,
    upstreamInfo,
  } = unit;

  const blockSyncData = useMemo(() => {
    if (!upstreamInfo.readyToSync) {
      return undefined;
    }
    return {
      displayName,
      downstreamBlockId: id,
      upstreamBlockId: upstreamInfo.upstreamRef,
      upstreamBlockVersionSynced: upstreamInfo.versionSynced,
      isVertical: true,
    };
    // OpenEdx implementation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upstreamInfo]);

  const readOnly = isUnitReadOnly(unit);

  // re-create actions object for customizations
  const actions = { ...unitActions };
  // add actions to control display of move up & down menu buton.
  const moveUpDetails = getPossibleMoves(index, -1);
  const moveDownDetails = getPossibleMoves(index, 1);
  actions.allowMoveUp = !isEmpty(moveUpDetails);
  actions.allowMoveDown = !isEmpty(moveDownDetails);

  const parentInfo = {
    graded: subsection.graded,
    isTimeLimited: subsection.isTimeLimited,
  };

  const unitStatus = getItemStatus({
    published,
    visibilityState,
    hasChanges,
  });

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
    onOrderChange(section, moveUpDetails);
  };

  const handleUnitMoveDown = () => {
    onOrderChange(section, moveDownDetails);
  };

  const handleCopyClick = () => {
    copyToClipboard(id);
  };

  const handleOnPostChangeSync = useCallback(async () => {
    await dispatch(fetchCourseSectionQuery([section.id]));
  }, [dispatch, section]);

  const titleComponent = (
    <TitleLink title={displayName} titleLink={getTitleLink(id)} namePrefix={namePrefix} />
  );

  const extraActionsComponent = (
    <CourseOutlineUnitCardExtraActionsSlot unit={unit} subsection={subsection} section={section} />
  );

  useEffect(() => {
    // if this items has been newly added, scroll to it.
    // we need to check section.shouldScroll as whole section is fetched when a
    // unit is duplicated under it.
    if (currentRef.current && (section.shouldScroll || unit.shouldScroll || isScrolledToElement)) {
      // Align element closer to the top of the screen if scrolling for search result
      const alignWithTop = !!isScrolledToElement;
      scrollToElement(currentRef.current, alignWithTop);
    }
    // OpenEdx implementation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScrolledToElement]);

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      closeForm();
    }
    // OpenEdx implementation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savingStatus]);

  const intl = useIntl();
  const { badgeTitle } = getItemStatusBadgeContent(unitStatus, messages, intl);

  // Map unitStatus to Badge variant
  const getBadgeVariant = (status) => {
    switch (status) {
      case 'live':
        return 'success';
      case 'draft':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (!isHeaderVisible) {
    return null;
  }

  return (
    <>
      <SortableItem
        id={id}
        category={category}
        key={id}
        isDraggable
        isDroppable={actions.childAddable}
        componentStyle={{
          marginBottom: isLastUnit ? '0px' : '24px',
        }}
      >
        <div className="tw-flex tw-gap-2 tw-items-center" ref={currentRef}>
          <div className="tw-flex-1">
            <button
              onClick={() => navigate(getTitleLink(id))}
              type="button"
              className="tw-flex tw-items-center tw-gap-2 tw-border-0 tw-bg-transparent tw-w-fit tw-px-0"
            >
              <div className="tw-flex tw-items-center tw-justify-center tw-size-6">
                <File05 className="tw-text-violet-500 tw-size-4" />
              </div>
              <div className="tw-text-sm tw-font-semibold tw-text-gray-700">{displayName}</div>
            </button>
          </div>
          <div className="tw-flex tw-gap-2 tw-items-center">
            <Badge variant={getBadgeVariant(unitStatus)}>{badgeTitle}</Badge>
            <CardHeaderWithDropdownOnly
              title={displayName}
              status={unitStatus}
              hasChanges={hasChanges}
              cardId={id}
              onClickMenuButton={handleClickMenuButton}
              onClickPublish={onOpenPublishModal}
              onClickConfigure={onOpenConfigureModal}
              onClickEdit={openForm}
              onClickDelete={onOpenDeleteModal}
              onClickMoveUp={handleUnitMoveUp}
              onClickMoveDown={handleUnitMoveDown}
              onClickSync={openSyncModal}
              isFormOpen={isFormOpen}
              closeForm={closeForm}
              onEditSubmit={handleEditSubmit}
              isDisabledEditField={readOnly || savingStatus === RequestStatus.IN_PROGRESS}
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
              extraActionsComponent={extraActionsComponent}
              readyToSync={upstreamInfo.readyToSync}
            />
          </div>
        </div>
      </SortableItem>
      {blockSyncData && (
        <PreviewLibraryXBlockChanges
          blockData={blockSyncData}
          isModalOpen={isSyncModalOpen}
          closeModal={closeSyncModal}
          postChange={handleOnPostChangeSync}
        />
      )}
    </>
  );
};

UnitCard.defaultProps = {
  discussionsSettings: {},
};

UnitCard.propTypes = {
  unit: PropTypes.shape({
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
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
    upstreamInfo: PropTypes.shape({
      readyToSync: PropTypes.bool.isRequired,
      upstreamRef: PropTypes.string.isRequired,
      versionSynced: PropTypes.number.isRequired,
    }).isRequired,
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
  isLastUnit: PropTypes.bool.isRequired,
  getPossibleMoves: PropTypes.func.isRequired,
  onOrderChange: PropTypes.func.isRequired,
  discussionsSettings: PropTypes.shape({
    providerType: PropTypes.string,
    enableGradedUnits: PropTypes.bool,
  }),
};

export default UnitCard;
