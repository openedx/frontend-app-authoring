import { useState, useEffect } from 'react';
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
import { useSelector } from 'react-redux';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useLocation } from 'react-router-dom';
import { CourseAuthoringOutlineSidebarSlot } from '@src/plugin-slots/CourseAuthoringOutlineSidebarSlot';

import { LoadingSpinner } from '@src/generic/Loading';
import { getProcessingNotification } from '@src/generic/processing-notification/data/selectors';
import { RequestStatus } from '@src/data/constants';
import SubHeader from '@src/generic/sub-header/SubHeader';
import ProcessingNotification from '@src/generic/processing-notification';
import InternetConnectionAlert from '@src/generic/internet-connection-alert';
import DeleteModal from '@src/generic/delete-modal/DeleteModal';
import ConfigureModal from '@src/generic/configure-modal/ConfigureModal';
import { UnlinkModal } from '@src/generic/unlink-modal';
import AlertMessage from '@src/generic/alert-message';
import getPageHeadTitle from '@src/generic/utils';
import CourseOutlineHeaderActionsSlot from '@src/plugin-slots/CourseOutlineHeaderActionsSlot';
import { NOTIFICATION_MESSAGES } from '@src/constants';
import { XBlock } from '@src/data/types';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import LegacyLibContentBlockAlert from '@src/course-libraries/LegacyLibContentBlockAlert';
import { ContainerType } from '@src/generic/key-utils';
import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import {
  getProctoredExamsFlag,
  getTimedExamsFlag,
} from './data/selectors';
import { COURSE_BLOCK_NAMES } from './constants';
import EnableHighlightsModal from './enable-highlights-modal/EnableHighlightsModal';
import SectionCard from './section-card/SectionCard';
import SubsectionCard from './subsection-card/SubsectionCard';
import UnitCard from './unit-card/UnitCard';
import HighlightsModal from './highlights-modal/HighlightsModal';
import EmptyPlaceholder from './empty-placeholder/EmptyPlaceholder';
import PublishModal from './publish-modal/PublishModal';
import PageAlerts from './page-alerts/PageAlerts';
import DraggableList from './drag-helper/DraggableList';
import {
  canMoveSection,
  possibleUnitMoves,
  possibleSubsectionMoves,
} from './drag-helper/utils';
import { useCourseOutline } from './hooks';
import messages from './messages';
import headerMessages from './header-navigations/messages';
import { getTagsExportFile } from './data/api';
import OutlineAddChildButtons from './OutlineAddChildButtons';
import { StatusBar } from './status-bar/StatusBar';
import { LegacyStatusBar } from './status-bar/LegacyStatusBar';
import { isOutlineNewDesignEnabled } from './utils';
import { OutlineSidebarPagesProvider } from '@src/course-outline/outline-sidebar/OutlineSidebarPagesContext';

