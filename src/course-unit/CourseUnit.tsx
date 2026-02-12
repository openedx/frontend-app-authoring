import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import type { MessageDescriptor } from 'react-intl';
import {
  Alert,
  Container,
  Button,
  TransitionReplace,
  Stack,
  Badge,
  Icon,
  OverlayTrigger,
  Tooltip,
} from '@openedx/paragon';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Lock,
  AccessTimeFilled,
  Groups,
  QuestionAnswer,
} from '@openedx/paragon/icons';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import DraftIcon from '@src/generic/DraftIcon';
import { CourseAuthoringUnitSidebarSlot } from '../plugin-slots/CourseAuthoringUnitSidebarSlot';

import { getProcessingNotification } from '../generic/processing-notification/data/selectors';
import SubHeader from '../generic/sub-header/SubHeader';
import { RequestStatus } from '../data/constants';
import getPageHeadTitle from '../generic/utils';
import AlertMessage from '../generic/alert-message';
import { PasteComponent } from '../generic/clipboard';
import ProcessingNotification from '../generic/processing-notification';
import { SavingErrorAlert } from '../generic/saving-error-alert';
import ConnectionErrorAlert from '../generic/ConnectionErrorAlert';
import Loading from '../generic/Loading';
import AddComponent from './add-component/AddComponent';
import HeaderTitle from './header-title/HeaderTitle';
import Breadcrumbs from './breadcrumbs/Breadcrumbs';
import Sequence from './course-sequence';
import { useCourseUnit, useHandleCreateNewCourseXBlock, useScrollToLastPosition } from './hooks';
import messages from './messages';
import { PasteNotificationAlert } from './clipboard';
import XBlockContainerIframe from './xblock-container-iframe';
import MoveModal from './move-modal';
import IframePreviewLibraryXBlockChanges from './preview-changes';
import CourseUnitHeaderActionsSlot from '../plugin-slots/CourseUnitHeaderActionsSlot';
import { UnitSidebarProvider } from './unit-sidebar/UnitSidebarContext';
import { UnitSidebarPagesProvider } from './unit-sidebar/UnitSidebarPagesContext';
import { UNIT_VISIBILITY_STATES } from './constants';
import { isUnitPageNewDesignEnabled } from './utils';

const StatusBar = ({ courseUnit }: { courseUnit: any }) => {
  const { selectedPartitionIndex, selectedGroupsLabel } = courseUnit.userPartitionInfo ?? {};
  const hasGroups = selectedPartitionIndex !== -1 && !Number.isNaN(selectedPartitionIndex) && selectedGroupsLabel;
  let groupsCount = 0;
  if (hasGroups) {
    groupsCount = selectedGroupsLabel.split(',').length;
  }

  let visibilityChipData = {
    variant: 'warning',
    className: 'draft-badge',
    text: messages.statusBarDraftNeverPublished,
    icon: DraftIcon,
  } as {
    variant: string,
    className?: string,
    text: MessageDescriptor,
    icon: React.ComponentType,
  };

  if (courseUnit.currentlyVisibleToStudents) {
    visibilityChipData = {
      variant: 'success',
      text: messages.statusBarLiveBadge,
      icon: CheckCircleIcon,
    };
  } else if (courseUnit.visibilityState === UNIT_VISIBILITY_STATES.staffOnly) {
    visibilityChipData = {
      variant: 'secondary',
      text: messages.statusBarStaffOnly,
      icon: Lock,
    };
  } else if (courseUnit.published) {
    visibilityChipData = {
      variant: 'info',
      text: messages.statusBarScheduledBadge,
      icon: AccessTimeFilled,
    };
  }

  return (
    <Stack direction="horizontal" gap={3}>
      <Badge
        variant={visibilityChipData.variant}
        className={`px-3 py-2 ${visibilityChipData.className || ''}`}
      >
        <Stack direction="horizontal" gap={2}>
          <Icon size="xs" src={visibilityChipData.icon} />
          <span className="badge-label">
            <FormattedMessage {...visibilityChipData.text} />
          </span>
        </Stack>
      </Badge>
      {courseUnit.published && courseUnit.hasChanges && (
        <Badge
          variant="warning"
          className="px-3 py-2 draft-badge"
        >
          <Stack direction="horizontal" gap={1}>
            <Icon size="xs" src={DraftIcon} />
            <span className="badge-label">
              <FormattedMessage {...messages.statusBarDraftChangesBadge} />
            </span>
          </Stack>
        </Badge>
      )}
      {groupsCount === 1 && (
        <Stack direction="horizontal" gap={1}>
          <Icon src={Groups} />
          <span>
            <FormattedMessage
              {...messages.statusBarGroupAccessOneGroup}
              values={{
                groupName: selectedGroupsLabel,
              }}
            />
          </span>
        </Stack>
      )}
      {groupsCount > 1 && (
        <OverlayTrigger
          placement="top"
          overlay={(
            <Tooltip id="unit-group-access-tooltip">
              {selectedGroupsLabel}
            </Tooltip>
          )}
        >
          <Stack direction="horizontal" gap={1}>
            <Icon src={Groups} />
            <span>
              <FormattedMessage
                {...messages.statusBarGroupAccessMultipleGroup}
                values={{
                  groupsCount,
                }}
              />
            </span>
          </Stack>
        </OverlayTrigger>
      )}
      {courseUnit.discussionEnabled && (
        <Stack direction="horizontal" gap={1}>
          <Icon src={QuestionAnswer} />
          <FormattedMessage {...messages.statusBarDiscussionsEnabled} />
        </Stack>
      )}
    </Stack>
  );
};

