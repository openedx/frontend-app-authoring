import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  Alert, Container, Layout, Button, TransitionReplace,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@openedx/paragon/icons';
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
import { useCourseUnit, useLayoutGrid, useScrollToLastPosition } from './hooks';
import messages from './messages';
import { PasteNotificationAlert } from './clipboard';
import XBlockContainerIframe from './xblock-container-iframe';
import MoveModal from './move-modal';
import IframePreviewLibraryXBlockChanges from './preview-changes';
import CourseUnitHeaderActionsSlot from '../plugin-slots/CourseUnitHeaderActionsSlot';

const CourseUnit = ({ courseId }) => {
  const { blockId } = useParams();
  const intl = useIntl();
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
    isUnitLibraryType,
    isSplitTestType,
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
  const layoutGrid = useLayoutGrid(unitCategory, isUnitLibraryType);

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
    <>
      <Container size="xl" className="course-unit px-4">
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
                actions={movedXBlockParams.isUndo ? null : [
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
                      className="ml-1"
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
          <Layout {...layoutGrid}>
            <Layout.Element>
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
                  handleCreateNewCourseXBlock={handleCreateNewCourseXBlock}
                  addComponentTemplateData={addComponentTemplateData}
                />
              )}
              {!readOnly && showPasteXBlock && canPasteComponent && isUnitVerticalType && (
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
            </Layout.Element>
            <Layout.Element>
              <CourseAuthoringUnitSidebarSlot
                courseId={courseId}
                blockId={blockId}
                unitTitle={unitTitle}
                xBlocks={courseVerticalChildren.children}
                readOnly={readOnly}
                isUnitVerticalType={isUnitVerticalType}
                isSplitTestType={isSplitTestType}
              />
            </Layout.Element>
          </Layout>
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
    </>
  );
};

CourseUnit.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CourseUnit;
