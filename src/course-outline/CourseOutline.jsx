import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Container,
  Layout,
  Row,
  TransitionReplace,
} from '@openedx/paragon';
import { Helmet } from 'react-helmet';
import {
  Add as IconAdd,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@openedx/paragon/icons';
import { useSelector } from 'react-redux';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { LoadingSpinner } from '../generic/Loading';
import { getProcessingNotification } from '../generic/processing-notification/data/selectors';
import { RequestStatus } from '../data/constants';
import SubHeader from '../generic/sub-header/SubHeader';
import ProcessingNotification from '../generic/processing-notification';
import InternetConnectionAlert from '../generic/internet-connection-alert';
import DeleteModal from '../generic/delete-modal/DeleteModal';
import AlertMessage from '../generic/alert-message';
import getPageHeadTitle from '../generic/utils';
import { getCurrentItem } from './data/selectors';
import { COURSE_BLOCK_NAMES } from './constants';
import HeaderNavigations from './header-navigations/HeaderNavigations';
import OutlineSideBar from './outline-sidebar/OutlineSidebar';
import StatusBar from './status-bar/StatusBar';
import EnableHighlightsModal from './enable-highlights-modal/EnableHighlightsModal';
import SectionCard from './section-card/SectionCard';
import SubsectionCard from './subsection-card/SubsectionCard';
import UnitCard from './unit-card/UnitCard';
import HighlightsModal from './highlights-modal/HighlightsModal';
import EmptyPlaceholder from './empty-placeholder/EmptyPlaceholder';
import PublishModal from './publish-modal/PublishModal';
import ConfigureModal from './configure-modal/ConfigureModal';
import PageAlerts from './page-alerts/PageAlerts';
import DraggableList from './drag-helper/DraggableList';
import {
  canMoveSection,
  possibleUnitMoves,
  possibleSubsectionMoves,
} from './drag-helper/utils';
import { useCourseOutline } from './hooks';
import messages from './messages';
import useUnitTagsCount from './data/apiHooks';

const CourseOutline = ({ courseId }) => {
  const intl = useIntl();

  const {
    courseName,
    savingStatus,
    statusBarData,
    courseActions,
    sectionsList,
    isCustomRelativeDatesActive,
    isLoading,
    isReIndexShow,
    showErrorAlert,
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
    getUnitUrl,
    handleVideoSharingOptionChange,
    handleCopyToClipboardClick,
    handlePasteClipboardClick,
    notificationDismissUrl,
    discussionsSettings,
    discussionsIncontextFeedbackUrl,
    discussionsIncontextLearnmoreUrl,
    deprecatedBlocksInfo,
    proctoringErrors,
    mfeProctoredExamSettingsUrl,
    handleDismissNotification,
    advanceSettingsUrl,
    prevContainerInfo,
    handleSectionDragAndDrop,
    handleSubsectionDragAndDrop,
    handleUnitDragAndDrop,
  } = useCourseOutline({ courseId });

  const [sections, setSections] = useState(sectionsList);

  const restoreSectionList = () => {
    setSections(() => [...sectionsList]);
  };

  const {
    isShow: isShowProcessingNotification,
    title: processingNotificationTitle,
  } = useSelector(getProcessingNotification);

  const { category } = useSelector(getCurrentItem);
  const deleteCategory = COURSE_BLOCK_NAMES[category]?.name.toLowerCase();

  const unitsIdPattern = useMemo(() => {
    let pattern = '';
    sections.forEach((section) => {
      section.childInfo.children.forEach((subsection) => {
        subsection.childInfo.children.forEach((unit) => {
          if (pattern !== '') {
            pattern += `,${unit.id}`;
          } else {
            pattern += unit.id;
          }
        });
      });
    });
    return pattern;
  }, [sections]);

  const {
    data: unitsTagCounts,
    isSuccess: isUnitsTagCountsLoaded,
  } = useUnitTagsCount(unitsIdPattern);

  /**
   * Move section to new index
   * @param {any} currentIndex
   * @param {any} newIndex
   */
  const updateSectionOrderByIndex = (currentIndex, newIndex) => {
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
   * @param {any} section
   * @param {any} moveDetails
   * @returns {void}
   */
  const updateSubsectionOrderByIndex = (section, moveDetails) => {
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
   * @param {any} section
   * @param {any} moveDetails
   * @returns {void}
   */
  const updateUnitOrderByIndex = (section, moveDetails) => {
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
            discussionsIncontextFeedbackUrl={discussionsIncontextFeedbackUrl}
            discussionsIncontextLearnmoreUrl={discussionsIncontextLearnmoreUrl}
            deprecatedBlocksInfo={deprecatedBlocksInfo}
            proctoringErrors={proctoringErrors}
            mfeProctoredExamSettingsUrl={mfeProctoredExamSettingsUrl}
            advanceSettingsUrl={advanceSettingsUrl}
            savingStatus={savingStatus}
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
            className="mt-5"
            title={intl.formatMessage(messages.headingTitle)}
            subtitle={intl.formatMessage(messages.headingSubtitle)}
            headerActions={(
              <HeaderNavigations
                isReIndexShow={isReIndexShow}
                isSectionsExpanded={isSectionsExpanded}
                headerNavigationsActions={headerNavigationsActions}
                isDisabledReindexButton={isDisabledReindexButton}
                hasSections={Boolean(sectionsList.length)}
                courseActions={courseActions}
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
                    <div className="pt-4">
                      {sections.length ? (
                        <>
                          <DraggableList
                            items={sections}
                            setSections={setSections}
                            restoreSectionList={restoreSectionList}
                            prevContainerInfo={prevContainerInfo}
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
                                  id={section.id}
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
                                        isSelfPaced={statusBarData.isSelfPaced}
                                        isCustomRelativeDatesActive={isCustomRelativeDatesActive}
                                        savingStatus={savingStatus}
                                        onOpenPublishModal={openPublishModal}
                                        onOpenDeleteModal={openDeleteModal}
                                        onEditSubmit={handleEditSubmit}
                                        onDuplicateSubmit={handleDuplicateSubsectionSubmit}
                                        onOpenConfigureModal={openConfigureModal}
                                        onNewUnitSubmit={handleNewUnitSubmit}
                                        onOrderChange={updateSubsectionOrderByIndex}
                                        onPasteClick={handlePasteClipboardClick}
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
                                              onCopyToClipboardClick={handleCopyToClipboardClick}
                                              discussionsSettings={discussionsSettings}
                                              tagsCount={isUnitsTagCountsLoaded ? unitsTagCounts[unit.id] : 0}
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
                            <Button
                              data-testid="new-section-button"
                              className="mt-4"
                              variant="outline-primary"
                              onClick={handleNewSectionSubmit}
                              iconBefore={IconAdd}
                              block
                            >
                              {intl.formatMessage(messages.newSectionButton)}
                            </Button>
                          )}
                        </>
                      ) : (
                        <EmptyPlaceholder
                          onCreateNewSection={handleNewSectionSubmit}
                          childAddable={courseActions.childAddable}
                        />
                      )}
                    </div>
                  </section>
                </div>
              </article>
            </Layout.Element>
            <Layout.Element>
              <OutlineSideBar courseId={courseId} />
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
        />
        <DeleteModal
          category={deleteCategory}
          isOpen={isDeleteModalOpen}
          close={closeDeleteModal}
          onDeleteSubmit={handleDeleteItemSubmit}
        />
      </Container>
      <div className="alert-toast">
        <ProcessingNotification
          isShow={isShowProcessingNotification}
          title={processingNotificationTitle}
        />
        <InternetConnectionAlert
          isFailed={isInternetConnectionAlertFailed}
          isQueryPending={savingStatus === RequestStatus.PENDING}
          onInternetConnectionFailed={handleInternetConnectionFailed}
        />
        {showErrorAlert && (
          <AlertMessage
            key={intl.formatMessage(messages.alertErrorTitle)}
            show={showErrorAlert}
            variant="danger"
            icon={WarningIcon}
            title={intl.formatMessage(messages.alertErrorTitle)}
            aria-hidden="true"
          />
        )}
      </div>
    </>
  );
};

CourseOutline.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CourseOutline;
