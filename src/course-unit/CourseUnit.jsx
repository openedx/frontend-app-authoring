import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  Container, Layout, Stack, Button, TransitionReplace,
} from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { useIntl, injectIntl } from '@edx/frontend-platform/i18n';
import { DraggableList, ErrorAlert } from '@edx/frontend-lib-content-components';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@openedx/paragon/icons';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { getProcessingNotification } from '../generic/processing-notification/data/selectors';
import SubHeader from '../generic/sub-header/SubHeader';
import { RequestStatus } from '../data/constants';
import getPageHeadTitle from '../generic/utils';
import AlertMessage from '../generic/alert-message';
import { PasteComponent } from '../generic/clipboard';
import ProcessingNotification from '../generic/processing-notification';
import InternetConnectionAlert from '../generic/internet-connection-alert';
import ConnectionErrorAlert from '../generic/ConnectionErrorAlert';
import Loading from '../generic/Loading';
import AddComponent from './add-component/AddComponent';
import CourseXBlock from './course-xblock/CourseXBlock';
import HeaderTitle from './header-title/HeaderTitle';
import Breadcrumbs from './breadcrumbs/Breadcrumbs';
import HeaderNavigations from './header-navigations/HeaderNavigations';
import Sequence from './course-sequence';
import Sidebar from './sidebar';
import { useCourseUnit } from './hooks';
import messages from './messages';
import PublishControls from './sidebar/PublishControls';
import LocationInfo from './sidebar/LocationInfo';
import TagsSidebarControls from '../content-tags-drawer/tags-sidebar-controls';
import { PasteNotificationAlert } from './clipboard';

const CourseUnit = ({ courseId }) => {
  const { blockId } = useParams();
  const intl = useIntl();
  const {
    isLoading,
    sequenceId,
    unitTitle,
    isQueryPending,
    sequenceStatus,
    savingStatus,
    isTitleEditFormOpen,
    isErrorAlert,
    staticFileNotices,
    currentlyVisibleToStudents,
    isInternetConnectionAlertFailed,
    unitXBlockActions,
    sharedClipboardData,
    showPasteXBlock,
    showPasteUnit,
    handleTitleEditSubmit,
    headerNavigationsActions,
    handleTitleEdit,
    handleInternetConnectionFailed,
    handleCreateNewCourseXBlock,
    handleConfigureSubmit,
    courseVerticalChildren,
    handleXBlockDragAndDrop,
    canPasteComponent,
    movedXBlockParams,
    handleRollbackMovedXBlock,
    handleCloseXBlockMovedAlert,
    handleNavigateToTargetUnit,
  } = useCourseUnit({ courseId, blockId });

  const initialXBlocksData = useMemo(() => courseVerticalChildren.children ?? [], [courseVerticalChildren.children]);
  const [unitXBlocks, setUnitXBlocks] = useState(initialXBlocksData);

  useEffect(() => {
    document.title = getPageHeadTitle('', unitTitle);
  }, [unitTitle]);

  useEffect(() => {
    setUnitXBlocks(courseVerticalChildren.children);
  }, [courseVerticalChildren.children]);

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

  const finalizeXBlockOrder = () => (newXBlocks) => {
    handleXBlockDragAndDrop(newXBlocks.map(xBlock => xBlock.id), () => {
      setUnitXBlocks(initialXBlocksData);
    });
  };

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
                  <Button onClick={handleRollbackMovedXBlock}>
                    {intl.formatMessage(messages.undoMoveButton)}
                  </Button>,
                  <Button onClick={handleNavigateToTargetUnit}>
                    {intl.formatMessage(messages.newLocationButton)}
                  </Button>,
                ]}
                onClose={handleCloseXBlockMovedAlert}
              />
            ) : null}
          </TransitionReplace>
          <ErrorAlert hideHeading isError={savingStatus === RequestStatus.FAILED && isErrorAlert}>
            {intl.formatMessage(messages.alertFailedGeneric, { actionName: 'save', type: 'changes' })}
          </ErrorAlert>
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
              <Breadcrumbs />
            )}
            headerActions={(
              <HeaderNavigations
                headerNavigationsActions={headerNavigationsActions}
              />
            )}
          />
          <Sequence
            courseId={courseId}
            sequenceId={sequenceId}
            unitId={blockId}
            handleCreateNewCourseXBlock={handleCreateNewCourseXBlock}
            showPasteUnit={showPasteUnit}
          />
          <Layout
            lg={[{ span: 8 }, { span: 4 }]}
            md={[{ span: 8 }, { span: 4 }]}
            sm={[{ span: 8 }, { span: 3 }]}
            xs={[{ span: 9 }, { span: 3 }]}
            xl={[{ span: 9 }, { span: 3 }]}
          >
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
              <Stack className="mb-4 course-unit__xblocks">
                <DraggableList
                  itemList={unitXBlocks}
                  setState={setUnitXBlocks}
                  updateOrder={finalizeXBlockOrder}
                >
                  <SortableContext
                    id="root"
                    items={unitXBlocks}
                    strategy={verticalListSortingStrategy}
                  >
                    {unitXBlocks.map(({
                      name, id, blockType: type, shouldScroll, userPartitionInfo, validationMessages,
                    }) => (
                      <CourseXBlock
                        id={id}
                        key={id}
                        title={name}
                        type={type}
                        blockId={blockId}
                        validationMessages={validationMessages}
                        shouldScroll={shouldScroll}
                        handleConfigureSubmit={handleConfigureSubmit}
                        unitXBlockActions={unitXBlockActions}
                        data-testid="course-xblock"
                        userPartitionInfo={userPartitionInfo}
                      />
                    ))}
                  </SortableContext>
                </DraggableList>
              </Stack>
              <AddComponent
                blockId={blockId}
                handleCreateNewCourseXBlock={handleCreateNewCourseXBlock}
              />
              {showPasteXBlock && canPasteComponent && (
                <PasteComponent
                  clipboardData={sharedClipboardData}
                  onClick={handleCreateNewCourseXBlock}
                  text={intl.formatMessage(messages.pasteButtonText)}
                />
              )}
            </Layout.Element>
            <Layout.Element>
              <Stack gap={3}>
                <Sidebar data-testid="course-unit-sidebar">
                  <PublishControls blockId={blockId} />
                </Sidebar>
                {getConfig().ENABLE_TAGGING_TAXONOMY_PAGES === 'true'
                && (
                  <Sidebar className="tags-sidebar">
                    <TagsSidebarControls />
                  </Sidebar>
                )}
                <Sidebar data-testid="course-unit-location-sidebar">
                  <LocationInfo />
                </Sidebar>
              </Stack>
            </Layout.Element>
          </Layout>
        </section>
      </Container>
      <div className="alert-toast">
        <ProcessingNotification
          isShow={isShowProcessingNotification}
          title={processingNotificationTitle}
        />
        {isQueryPending && (
          <InternetConnectionAlert
            isFailed={isInternetConnectionAlertFailed}
            isQueryPending={savingStatus === RequestStatus.PENDING}
            onInternetConnectionFailed={handleInternetConnectionFailed}
          />
        )}
      </div>
    </>
  );
};

CourseUnit.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(CourseUnit);
