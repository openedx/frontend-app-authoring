import { useState, useEffect, useCallback, useMemo } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Container,
  Row,
  TransitionReplace,
  Toast,
  Button,
  ActionRow,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { CheckCircle as CheckCircleIcon, CloseFullscreen, OpenInFull } from '@openedx/paragon/icons';

import { useLocation } from 'react-router-dom';
import { CourseAuthoringOutlineSidebarSlot } from '@src/plugin-slots/CourseAuthoringOutlineSidebarSlot';

import { LoadingSpinner } from '@src/generic/Loading';
import { RequestStatus } from '@src/data/constants';
import SubHeader from '@src/generic/sub-header/SubHeader';
import InternetConnectionAlert from '@src/generic/internet-connection-alert';


import AlertMessage from '@src/generic/alert-message';
import getPageHeadTitle from '@src/generic/utils';
import CourseOutlineHeaderActionsSlot from '@src/plugin-slots/CourseOutlineHeaderActionsSlot';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import LegacyLibContentBlockAlert from '@src/course-libraries/LegacyLibContentBlockAlert';
import { ContainerType } from '@src/generic/key-utils';
import {
  useCreateCourseBlock,
  usePasteItem,
  useSetVideoSharingOption,
  useDismissNotification,
  useRestartIndexingOnCourse,
} from '@src/course-outline/data/apiHooks';
import { useCourseOutlineContext } from './CourseOutlineContext';
import { COURSE_BLOCK_NAMES } from './constants';

import PageAlerts from './page-alerts/PageAlerts';

import type { CourseOutline as CourseOutlineData } from './data/types';
import OutlineTree from './OutlineTree';
import { useOutlineModals } from './state/useOutlineModals';

import messages from './messages';
import headerMessages from './header-navigations/messages';
import { getTagsExportFile } from './data/api';
import { StatusBar } from './status-bar/StatusBar';

