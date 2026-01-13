import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  Alert, Container, Button, TransitionReplace,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@openedx/paragon/icons';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
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
import { useCourseUnit, useScrollToLastPosition } from './hooks';
import messages from './messages';
import { PasteNotificationAlert } from './clipboard';
import XBlockContainerIframe from './xblock-container-iframe';
import MoveModal from './move-modal';
import IframePreviewLibraryXBlockChanges from './preview-changes';
import CourseUnitHeaderActionsSlot from '../plugin-slots/CourseUnitHeaderActionsSlot';
import { UnitSidebarProvider } from './unit-sidebar/UnitSidebarContext';

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
    handleCreateNewCourseXBlock,
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
    <UnitSidebarProvider title={unitTitle} childrenBlocks={courseVerticalChildren.children}>
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
              <XBlockContainerIframe
                courseId={courseId}
                blockId={blockId}
                isUnitVerticalType={isUnitVerticalType}
                unitXBlockActions={unitXBlockActions}
                courseVerticalChildren={courseVerticalChildren.children}
                handleConfigureSubmit={handleConfigureSubmit}
              />
              {!readOnly && (
                <AddComponent
                  parentLocator={blockId}
                  isSplitTestType={isSplitTestType}
                  isUnitVerticalType={isUnitVerticalType}
                  isProblemBankType={isProblemBankType}
                  handleCreateNewCourseXBlock={handleCreateNewCourseXBlock}
                  // @ts-expect-error - It is necessary to migrate the hooks to TypeScript
                  addComponentTemplateData={addComponentTemplateData}
                />
              )}
              {!readOnly && showPasteXBlock && canPasteComponent && isUnitVerticalType && sharedClipboardData && (
                <PasteComponent
                  clipboardData={sharedClipboardData}
                  onClick={
                    () => handleCreateNewCourseXBlock({ stagedContent: 'clipboard', parentLocator: blockId })
                  }
                  text={intl.formatMessage(messages.pasteButtonText)}
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
    </UnitSidebarProvider>
  );
};

export default CourseUnit;
