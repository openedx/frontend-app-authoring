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
  moveSubsectionOver,
  moveUnitOver,
  moveSubsection,
  moveUnit,
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
  }

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
   * Check if item can be moved by given step.
   * Inner function returns false if the new index after moving by given step
   * is out of bounds of item length.
   * If it is within bounds, returns draggable flag of the item in the new index.
   * This helps us avoid moving the item to a position of unmovable item.
   * @param {Array} items
   * @returns {(id, step) => bool}
   */
  const canMoveItem = (items) => (id, step) => {
    // const newId = id + step;
    // const indexCheck = newId >= 0 && newId < items.length;
    // if (!indexCheck) {
    //   return false;
    // }
    // const newItem = items[newId];
    // return newItem.actions.draggable;
    return true;
  };

  /**
   * Move section to new index
   * @param {any} currentIndex
   * @param {any} newIndex
   */
  const updateSectionOrderByIndex = (currentIndex, newIndex) => {
    if (currentIndex === newIndex) {
      return;
    }
    if (!sections[newIndex]?.actions?.draggable) {
      return;
    }
    setSections((prevSections) => {
      const newSections = arrayMove(prevSections, currentIndex, newIndex);
      handleSectionDragAndDrop(newSections.map(section => section.id));
      return newSections;
    });
  };

  /**
   * Returns a function for given section which can move a subsection inside it
   * to a new position
   * @param {any} sectionIndex
   * @param {any} section
   * @param {any} subsections
   * @returns {(currentIndex, newIndex) => void}
   */
  const updateSubsectionOrderByIndex = (sectionIndex, section, subsections) => (index, step) => {
    let newSubsections;
    let sectionId;
    let sectionsCopy = [...sections];
    if ((step === -1 && index >= 1) || (step === 1 && subsections.length - index >= 2)) {
      // move subsection inside its own parent section
      [sectionsCopy, newSubsections] = moveSubsection(
        sectionsCopy,
        sectionIndex,
        index,
        index+step,
      );
      sectionId = section.id;
    } else if (step === -1 && index === 0 && sectionIndex > 0) {
      // move subsection to last position of previous section
      if (!sections[sectionIndex + step]?.actions?.childAddable) {
        // return if previous section doesn't allow adding subsections
        return;
      }
      [sectionsCopy, newSubsections] = moveSubsectionOver(
        sectionsCopy,
        sectionIndex,
        index,
        sectionIndex + step,
        sectionsCopy[sectionIndex + step].childInfo.children.length + 1,
      );
      sectionId = sections[sectionIndex + step].id;
    } else if (step === 1 && index === subsections.length - 1 && sectionIndex < sections.length - 1) {
      // move subsection to first position of next section
      if (!sections[sectionIndex + step]?.actions?.childAddable) {
        // return if next section doesn't allow adding subsections
        return;
      }
      [sectionsCopy, newSubsections] = moveSubsectionOver(
        sectionsCopy,
        sectionIndex,
        index,
        sectionIndex + step,
        0,
      );
      sectionId = sections[sectionIndex + step].id;
    }
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
   * Returns a function for given section & subsection which can move a unit
   * inside it to a new position
   * @param {any} sectionIndex
   * @param {any} section
   * @param {any} subsection
   * @param {any} units
   * @returns {(currentIndex, newIndex) => void}
   */
  const updateUnitOrderByIndex = (
    sectionIndex,
    subsectionIndex,
    section,
    subsection,
    units,
  ) => (index, step) => {
    let newUnits;
    let sectionId;
    let subsectionId;
    let sectionsCopy = [...sections];
    if ((step === -1 && index >= 1) || (step === 1 && units.length - index >= 2)) {
      // move unit inside its own parent subsection
      [sectionsCopy, newUnits] = moveUnit(
        sectionsCopy,
        sectionIndex,
        subsectionIndex,
        index,
        index+step,
      );
      sectionId = section.id;
      subsectionId = subsection.id;
    } else if (step === -1 && index === 0) {
      if (subsectionIndex > 0) {
        // move unit to last position of previous subsection inside same section.
        if (!sectionsCopy[sectionIndex].childInfo.children[subsectionIndex + step]?.actions?.childAddable) {
          // return if previous subsection doesn't allow adding subsections
          return;
        }
        [sectionsCopy, newUnits] = moveUnitOver(
          sectionsCopy,
          sectionIndex,
          subsectionIndex,
          index,
          sectionIndex,
          subsectionIndex + step,
          sectionsCopy[sectionIndex].childInfo.children[subsectionIndex + step].childInfo.children.length + 1,
        );
        sectionId = section.id;
        subsectionId = sectionsCopy[sectionIndex].childInfo.children[subsectionIndex + step].id;
      } else if (sectionIndex > 0) {
        // move unit to last position of previous subsection inside previous section.
        const newSectionIndex = sectionIndex + step;
        if (sectionsCopy[newSectionIndex].childInfo.children.length === 0) {
          // return if previous section has no subsections.
          return;
        }
        const newSubsectionIndex = sectionsCopy[newSectionIndex].childInfo.children.length - 1;
        if (!sectionsCopy[newSectionIndex].childInfo.children[newSubsectionIndex]?.actions?.childAddable) {
          // return if previous subsection doesn't allow adding subsections
          return;
        }
        [sectionsCopy, newUnits] = moveUnitOver(
          sectionsCopy,
          sectionIndex,
          subsectionIndex,
          index,
          newSectionIndex,
          newSubsectionIndex,
          sectionsCopy[newSectionIndex].childInfo.children[newSubsectionIndex].childInfo.children.length + 1,
        );
        sectionId = sectionsCopy[newSectionIndex].id;
        subsectionId = sectionsCopy[newSectionIndex].childInfo.children[newSubsectionIndex].id;
      }
    } else if (step === 1 && index === units.length - 1) {
      if (subsectionIndex < sectionsCopy[sectionIndex].childInfo.children.length - 1) {
        // move unit to first position of next subsection inside same section.
        if (!sectionsCopy[sectionIndex].childInfo.children[subsectionIndex + step]?.actions?.childAddable) {
          // return if next subsection doesn't allow adding subsections
          return;
        }
        [sectionsCopy, newUnits] = moveUnitOver(
          sectionsCopy,
          sectionIndex,
          subsectionIndex,
          index,
          sectionIndex,
          subsectionIndex + step,
          0,
        );
        sectionId = section.id;
        subsectionId = sectionsCopy[sectionIndex].childInfo.children[subsectionIndex + step].id;
      } else if (sectionIndex < sectionsCopy.length - 1) {
        // move unit to first position of next subsection inside next section.
        const newSectionIndex = sectionIndex + step;
        if (sectionsCopy[newSectionIndex].childInfo.children.length === 0) {
          // return if next section has no subsections.
          return;
        }
        const newSubsectionIndex = 0;
        if (!sectionsCopy[newSectionIndex].childInfo.children[newSubsectionIndex]?.actions?.childAddable) {
          // return if next subsection doesn't allow adding subsections
          return;
        }
        [sectionsCopy, newUnits] = moveUnitOver(
          sectionsCopy,
          sectionIndex,
          subsectionIndex,
          index,
          newSectionIndex,
          newSubsectionIndex,
          0,
        );
        sectionId = sectionsCopy[newSectionIndex].id;
        subsectionId = sectionsCopy[newSectionIndex].childInfo.children[newSubsectionIndex].id;
      }
    }
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
                                  canMoveItem={canMoveItem(sections)}
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
                                        canMoveItem={canMoveItem(section.childInfo.children)}
                                        isSelfPaced={statusBarData.isSelfPaced}
                                        isCustomRelativeDatesActive={isCustomRelativeDatesActive}
                                        savingStatus={savingStatus}
                                        onOpenPublishModal={openPublishModal}
                                        onOpenDeleteModal={openDeleteModal}
                                        onEditSubmit={handleEditSubmit}
                                        onDuplicateSubmit={handleDuplicateSubsectionSubmit}
                                        onOpenConfigureModal={openConfigureModal}
                                        onNewUnitSubmit={handleNewUnitSubmit}
                                        onOrderChange={updateSubsectionOrderByIndex(
                                          sectionIndex,
                                          section,
                                          section.childInfo.children,
                                        )}
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
                                              canMoveItem={canMoveItem(subsection.childInfo.children)}
                                              savingStatus={savingStatus}
                                              onOpenPublishModal={openPublishModal}
                                              onOpenConfigureModal={openConfigureModal}
                                              onOpenDeleteModal={openDeleteModal}
                                              onEditSubmit={handleEditSubmit}
                                              onDuplicateSubmit={handleDuplicateUnitSubmit}
                                              getTitleLink={getUnitUrl}
                                              onOrderChange={updateUnitOrderByIndex(
                                                sectionIndex,
                                                subsectionIndex,
                                                section,
                                                subsection,
                                                subsection.childInfo.children,
                                              )}
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
