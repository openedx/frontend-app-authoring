import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Container,
  Layout,
  Row,
  TransitionReplace,
} from '@edx/paragon';
import { Helmet } from 'react-helmet';
import {
  Add as IconAdd,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@edx/paragon/icons';
import { useSelector } from 'react-redux';
import { DraggableList } from '@edx/frontend-lib-content-components';
import { arrayMove } from '@dnd-kit/sortable';

import { LoadingSpinner } from '../generic/Loading';
import { getProcessingNotification } from '../generic/processing-notification/data/selectors';
import { RequestStatus } from '../data/constants';
import SubHeader from '../generic/sub-header/SubHeader';
import ProcessingNotification from '../generic/processing-notification';
import InternetConnectionAlert from '../generic/internet-connection-alert';
import AlertMessage from '../generic/alert-message';
import getPageHeadTitle from '../generic/utils';
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
import DeleteModal from './delete-modal/DeleteModal';
import PageAlerts from './page-alerts/PageAlerts';
import { useCourseOutline } from './hooks';
import messages from './messages';

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
    handleSectionDragAndDrop,
    handleSubsectionDragAndDrop,
    handleVideoSharingOptionChange,
    handleUnitDragAndDrop,
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
  } = useCourseOutline({ courseId });

  const [sections, setSections] = useState(sectionsList);

  let initialSections = [...sectionsList];

  const {
    isShow: isShowProcessingNotification,
    title: processingNotificationTitle,
  } = useSelector(getProcessingNotification);

  const finalizeSectionOrder = () => (newSections) => {
    initialSections = [...sectionsList];
    handleSectionDragAndDrop(newSections.map(section => section.id), () => {
      setSections(() => initialSections);
    });
  };

  const setSubsection = (index) => (updatedSubsection) => {
    const section = { ...sections[index] };
    section.childInfo = { ...section.childInfo };
    section.childInfo.children = updatedSubsection();
    setSections([...sections.slice(0, index), section, ...sections.slice(index + 1)]);
  };

  const finalizeSubsectionOrder = (section) => () => (newSubsections) => {
    initialSections = [...sectionsList];
    handleSubsectionDragAndDrop(section.id, newSubsections.map(subsection => subsection.id), () => {
      setSections(() => initialSections);
    });
  };

  const setUnit = (sectionIndex, subsectionIndex) => (updatedUnits) => {
    const section = { ...sections[sectionIndex] };
    section.childInfo = { ...section.childInfo };

    const subsection = { ...section.childInfo.children[subsectionIndex] };
    subsection.childInfo = { ...subsection.childInfo };
    subsection.childInfo.children = updatedUnits();

    const updatedSubsections = [...section.childInfo.children];
    updatedSubsections[subsectionIndex] = subsection;
    section.childInfo.children = updatedSubsections;
    setSections([...sections.slice(0, sectionIndex), section, ...sections.slice(sectionIndex + 1)]);
  };

  const finalizeUnitOrder = (section, subsection) => () => (newUnits) => {
    initialSections = [...sectionsList];
    handleUnitDragAndDrop(section.id, subsection.id, newUnits.map(unit => unit.id), () => {
      setSections(() => initialSections);
    });
  };

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
    const newId = id + step;
    const indexCheck = newId >= 0 && newId < items.length;
    if (!indexCheck) {
      return false;
    }
    const newItem = items[newId];
    return newItem.actions.draggable;
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
    setSections((prevSections) => {
      const newSections = arrayMove(prevSections, currentIndex, newIndex);
      finalizeSectionOrder()(newSections);
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
  const updateSubsectionOrderByIndex = (sectionIndex, section, subsections) => (currentIndex, newIndex) => {
    if (currentIndex === newIndex) {
      return;
    }
    setSubsection(sectionIndex)(() => {
      const newSubsections = arrayMove(subsections, currentIndex, newIndex);
      finalizeSubsectionOrder(section)()(newSubsections);
      return newSubsections;
    });
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
  ) => (currentIndex, newIndex) => {
    if (currentIndex === newIndex) {
      return;
    }
    setUnit(sectionIndex, subsectionIndex)(() => {
      const newUnits = arrayMove(units, currentIndex, newIndex);
      finalizeUnitOrder(section, subsection)()(newUnits);
      return newUnits;
    });
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
                          <DraggableList itemList={sections} setState={setSections} updateOrder={finalizeSectionOrder}>
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
                                <DraggableList
                                  itemList={section.childInfo.children}
                                  setState={setSubsection(sectionIndex)}
                                  updateOrder={finalizeSubsectionOrder(section)}
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
                                      <DraggableList
                                        itemList={subsection.childInfo.children}
                                        setState={setUnit(sectionIndex, subsectionIndex)}
                                        updateOrder={finalizeUnitOrder(section, subsection)}
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
                                          />
                                        ))}
                                      </DraggableList>
                                    </SubsectionCard>
                                  ))}
                                </DraggableList>
                              </SectionCard>
                            ))}
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
