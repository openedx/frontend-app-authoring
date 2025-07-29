import { useState, useEffect, useCallback } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Container,
  Layout,
  Row,
  TransitionReplace,
  Toast,
  StandardModal,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import { CheckCircle as CheckCircleIcon } from '@openedx/paragon/icons';
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
import AlertMessage from '@src/generic/alert-message';
import getPageHeadTitle from '@src/generic/utils';
import CourseOutlineHeaderActionsSlot from '@src/plugin-slots/CourseOutlineHeaderActionsSlot';
import { ContainerType } from '@src/generic/key-utils';
import { ComponentPicker, SelectedComponent } from '@src/library-authoring';
import { ContentType } from '@src/library-authoring/routes';
import { NOTIFICATION_MESSAGES } from '@src/constants';
import { COMPONENT_TYPES } from '@src/generic/block-type-utils/constants';
import { XBlock } from '@src/data/types';
import { getCurrentItem, getProctoredExamsFlag } from './data/selectors';
import { COURSE_BLOCK_NAMES } from './constants';
import StatusBar from './status-bar/StatusBar';
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
import { getTagsExportFile } from './data/api';
import OutlineAddChildButtons from './OutlineAddChildButtons';

interface CourseOutlineProps {
  courseId: string,
}

const CourseOutline = ({ courseId }: CourseOutlineProps) => {
  const intl = useIntl();
  const location = useLocation();

  const {
    courseUsageKey,
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
    isPublishModalOpen,
    isConfigureModalOpen,
    isDeleteModalOpen,
    closeHighlightsModal,
    closePublishModal,
    handleConfigureModalClose,
    closeDeleteModal,
    openPublishModal,
    openConfigureModal,
    openDeleteModal,
    headerNavigationsActions,
    openEnableHighlightsModal,
    closeEnableHighlightsModal,
    isAddLibrarySectionModalOpen,
    openAddLibrarySectionModal,
    closeAddLibrarySectionModal,
    handleEnableHighlightsSubmit,
    handleInternetConnectionFailed,
    handleOpenHighlightsModal,
    handleHighlightsFormSubmit,
    handleConfigureItemSubmit,
    handlePublishItemSubmit,
    handleEditSubmit,
    handleDeleteItemSubmit,
    handleDuplicateSectionSubmit,
    handleDuplicateSubsectionSubmit,
    handleDuplicateUnitSubmit,
    handleNewSectionSubmit,
    handleNewSubsectionSubmit,
    handleNewUnitSubmit,
    handleAddUnitFromLibrary,
    handleAddSubsectionFromLibrary,
    handleAddSectionFromLibrary,
    getUnitUrl,
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
  } = useCourseOutline({ courseId });

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

  const currentItemData = useSelector(getCurrentItem);
  const deleteCategory = COURSE_BLOCK_NAMES[currentItemData.category]?.name.toLowerCase();

  const enableProctoredExams = useSelector(getProctoredExamsFlag);

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

  const handleSelectLibrarySection = useCallback((selectedSection: SelectedComponent) => {
    handleAddSectionFromLibrary.mutateAsync({
      type: COMPONENT_TYPES.libraryV2,
      category: ContainerType.Chapter,
      parentLocator: courseUsageKey,
      libraryContentKey: selectedSection.usageKey,
    });
    closeAddLibrarySectionModal();
  }, [closeAddLibrarySectionModal, handleAddSectionFromLibrary.mutateAsync, courseId, courseUsageKey]);

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
      <Container size="xl" className="px-4 mt-4">
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
      <Container size="xl" className="px-4">
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
            title={intl.formatMessage(messages.headingTitle)}
            subtitle={intl.formatMessage(messages.headingSubtitle)}
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
          <Layout
            lg={[{ span: 9 }, { span: 3 }]}
            md={[{ span: 9 }, { span: 3 }]}
            sm={[{ span: 12 }, { span: 12 }]}
            xs={[{ span: 12 }, { span: 12 }]}
            xl={[{ span: 9 }, { span: 3 }]}
          >
            <Layout.Element>
              <article>
                <div>
                  <section className="course-outline-section">
                    <StatusBar
                      courseId={courseId}
                      isLoading={isLoading}
                      statusBarData={statusBarData}
                      openEnableHighlightsModal={openEnableHighlightsModal}
                      handleVideoSharingOptionChange={handleVideoSharingOptionChange}
                    />
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
                                    savingStatus={savingStatus}
                                    onOpenHighlightsModal={handleOpenHighlightsModal}
                                    onOpenPublishModal={openPublishModal}
                                    onOpenConfigureModal={openConfigureModal}
                                    onOpenDeleteModal={openDeleteModal}
                                    onEditSectionSubmit={handleEditSubmit}
                                    onDuplicateSubmit={handleDuplicateSectionSubmit}
                                    isSectionsExpanded={isSectionsExpanded}
                                    onNewSubsectionSubmit={handleNewSubsectionSubmit}
                                    onOrderChange={updateSectionOrderByIndex}
                                    onAddSubsectionFromLibrary={handleAddSubsectionFromLibrary.mutateAsync}
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
                                          savingStatus={savingStatus}
                                          onOpenPublishModal={openPublishModal}
                                          onOpenDeleteModal={openDeleteModal}
                                          onEditSubmit={handleEditSubmit}
                                          onDuplicateSubmit={handleDuplicateSubsectionSubmit}
                                          onOpenConfigureModal={openConfigureModal}
                                          onNewUnitSubmit={handleNewUnitSubmit}
                                          onAddUnitFromLibrary={handleAddUnitFromLibrary.mutateAsync}
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
                                                savingStatus={savingStatus}
                                                onOpenPublishModal={openPublishModal}
                                                onOpenConfigureModal={openConfigureModal}
                                                onOpenDeleteModal={openDeleteModal}
                                                onEditSubmit={handleEditSubmit}
                                                onDuplicateSubmit={handleDuplicateUnitSubmit}
                                                getTitleLink={getUnitUrl}
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
                                handleNewButtonClick={handleNewSectionSubmit}
                                handleUseFromLibraryClick={openAddLibrarySectionModal}
                                childType={ContainerType.Section}
                              />
                            )}
                          </>
                        ) : (
                          <EmptyPlaceholder>
                            {courseActions.childAddable && (
                              <OutlineAddChildButtons
                                handleNewButtonClick={handleNewSectionSubmit}
                                handleUseFromLibraryClick={openAddLibrarySectionModal}
                                childType={ContainerType.Section}
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
            </Layout.Element>
            <Layout.Element>
              <CourseAuthoringOutlineSidebarSlot
                courseId={courseId}
                courseName={courseName}
                sections={sections}
              />
            </Layout.Element>
          </Layout>
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
        <PublishModal
          isOpen={isPublishModalOpen}
          onClose={closePublishModal}
          onPublishSubmit={handlePublishItemSubmit}
        />
        <ConfigureModal
          isOpen={isConfigureModalOpen}
          onClose={handleConfigureModalClose}
          onConfigureSubmit={handleConfigureItemSubmit}
          currentItemData={currentItemData}
          enableProctoredExams={enableProctoredExams}
          isSelfPaced={statusBarData.isSelfPaced}
        />
        <DeleteModal
          category={deleteCategory}
          isOpen={isDeleteModalOpen}
          close={closeDeleteModal}
          onDeleteSubmit={handleDeleteItemSubmit}
        />
        <StandardModal
          title={intl.formatMessage(messages.sectionPickerModalTitle)}
          isOpen={isAddLibrarySectionModalOpen}
          onClose={closeAddLibrarySectionModal}
          isOverflowVisible={false}
          size="xl"
        >
          <ComponentPicker
            showOnlyPublished
            extraFilter={['block_type = "section"']}
            componentPickerMode="single"
            onComponentSelected={handleSelectLibrarySection}
            visibleTabs={[ContentType.sections]}
          />
        </StandardModal>
      </Container>
      <div className="alert-toast">
        <ProcessingNotification
          // Show processing toast if any mutation is running
          isShow={
            isShowProcessingNotification
            || handleAddUnitFromLibrary.isPending
            || handleAddSubsectionFromLibrary.isPending
            || handleAddSectionFromLibrary.isPending
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