const CourseOutline = () => {
  const intl = useIntl();
  const location = useLocation();
  const {
    courseId,
    courseUsageKey,
    handleAddSubsection,
    handleAddUnit,
    handleAddAndOpenUnit,
    handleAddSection,
    isUnlinkModalOpen,
    closeUnlinkModal,
    currentSelection,
  } = useCourseAuthoringContext();

  const {
    courseName,
    savingStatus,
    statusBarData,
    courseActions,
    sectionsList,
    isCustomRelativeDatesActive,
    isLoading,
    isLoadingDenied,
    isReIndexShow,
    showSuccessAlert,
    isSectionsExpanded,
    isEnableHighlightsModalOpen,
    isInternetConnectionAlertFailed,
    isDisabledReindexButton,
    isHighlightsModalOpen,
    isConfigureModalOpen,
    isDeleteModalOpen,
    closeHighlightsModal,
    handleConfigureModalClose,
    closeDeleteModal,
    openConfigureModal,
    openDeleteModal,
    headerNavigationsActions,
    openEnableHighlightsModal,
    closeEnableHighlightsModal,
    handleEnableHighlightsSubmit,
    handleInternetConnectionFailed,
    handleOpenHighlightsModal,
    handleHighlightsFormSubmit,
    handleConfigureItemSubmit,
    handleDeleteItemSubmit,
    handleDuplicateSectionSubmit,
    handleDuplicateSubsectionSubmit,
    handleDuplicateUnitSubmit,
    handleVideoSharingOptionChange,
    handlePasteClipboardClick,
    notificationDismissUrl,
    discussionsSettings,
    discussionsIncontextLearnmoreUrl,
    deprecatedBlocksInfo,
    proctoringErrors,
    mfeProctoredExamSettingsUrl,
    handleDismissNotification,
    advanceSettingsUrl,
    handleSectionDragAndDrop,
    handleSubsectionDragAndDrop,
    handleUnitDragAndDrop,
    errors,
    resetScrollState,
    handleUnlinkItemSubmit,
  } = useCourseOutline({ courseId });

  // Show the new actions bar if it is enabled in the configuration.
  // This is a temporary flag until the new design feature is fully implemented.
  const showNewActionsBar = isOutlineNewDesignEnabled();
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

  const [sections, setSections] = useState<XBlock[]>(sectionsList);

  const restoreSectionList = () => {
    setSections(() => [...sectionsList]);
  };

  const {
    isShow: isShowProcessingNotification,
    title: processingNotificationTitle,
  } = useSelector(getProcessingNotification);

  const { data: currentItemData } = useCourseItemData(currentSelection?.currentId);

  const itemCategory = currentItemData?.category || '';
  const itemCategoryName = COURSE_BLOCK_NAMES[itemCategory]?.name.toLowerCase();

  const enableProctoredExams = useSelector(getProctoredExamsFlag);
  const enableTimedExams = useSelector(getTimedExamsFlag);

  /**
   * Move section to new index
   */
  const updateSectionOrderByIndex = (currentIndex: number, newIndex: number) => {
    if (currentIndex === newIndex) {
      return;
    }
    setSections((prevSections) => {
      const newSections = arrayMove(prevSections, currentIndex, newIndex);
      handleSectionDragAndDrop(newSections.map(section => section.id));
      return newSections;
    });
  };

  /**
   * Uses details from move information and moves subsection
   */
  const updateSubsectionOrderByIndex = (section: XBlock, moveDetails) => {
    const { fn, args, sectionId } = moveDetails;
    if (!args) {
      return;
    }
    const [sectionsCopy, newSubsections] = fn(...args);
    if (newSubsections && sectionId) {
      setSections(sectionsCopy);
      handleSubsectionDragAndDrop(
        sectionId,
        section.id,
        newSubsections.map(subsection => subsection.id),
        restoreSectionList,
      );
    }
  };

  /**
   * Uses details from move information and moves unit
   */
  const updateUnitOrderByIndex = (section: XBlock, moveDetails) => {
    const {
      fn, args, sectionId, subsectionId,
    } = moveDetails;
    if (!args) {
      return;
    }
    const [sectionsCopy, newUnits] = fn(...args);
    if (newUnits && sectionId && subsectionId) {
      setSections(sectionsCopy);
      handleUnitDragAndDrop(
        sectionId,
        section.id,
        subsectionId,
        newUnits.map(unit => unit.id),
        restoreSectionList,
      );
    }
  };

  useEffect(() => {
    setSections(sectionsList);
  }, [sectionsList]);

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
        />
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{getPageHeadTitle(courseName, intl.formatMessage(messages.headingTitle))}</title>
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
          />
          <LegacyLibContentBlockAlert courseId={courseId} />
          <TransitionReplace>
            {showSuccessAlert ? (
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
            ) : null}
          </TransitionReplace>
          <SubHeader
            title={courseName}
            subtitle={intl.formatMessage(messages.headingSubtitle)}
            hideBorder
            headerActions={(
              <CourseOutlineHeaderActionsSlot
                isReIndexShow={isReIndexShow}
                isSectionsExpanded={isSectionsExpanded}
                headerNavigationsActions={headerNavigationsActions}
                isDisabledReindexButton={isDisabledReindexButton}
                hasSections={Boolean(sectionsList.length)}
                courseActions={courseActions}
                errors={errors}
                sections={sections}
              />
            )}
          />
          {showNewActionsBar
            ? (
              <StatusBar
                courseId={courseId}
                isLoading={isLoading}
                statusBarData={statusBarData}
              />
            ) : (
              <LegacyStatusBar
                courseId={courseId}
                isLoading={isLoading}
                statusBarData={statusBarData}
                openEnableHighlightsModal={openEnableHighlightsModal}
                handleVideoSharingOptionChange={handleVideoSharingOptionChange}
              />
            )}
          <hr className="mt-4 mb-0 w-100 text-light-400" />
          <div className="d-flex align-items-baseline">
            <div className="flex-fill">
              <article>
                <div>
                  {showNewActionsBar && (
                  <ActionRow className="mt-3">
                    {Boolean(sectionsList.length) && (
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
                  )}
                  <section>
                    {!errors?.outlineIndexApi && (
                      <div className="pt-4">
                        {sections.length ? (
                          <>
                            <DraggableList
                              items={sections}
                              setSections={setSections}
                              restoreSectionList={restoreSectionList}
                              handleSectionDragAndDrop={handleSectionDragAndDrop}
                              handleSubsectionDragAndDrop={handleSubsectionDragAndDrop}
                              handleUnitDragAndDrop={handleUnitDragAndDrop}
                            >
                              <SortableContext
                                id="root"
                                items={sections}
                                strategy={verticalListSortingStrategy}
                              >
                                {sections.map((section, sectionIndex) => (
                                  <SectionCard
                                    key={section.id}
                                    section={section}
                                    index={sectionIndex}
                                    canMoveItem={canMoveSection(sections)}
                                    isSelfPaced={statusBarData.isSelfPaced}
                                    isCustomRelativeDatesActive={isCustomRelativeDatesActive}
                                    onOpenHighlightsModal={handleOpenHighlightsModal}
                                    onOpenConfigureModal={openConfigureModal}
                                    onOpenDeleteModal={openDeleteModal}
                                    onDuplicateSubmit={handleDuplicateSectionSubmit}
                                    isSectionsExpanded={isSectionsExpanded}
                                    onOrderChange={updateSectionOrderByIndex}
                                    resetScrollState={resetScrollState}
                                  >
                                    <SortableContext
                                      id={section.id}
                                      items={section.childInfo.children}
                                      strategy={verticalListSortingStrategy}
                                    >
                                      {section.childInfo.children.map((subsection, subsectionIndex) => (
                                        <SubsectionCard
                                          key={subsection.id}
                                          section={section}
                                          subsection={subsection}
                                          index={subsectionIndex}
                                          getPossibleMoves={possibleSubsectionMoves(
                                            [...sections],
                                            sectionIndex,
                                            section,
                                            section.childInfo.children,
                                          )}
                                          isSectionsExpanded={isSectionsExpanded}
                                          isSelfPaced={statusBarData.isSelfPaced}
                                          isCustomRelativeDatesActive={isCustomRelativeDatesActive}
                                          onOpenDeleteModal={openDeleteModal}
                                          onDuplicateSubmit={handleDuplicateSubsectionSubmit}
                                          onOpenConfigureModal={openConfigureModal}
                                          onOrderChange={updateSubsectionOrderByIndex}
                                          onPasteClick={handlePasteClipboardClick}
                                          resetScrollState={resetScrollState}
                                        >
                                          <SortableContext
                                            id={subsection.id}
                                            items={subsection.childInfo.children}
                                            strategy={verticalListSortingStrategy}
                                          >
                                            {subsection.childInfo.children.map((unit, unitIndex) => (
                                              <UnitCard
                                                key={unit.id}
                                                unit={unit}
                                                subsection={subsection}
                                                section={section}
                                                isSelfPaced={statusBarData.isSelfPaced}
                                                isCustomRelativeDatesActive={isCustomRelativeDatesActive}
                                                index={unitIndex}
                                                getPossibleMoves={possibleUnitMoves(
                                                  [...sections],
                                                  sectionIndex,
                                                  subsectionIndex,
                                                  section,
                                                  subsection,
                                                  subsection.childInfo.children,
                                                )}
                                                onOpenConfigureModal={openConfigureModal}
                                                onOpenDeleteModal={openDeleteModal}
                                                onDuplicateSubmit={handleDuplicateUnitSubmit}
                                                onOrderChange={updateUnitOrderByIndex}
                                                discussionsSettings={discussionsSettings}
                                              />
                                            ))}
                                          </SortableContext>
                                        </SubsectionCard>
                                      ))}
                                    </SortableContext>
                                  </SectionCard>
                                ))}
                              </SortableContext>
                            </DraggableList>
                            {courseActions.childAddable && (
                              <OutlineAddChildButtons
                                childType={ContainerType.Section}
                                parentLocator={courseUsageKey}
                              />
                            )}
                          </>
                        ) : (
                          <EmptyPlaceholder>
                            {courseActions.childAddable && (
                              <OutlineAddChildButtons
                                childType={ContainerType.Section}
                                parentLocator={courseUsageKey}
                                btnVariant="primary"
                                btnClasses="mt-1"
                              />
                            )}
                          </EmptyPlaceholder>
                        )}
                      </div>
                    )}
                  </section>
                </div>
              </article>
            </div>
            <CourseAuthoringOutlineSidebarSlot
              courseId={courseId}
              courseName={courseName}
              sections={sections}
            />
          </div>
          <EnableHighlightsModal
            isOpen={isEnableHighlightsModalOpen}
            close={closeEnableHighlightsModal}
            onEnableHighlightsSubmit={handleEnableHighlightsSubmit}
          />
        </section>
        <HighlightsModal
          isOpen={isHighlightsModalOpen}
          onClose={closeHighlightsModal}
          onSubmit={handleHighlightsFormSubmit}
        />
        <PublishModal />
        <ConfigureModal
          isOpen={isConfigureModalOpen}
          onClose={handleConfigureModalClose}
          onConfigureSubmit={handleConfigureItemSubmit}
          currentItemData={currentItemData}
          enableProctoredExams={enableProctoredExams}
          enableTimedExams={enableTimedExams}
          isSelfPaced={statusBarData.isSelfPaced}
        />
        <DeleteModal
          category={itemCategoryName}
          isOpen={isDeleteModalOpen}
          close={closeDeleteModal}
          onDeleteSubmit={handleDeleteItemSubmit}
        />
        <UnlinkModal
          displayName={currentItemData?.displayName}
          category={itemCategory}
          isOpen={isUnlinkModalOpen}
          close={closeUnlinkModal}
          onUnlinkSubmit={handleUnlinkItemSubmit}
        />
      </Container>
      <div className="alert-toast">
        <ProcessingNotification
          // Show processing toast if any mutation is running
          isShow={
            isShowProcessingNotification
            || handleAddUnit.isPending
            || handleAddAndOpenUnit.isPending
            || handleAddSubsection.isPending
            || handleAddSection.isPending
          }
          // HACK: Use saving as default title till we have a need for better messages
          title={processingNotificationTitle || NOTIFICATION_MESSAGES.saving}
        />
        <InternetConnectionAlert
          isFailed={isInternetConnectionAlertFailed}
          isQueryPending={savingStatus === RequestStatus.PENDING}
          onInternetConnectionFailed={handleInternetConnectionFailed}
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
