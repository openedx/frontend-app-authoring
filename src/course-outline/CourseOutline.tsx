import { useState, useEffect, useRef } from 'react';
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
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useLocation } from 'react-router-dom';
import { CourseAuthoringOutlineSidebarSlot } from '@src/plugin-slots/CourseAuthoringOutlineSidebarSlot';

import { LoadingSpinner } from '@src/generic/Loading';
import { RequestStatus } from '@src/data/constants';
import SubHeader from '@src/generic/sub-header/SubHeader';
import InternetConnectionAlert from '@src/generic/internet-connection-alert';
import DeleteModal from '@src/generic/delete-modal/DeleteModal';
import ConfigureModal from '@src/generic/configure-modal/ConfigureModal';
import { UnlinkModal } from '@src/generic/unlink-modal';
import AlertMessage from '@src/generic/alert-message';
import getPageHeadTitle from '@src/generic/utils';
import CourseOutlineHeaderActionsSlot from '@src/plugin-slots/CourseOutlineHeaderActionsSlot';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCourseOutlineContext } from './CourseOutlineContext';
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
import UnitCard from './unit-card/UnitCard';
import HighlightsModal from './highlights-modal/HighlightsModal';
import EmptyPlaceholder from './empty-placeholder/EmptyPlaceholder';
import PublishModal from './publish-modal/PublishModal';
import PageAlerts from './page-alerts/PageAlerts';
import DraggableList from './drag-helper/DraggableList';
import {
  canMoveSection,
  possibleUnitMoves,
} from './drag-helper/utils';
import { useCourseOutline } from './hooks';
import messages from './messages';
import headerMessages from './header-navigations/messages';
import { useConfigureSubsection } from './data/apiHooks';
import { getTagsExportFile } from './data/api';
import OutlineAddChildButtons from './OutlineAddChildButtons';
import { StatusBar } from './status-bar/StatusBar';

const AutoCreateSubsection = ({ parentLocator }: { parentLocator: string }) => {
  const { handleAddBlock } = useCourseOutlineContext();
  const configureSubsection = useConfigureSubsection();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;
      (handleAddBlock.mutateAsync as any)({
        type: ContainerType.Sequential,
        parentLocator,
        displayName: 'Subsection',
        sectionId: parentLocator,
      }).then((data: { locator: string }) => {
        // Hide subsection from learners automatically
        (configureSubsection.mutate as any)({
          itemId: data.locator,
          isVisibleToStaffOnly: true,
          sectionId: parentLocator,
        });
      }).catch((e) => {
        console.error('Failed to auto-create subsection:', e);
        hasRun.current = false;
      });
    }
  }, []);

  return null;
};

const CourseOutline = () => {
  const intl = useIntl();
  const location = useLocation();
  const {
    courseId,
    courseUsageKey,
    isUnlinkModalOpen,
    closeUnlinkModal,
  } = useCourseAuthoringContext();
  const {
    currentSelection,
    sections,
    restoreSectionList,
    setSections,
    updateSectionOrderByIndex,
    updateSubsectionOrderByIndex,
    updateUnitOrderByIndex,
  } = useCourseOutlineContext();

  const {
    courseName,
    savingStatus,
    statusBarData,
    courseActions,
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
    handleUnlinkItemSubmit,
  } = useCourseOutline({ courseId });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (courseId && courseName && location.hash === '#export-tags') {
      setToastMessage(intl.formatMessage(messages.exportTagsCreatingToastMessage));
      getTagsExportFile(courseId, courseName).then(() => {
        setToastMessage(intl.formatMessage(messages.exportTagsSuccessToastMessage));
      }).catch(() => {
        setToastMessage(intl.formatMessage(messages.exportTagsErrorToastMessage));
      });
      window.location.href = '#';
    }
  }, [location, courseId, courseName]);

  const { data: currentItemData } = useCourseItemData(currentSelection?.currentId);

  const itemCategory = currentItemData?.category || '';
  const itemCategoryName = COURSE_BLOCK_NAMES[itemCategory]?.name.toLowerCase();

  const enableProctoredExams = useSelector(getProctoredExamsFlag);
  const enableTimedExams = useSelector(getTimedExamsFlag);

  if (isLoading) {
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
                                  >
                                    {/* Auto-create a hidden subsection if section has none */}
                                    {(section.childInfo?.children ?? []).length === 0 && courseActions.childAddable && (
                                      <AutoCreateSubsection parentLocator={section.id} />
                                    )}

                                    {/* Render units directly, hiding subsection layer */}
                                    {(section.childInfo?.children ?? []).map((subsection, subsectionIndex) => (
                                      <SortableContext
                                        key={subsection.id}
                                        id={subsection.id}
                                        items={subsection.childInfo?.children ?? []}
                                        strategy={verticalListSortingStrategy}
                                      >
                                        {(subsection.childInfo?.children ?? []).map((unit, unitIndex) => (
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
                                              subsection.childInfo?.children ?? [],
                                            )}
                                            onOpenConfigureModal={openConfigureModal}
                                            onOpenDeleteModal={openDeleteModal}
                                            onDuplicateSubmit={handleDuplicateUnitSubmit}
                                            onOrderChange={updateUnitOrderByIndex}
                                            discussionsSettings={discussionsSettings}
                                          />
                                        ))}

                                        {/* New Unit button per hidden subsection */}
                                        {courseActions.childAddable && (
                                          <OutlineAddChildButtons
                                            childType={ContainerType.Unit}
                                            parentLocator={subsection.id}
                                            grandParentLocator={section.id}
                                          />
                                        )}
                                      </SortableContext>
                                    ))}
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
          isOverflowVisible={itemCategory === COURSE_BLOCK_NAMES.chapter.id}
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
        <InternetConnectionAlert
          isFailed={isInternetConnectionAlertFailed}
          isQueryPending={savingStatus === RequestStatus.PENDING}
          onInternetConnectionFailed={handleInternetConnectionFailed}
        />
      </div>
      {toastMessage && (
        <Toast
          show
          onClose={() => setToastMessage(null)}
          data-testid="taxonomy-toast"
        >
          {toastMessage}
        </Toast>
      )}
    </>
  );
};

export default CourseOutline;