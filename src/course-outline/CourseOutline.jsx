import {
  React, useState, useEffect,
} from 'react';
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
import {
  DraggableList,
  SortableItem,
  ErrorAlert,
} from '@edx/frontend-lib-content-components';

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
import { useCourseOutline } from './hooks';
import messages from './messages';

const CourseOutline = ({ courseId }) => {
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
    handleDuplicateUnitSubmit,
    handleNewSectionSubmit,
    handleNewSubsectionSubmit,
    handleNewUnitSubmit,
    getUnitUrl,
    handleDragNDrop,
  } = useCourseOutline({ courseId });

  const [sections, setSections] = useState(sectionsList);

  const initialSections = [...sectionsList];

  const {
    isShow: isShowProcessingNotification,
    title: processingNotificationTitle,
  } = useSelector(getProcessingNotification);

  const finalizeSectionOrder = () => (newSections) => {
    handleDragNDrop(newSections.map((section) => section.id), () => {
      setSections(() => initialSections);
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
          <ErrorAlert hideHeading isError={savingStatus === RequestStatus.FAILED}>
            {intl.formatMessage(messages.alertFailedGeneric, { actionName: 'save', type: 'changes' })}
          </ErrorAlert>
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
                          <DraggableList itemList={sections} setState={setSections} updateOrder={finalizeSectionOrder}>
                            {sections.map((section) => (
                              <SortableItem
                                id={section.id}
                                key={section.id}
                                componentStyle={{
                                  background: 'white',
                                  borderRadius: '6px',
                                  padding: '1.75rem',
                                  marginBottom: '1.5rem',
                                  boxShadow: '0px 1px 5px #ADADAD',
                                }}
                              >
                                <SectionCard
                                  key={section.id}
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
                                      onNewUnitSubmit={handleNewUnitSubmit}
                                    >
                                      {subsection.childInfo.children.map((unit) => (
                                        <UnitCard
                                          key={unit.id}
                                          unit={unit}
                                          subsection={subsection}
                                          section={section}
                                          savingStatus={savingStatus}
                                          onOpenPublishModal={openPublishModal}
                                          onOpenDeleteModal={openDeleteModal}
                                          onEditSubmit={handleEditSubmit}
                                          onDuplicateSubmit={handleDuplicateUnitSubmit}
                                          getTitleLink={getUnitUrl}
                                        />
                                      ))}
                                    </SubsectionCard>
                                  ))}
                                </SectionCard>
                              </SortableItem>
                            ))}
                          </DraggableList>
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