const CourseUnit = () => {
  const intl = useIntl();
  const { blockId } = useParams();
  const { courseId } = useCourseAuthoringContext();

  if (courseId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing courseId.');
  }

  if (blockId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    throw new Error('Error: route is missing blockId.');
  }

  const {
    courseUnit,
    isLoading,
    sequenceId,
    unitTitle,
    unitCategory,
    errorMessage,
    sequenceStatus,
    savingStatus,
    isTitleEditFormOpen,
    isUnitVerticalType,
    isUnitLegacyLibraryType,
    isSplitTestType,
    isProblemBankType,
    staticFileNotices,
    currentlyVisibleToStudents,
    unitXBlockActions,
    sharedClipboardData,
    showPasteXBlock,
    showPasteUnit,
    handleTitleEditSubmit,
    headerNavigationsActions,
    handleTitleEdit,
    handleConfigureSubmit,
    courseVerticalChildren,
    canPasteComponent,
    isMoveModalOpen,
    openMoveModal,
    closeMoveModal,
    movedXBlockParams,
    handleRollbackMovedXBlock,
    handleCloseXBlockMovedAlert,
    handleNavigateToTargetUnit,
    addComponentTemplateData,
  } = useCourseUnit({ courseId, blockId });

  const handleCreateNewCourseXBlock = useHandleCreateNewCourseXBlock({ blockId });

  const readOnly = !!courseUnit.readOnly;

  useEffect(() => {
    document.title = getPageHeadTitle('', unitTitle);
  }, [unitTitle]);

  useScrollToLastPosition();

  const {
    isShow: isShowProcessingNotification,
    title: processingNotificationTitle,
  } = useSelector(getProcessingNotification);

  if (isLoading) {
    return <Loading />;
  }

  if (sequenceStatus === RequestStatus.FAILED) {
    return (
      <Container size="xl" className="course-unit px-4 mt-4">
        <ConnectionErrorAlert />
      </Container>
    );
  }

  return (
    <UnitSidebarProvider readOnly={readOnly}>
      <UnitSidebarPagesProvider>
        <Container fluid className="course-unit px-4">
          <section className="course-unit-container mb-4 mt-5">
            <TransitionReplace>
              {movedXBlockParams.isSuccess ? (
                <AlertMessage
                  key="xblock-moved-alert"
                  data-testid="xblock-moved-alert"
                  show={movedXBlockParams.isSuccess}
                  variant="success"
                  icon={CheckCircleIcon}
                  title={movedXBlockParams.isUndo
                    ? intl.formatMessage(messages.alertMoveCancelTitle)
                    : intl.formatMessage(messages.alertMoveSuccessTitle)}
                  description={movedXBlockParams.isUndo
                    ? intl.formatMessage(messages.alertMoveCancelDescription, { title: movedXBlockParams.title })
                    : intl.formatMessage(messages.alertMoveSuccessDescription, { title: movedXBlockParams.title })}
                  aria-hidden={movedXBlockParams.isSuccess}
                  dismissible
                  actions={movedXBlockParams.isUndo ? undefined : [
                    <Button
                      onClick={handleRollbackMovedXBlock}
                      key="xblock-moved-alert-undo-move-button"
                    >
                      {intl.formatMessage(messages.undoMoveButton)}
                    </Button>,
                    <Button
                      onClick={handleNavigateToTargetUnit}
                      key="xblock-moved-alert-new-location-button"
                    >
                      {intl.formatMessage(messages.newLocationButton)}
                    </Button>,
                  ]}
                  onClose={handleCloseXBlockMovedAlert}
                />
              ) : null}
            </TransitionReplace>
            {courseUnit.upstreamInfo?.upstreamLink && (
              <AlertMessage
                title={intl.formatMessage(
                  messages.alertLibraryUnitReadOnlyText,
                  {
                    link: (
                      <Alert.Link
                        href={courseUnit.upstreamInfo.upstreamLink}
                      >
                        {intl.formatMessage(messages.alertLibraryUnitReadOnlyLinkText)}
                      </Alert.Link>
                    ),
                  },
                )}
                variant="info"
              />
            )}
            <SubHeader
              hideBorder
              title={(
                <HeaderTitle
                  unitTitle={unitTitle}
                  isTitleEditFormOpen={isTitleEditFormOpen}
                  handleTitleEdit={handleTitleEdit}
                  handleTitleEditSubmit={handleTitleEditSubmit}
                  handleConfigureSubmit={handleConfigureSubmit}
                />
              )}
              breadcrumbs={(
                <Breadcrumbs
                  courseId={courseId}
                  parentUnitId={sequenceId}
                />
              )}
              headerActions={(
                <CourseUnitHeaderActionsSlot
                  category={unitCategory}
                  headerNavigationsActions={headerNavigationsActions}
                  unitTitle={unitTitle}
                  verticalBlocks={courseVerticalChildren.children}
                />
              )}
            />
            <div className="unit-header-status-bar h5 mt-2 mb-4 font-weight-normal">
              {isUnitPageNewDesignEnabled() && isUnitVerticalType && (
                <StatusBar courseUnit={courseUnit} />
              )}
            </div>
            {isUnitVerticalType && (
              <Sequence
                courseId={courseId}
                sequenceId={sequenceId}
                unitId={blockId}
                handleCreateNewCourseXBlock={handleCreateNewCourseXBlock}
                showPasteUnit={showPasteUnit}
              />
            )}
            <div className="d-flex align-items-baseline">
              <div className="flex-fill">
                {currentlyVisibleToStudents && (
                  <AlertMessage
                    className="course-unit__alert"
                    title={intl.formatMessage(messages.alertUnpublishedVersion)}
                    variant="warning"
                    icon={WarningIcon}
                  />
                )}
                {staticFileNotices && (
                  <PasteNotificationAlert
                    staticFileNotices={staticFileNotices}
                    courseId={courseId}
                  />
                )}
                {blockId && (
                  <XBlockContainerIframe
                    courseId={courseId}
                    blockId={blockId}
                    isUnitVerticalType={isUnitVerticalType}
                    unitXBlockActions={unitXBlockActions}
                    courseVerticalChildren={courseVerticalChildren.children}
                    handleConfigureSubmit={handleConfigureSubmit}
                  />
                )}
                {!readOnly && showPasteXBlock && canPasteComponent && isUnitVerticalType && sharedClipboardData
                  && /* istanbul ignore next */ (
                    <PasteComponent
                      clipboardData={sharedClipboardData}
                      onClick={
                        /* istanbul ignore next */
                        () => handleCreateNewCourseXBlock({ stagedContent: 'clipboard', parentLocator: blockId })
                      }
                      text={intl.formatMessage(messages.pasteButtonText)}
                    />
                  )}
                {!readOnly && blockId && (
                  <AddComponent
                    parentLocator={blockId}
                    isSplitTestType={isSplitTestType}
                    isUnitVerticalType={isUnitVerticalType}
                    isProblemBankType={isProblemBankType}
                    handleCreateNewCourseXBlock={handleCreateNewCourseXBlock}
                    addComponentTemplateData={addComponentTemplateData}
                  />
                )}
                <MoveModal
                  isOpenModal={isMoveModalOpen}
                  openModal={openMoveModal}
                  closeModal={closeMoveModal}
                  courseId={courseId}
                />
                <IframePreviewLibraryXBlockChanges />
              </div>
              {!isUnitLegacyLibraryType && (
                <CourseAuthoringUnitSidebarSlot
                  courseId={courseId}
                  blockId={blockId}
                  unitTitle={unitTitle}
                  xBlocks={courseVerticalChildren.children}
                  readOnly={readOnly}
                  isUnitVerticalType={isUnitVerticalType}
                  isSplitTestType={isSplitTestType}
                />
              )}
            </div>
          </section>
        </Container>
        <div className="alert-toast">
          <ProcessingNotification
            isShow={isShowProcessingNotification}
            title={processingNotificationTitle}
          />
          <SavingErrorAlert
            savingStatus={savingStatus}
            errorMessage={errorMessage}
          />
        </div>
      </UnitSidebarPagesProvider>
    </UnitSidebarProvider>
  );
};

export default CourseUnit;
