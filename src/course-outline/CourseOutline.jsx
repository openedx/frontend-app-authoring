import {
  React, useState, useCallback, useEffect, useRef,
} from 'react';
import update from 'immutability-helper';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Container,
  Layout,
  TransitionReplace,
} from '@edx/paragon';
import { Helmet } from 'react-helmet';
import {
  Add as IconAdd,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@edx/paragon/icons';
import { useSelector } from 'react-redux';

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
import HighlightsModal from './highlights-modal/HighlightsModal';
import EmptyPlaceholder from './empty-placeholder/EmptyPlaceholder';
import PublishModal from './publish-modal/PublishModal';
import ConfigureModal from './configure-modal/ConfigureModal';
import DeleteModal from './delete-modal/DeleteModal';
import { useCourseOutline } from './hooks';
import messages from './messages';
import { scrollToElement } from './utils';

const CourseOutline = ({ courseId }) => {
  const listRef = useRef(null);
  const intl = useIntl();

  const {
    courseName,
    savingStatus,
    statusBarData,
    sectionsList,
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
    closeConfigureModal,
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
    handleConfigureSectionSubmit,
    handlePublishItemSubmit,
    handleEditSubmit,
    handleDeleteItemSubmit,
    handleDuplicateSectionSubmit,
    handleDuplicateSubsectionSubmit,
    handleNewSectionSubmit,
    handleNewSubsectionSubmit,
    handleDragNDrop,
  } = useCourseOutline({ courseId });

  document.title = getPageHeadTitle(courseName, intl.formatMessage(messages.headingTitle));
  const [sections, setSections] = useState(sectionsList);

  const initialSections = [...sectionsList];

  const {
    isShow: isShowProcessingNotification,
    title: processingNotificationTitle,
  } = useSelector(getProcessingNotification);

  const moveSection = useCallback((dragIndex, hoverIndex) => {
    setSections((prevSections) => {
      const newList = update(prevSections, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevSections[dragIndex]],
        ],
      });
      return newList;
    });
  }, []);

  const finalizeSectionOrder = () => {
    handleDragNDrop(sections.map((section) => section.id), () => {
      setSections(() => initialSections);
    });
  };

  useEffect(() => {
    if (sectionsList) {
      setSections((prevSections) => {
        if (prevSections.length < sectionsList.length) {
          scrollToElement(listRef);
        }
        return sectionsList;
      });
    }
  }, [sectionsList]);

  if (isLoading) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
  }

  return (
    <>
      <Helmet>
        <title>{getPageHeadTitle(courseName, intl.formatMessage(messages.headingTitle))}</title>
      </Helmet>
      <Container size="xl" className="px-4">
        <section className="course-outline-container mb-4 mt-5">
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
                    />
                    <div className="pt-4">
                      {sections.length ? (
                        <>
                          <DndProvider
                            backend={HTML5Backend}
                          >
                            {sections.map((section, index) => (
                              <SectionCard
                                key={section.id}
                                index={index}
                                section={section}
                                savingStatus={savingStatus}
                                onOpenHighlightsModal={handleOpenHighlightsModal}
                                onOpenPublishModal={openPublishModal}
                                onOpenConfigureModal={openConfigureModal}
                                onOpenDeleteModal={openDeleteModal}
                                onEditSectionSubmit={handleEditSubmit}
                                onDuplicateSubmit={handleDuplicateSectionSubmit}
                                isSectionsExpanded={isSectionsExpanded}
                                onNewSubsectionSubmit={handleNewSubsectionSubmit}
                                moveSection={moveSection}
                                finalizeSectionOrder={finalizeSectionOrder}
                                ref={listRef}
                              >
                                {section.childInfo.children.map((subsection) => (
                                  <SubsectionCard
                                    key={subsection.id}
                                    section={section}
                                    subsection={subsection}
                                    savingStatus={savingStatus}
                                    onOpenPublishModal={openPublishModal}
                                    onOpenDeleteModal={openDeleteModal}
                                    onEditSubmit={handleEditSubmit}
                                    onDuplicateSubmit={handleDuplicateSubsectionSubmit}
                                    ref={listRef}
                                  />
                                ))}
                              </SectionCard>
                            ))}
                          </DndProvider>
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
                        </>
                      ) : (
                        <EmptyPlaceholder onCreateNewSection={handleNewSectionSubmit} />
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
          onClose={closeConfigureModal}
          onConfigureSubmit={handleConfigureSectionSubmit}
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