const CourseOutline = () => {
  const intl = useIntl();
  const location = useLocation();
  const {
    courseId,
  } = useCourseAuthoringContext();
  const {
    courseUsageKey,
    sections,
    updateSectionOrderByIndex,
    updateSubsectionOrderByIndex,
    updateUnitOrderByIndex,
    previewSections,
    cancelReorderPreview,
    commitSectionReorder,
    commitSubsectionReorder,
    commitUnitReorder,
    dismissError,
    // Read directly from context instead of via hooks.jsx pass-through
    courseActions,
    savingStatus,
    statusBarData,
    isCustomRelativeDatesActive,
    isLoading,
    isLoadingDenied,
    courseName,
    errors,
    loadingStatus,
    outlineIndexData,
  } = useCourseOutlineContext();

  const {
    reindexLink,
    lmsLink,
    notificationDismissUrl,
    discussionsSettings,
    discussionsIncontextLearnmoreUrl,
    deprecatedBlocksInfo,
    proctoringErrors,
    mfeProctoredExamSettingsUrl,
    advanceSettingsUrl,
  } = (outlineIndexData || {}) as CourseOutlineData;

  const { reIndexLoadingStatus } = loadingStatus || {};

  const [isSectionsExpanded, setSectionsExpanded] = useState(true);
  const [isDisabledReindexButton, setDisableReindexButton] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const isInternetConnectionAlertFailed = savingStatus === RequestStatus.FAILED;
  const isReIndexShow = Boolean(reindexLink);

  // ─── Non-modal mutations & handlers ─────────────────────────────────────
  const handleAddBlock = useCreateCourseBlock(courseId);
  const pasteMutation = usePasteItem(courseId);
  const videoSharingMutation = useSetVideoSharingOption(courseId);
  const dismissNotificationMutation = useDismissNotification(courseId);
  const reindexMutation = useRestartIndexingOnCourse(courseId);

  const handlePasteClipboardClick = useCallback((parentLocator, subsectionId, sectionId) => {
    pasteMutation.mutate({ parentLocator, subsectionId, sectionId });
  }, [pasteMutation]);

  const handleVideoSharingOptionChange = useCallback((value) => {
    videoSharingMutation.mutate(value);
  }, [videoSharingMutation]);

  const handleDismissNotification = useCallback(async () => {
    if (notificationDismissUrl) {
      try {
        await dismissNotificationMutation.mutateAsync(notificationDismissUrl);
      } catch {
        // Error handled via mutation derived state
      }
    }
  }, [notificationDismissUrl, dismissNotificationMutation]);

  const headerNavigationsActions = useMemo(() => ({
    handleNewSection: async () => {
      await handleAddBlock.mutateAsync({
        type: ContainerType.Chapter,
        parentLocator: courseUsageKey,
        displayName: COURSE_BLOCK_NAMES.chapter.name,
      });
    },
    handleReIndex: async () => {
      setDisableReindexButton(true);
      setShowSuccessAlert(false);
      try {
        if (reindexLink) {
          try {
            await reindexMutation.mutateAsync(reindexLink);
          } catch {
            // Error handled via useCourseOutlineReindexStatus mutation state
          }
        }
      } finally {
        setDisableReindexButton(false);
      }
    },
    handleExpandAll: () => {
      setSectionsExpanded((prevState) => !prevState);
    },
    lmsLink,
  }), [handleAddBlock, courseUsageKey, reindexLink, reindexMutation, lmsLink]);

  // ─── Effects (previously in hooks.jsx) ───────────────────────────────────
  useEffect(() => {
    setShowSuccessAlert(reIndexLoadingStatus === RequestStatus.SUCCESSFUL);
  }, [reIndexLoadingStatus]);

  // ─── Modal hook ──────────────────────────────────────────────────────────
  const {
    openEnableHighlightsModal,
    handleOpenHighlightsModal,
    handleOpenConfigureModal,
    openDeleteModal,
    modals,
  } = useOutlineModals(courseId);

  // Use `setToastMessage` to show the toast.
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Wait for the course data to load before exporting tags.
    if (courseId && courseName && location.hash === '#export-tags') {
      setToastMessage(intl.formatMessage(messages.exportTagsCreatingToastMessage));
      getTagsExportFile(courseId, courseName).then(() => {
        setToastMessage(intl.formatMessage(messages.exportTagsSuccessToastMessage));
      }).catch(() => {
        setToastMessage(intl.formatMessage(messages.exportTagsErrorToastMessage));
      });

      // Delete `#export-tags` from location
      window.location.href = '#';
    }
  }, [location, courseId, courseName]);

  if (isLoading) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return (
      <Row className="m-0 mt-4 justify-content-center">
        <LoadingSpinner />
      </Row>
    );
  }

  if (isLoadingDenied) {
    return (
      <Container fluid className="px-3 mt-4">
        <PageAlerts
          courseId={courseId}
          notificationDismissUrl={notificationDismissUrl}
          handleDismissNotification={handleDismissNotification}
          discussionsSettings={discussionsSettings}
          discussionsIncontextLearnmoreUrl={discussionsIncontextLearnmoreUrl}
          deprecatedBlocksInfo={deprecatedBlocksInfo}
          proctoringErrors={proctoringErrors}
          mfeProctoredExamSettingsUrl={mfeProctoredExamSettingsUrl}
          advanceSettingsUrl={advanceSettingsUrl}
          savingStatus={savingStatus}
          errors={errors}
          dismissError={dismissError}
        />
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{getPageHeadTitle(courseName ?? '', intl.formatMessage(messages.headingTitle))}</title>
      </Helmet>
      <Container fluid className="px-3">
        <section className="course-outline-container mb-4 mt-5">
          <PageAlerts
            courseId={courseId}
            notificationDismissUrl={notificationDismissUrl}
            handleDismissNotification={handleDismissNotification}
            discussionsSettings={discussionsSettings}
            discussionsIncontextLearnmoreUrl={discussionsIncontextLearnmoreUrl}
            deprecatedBlocksInfo={deprecatedBlocksInfo}
            proctoringErrors={proctoringErrors}
            mfeProctoredExamSettingsUrl={mfeProctoredExamSettingsUrl}
            advanceSettingsUrl={advanceSettingsUrl}
            savingStatus={savingStatus}
            errors={errors}
            dismissError={dismissError}
          />
          <LegacyLibContentBlockAlert courseId={courseId} />
          <TransitionReplace>
            {showSuccessAlert ?
              (
                <AlertMessage
                  key={intl.formatMessage(messages.alertSuccessAriaLabelledby)}
                  show={showSuccessAlert}
                  variant="success"
                  icon={CheckCircleIcon}
                  title={intl.formatMessage(messages.alertSuccessTitle)}
                  description={intl.formatMessage(messages.alertSuccessDescription)}
                  aria-hidden="true"
                  aria-labelledby={intl.formatMessage(messages.alertSuccessAriaLabelledby)}
                  aria-describedby={intl.formatMessage(messages.alertSuccessAriaDescribedby)}
                />
              ) :
              null}
          </TransitionReplace>
          <SubHeader
            title={courseName ?? ''}
            subtitle={intl.formatMessage(messages.headingSubtitle)}
            hideBorder
            headerActions={
              <CourseOutlineHeaderActionsSlot
                isReIndexShow={isReIndexShow}
                isSectionsExpanded={isSectionsExpanded}
                headerNavigationsActions={headerNavigationsActions}
                isDisabledReindexButton={isDisabledReindexButton}
                hasSections={Boolean(sections.length)}
                courseActions={courseActions}
                errors={errors}
                sections={sections}
              />
            }
          />
          <StatusBar
            courseId={courseId}
            isLoading={isLoading}
            statusBarData={statusBarData}
            openEnableHighlightsModal={openEnableHighlightsModal}
            handleVideoSharingOptionChange={handleVideoSharingOptionChange}
          />
          <hr className="mt-4 mb-0 w-100 text-light-400" />
          <div className="d-flex align-items-start">
            <div className="flex-fill">
              <article>
                <div>
                  <ActionRow className="mt-3">
                    {Boolean(sections.length) && (
                      <Button
                        variant="outline-primary"
                        id="expand-collapse-all-button"
                        data-testid="expand-collapse-all-button"
                        iconBefore={isSectionsExpanded ? CloseFullscreen : OpenInFull}
                        onClick={headerNavigationsActions.handleExpandAll}
                      >
                        {isSectionsExpanded
                          ? intl.formatMessage(headerMessages.collapseAllButton)
                          : intl.formatMessage(headerMessages.expandAllButton)}
                      </Button>
                    )}
                  </ActionRow>
                  <OutlineTree
                    sections={sections}
                    courseActions={courseActions}
                    courseUsageKey={courseUsageKey}
                    hasOutlineIndexError={!!errors?.outlineIndexApi}
                    isCustomRelativeDatesActive={isCustomRelativeDatesActive}
                    isSectionsExpanded={isSectionsExpanded}
                    isSelfPaced={statusBarData.isSelfPaced}
                    discussionsSettings={discussionsSettings!}
                    previewSections={previewSections}
                    cancelReorderPreview={cancelReorderPreview}
                    commitSectionReorder={commitSectionReorder}
                    commitSubsectionReorder={commitSubsectionReorder}
                    commitUnitReorder={commitUnitReorder}
                    updateSectionOrderByIndex={updateSectionOrderByIndex}
                    updateSubsectionOrderByIndex={updateSubsectionOrderByIndex}
                    updateUnitOrderByIndex={updateUnitOrderByIndex}
                    handleOpenHighlightsModal={handleOpenHighlightsModal}
                    openConfigureModal={handleOpenConfigureModal}
                    openDeleteModal={openDeleteModal}
                    handlePasteClipboardClick={handlePasteClipboardClick}
                  />
                </div>
              </article>
            </div>
            <CourseAuthoringOutlineSidebarSlot
              courseId={courseId}
              courseName={courseName ?? ''}
              sections={sections}
            />
          </div>
        </section>
        {modals}
      </Container>
      <div className="alert-toast">
        <InternetConnectionAlert
          isFailed={isInternetConnectionAlertFailed}
          isQueryPending={savingStatus === RequestStatus.PENDING}
        />
      </div>
      {toastMessage && (
        <Toast
          show
          onClose={/* istanbul ignore next */ () => setToastMessage(null)}
          data-testid="taxonomy-toast"
        >
          {toastMessage}
        </Toast>
      )}
    </>
  );
};

export default CourseOutline;
