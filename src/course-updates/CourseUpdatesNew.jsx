import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  Container,
  Layout,
  Tabs,
  Tab,
} from '@openedx/paragon';
import { Add as AddIcon, ErrorOutline as ErrorIcon } from '@openedx/paragon/icons';
import { useSelector } from 'react-redux';

import { useModel } from '../generic/model-store';
import { getProcessingNotification } from '../generic/processing-notification/data/selectors';
import ProcessingNotification from '../generic/processing-notification';
import SubHeader from '../generic/sub-header/SubHeader';
import InternetConnectionAlert from '../generic/internet-connection-alert';
import { RequestStatus } from '../data/constants';
import CourseHandouts from './course-handouts/CourseHandouts';
import CourseUpdate from './course-update/CourseUpdate';
import DeleteModal from './delete-modal/DeleteModal';
import UpdateForm from './update-form/UpdateForm';
import { REQUEST_TYPES } from './constants';
import messages from './messages';
import { useCourseUpdates } from './hooks';
import {
  getErrors,
  getLoadingStatuses,
  getSavingStatuses,
} from './data/selectors';
import { matchesAnyStatus } from './utils';
import getPageHeadTitle from '../generic/utils';
import AlertMessage from '../generic/alert-message';

const CourseUpdatesNew = ({ courseId }) => {
  const intl = useIntl();
  const courseDetails = useModel('courseDetails', courseId);
  const [activeTab, setActiveTab] = useState('updates');

  const {
    requestType,
    courseUpdates,
    courseHandouts,
    courseUpdatesInitialValues,
    isMainFormOpen,
    isInnerFormOpen,
    isUpdateFormOpen,
    isDeleteModalOpen,
    closeUpdateForm,
    closeDeleteModal,
    handleUpdatesSubmit,
    handleOpenUpdateForm,
    handleOpenDeleteForm,
    handleDeleteUpdateSubmit,
  } = useCourseUpdates({ courseId });

  const {
    isShow: isShowProcessingNotification,
    title: processingNotificationTitle,
  } = useSelector(getProcessingNotification);

  const loadingStatuses = useSelector(getLoadingStatuses);
  const savingStatuses = useSelector(getSavingStatuses);
  const errors = useSelector(getErrors);

  const anyStatusFailed = matchesAnyStatus({ ...loadingStatuses, ...savingStatuses }, RequestStatus.FAILED);
  const anyStatusInProgress = matchesAnyStatus({ ...loadingStatuses, ...savingStatuses }, RequestStatus.IN_PROGRESS);
  const anyStatusPending = matchesAnyStatus({ ...loadingStatuses, ...savingStatuses }, RequestStatus.PENDING);

  return (
    <>
      <Helmet>
        <title>
          {getPageHeadTitle(courseDetails?.name, intl.formatMessage(messages.headingTitle))}
        </title>
      </Helmet>
      <Container size="xl">
        <div
          className="course-updates-new-wrapper"
          // style={{
          //   backgroundColor: 'white',
          //   padding: '1rem',
          //   borderRadius: '1rem',
          //   border: '1px solid #ced4da',
          // }}
        >
          <section className="setting-items mb-4">
            {errors.loadingUpdates && (
              <AlertMessage
                title={intl.formatMessage(messages.loadingUpdatesErrorTitle)}
                description={intl.formatMessage(messages.loadingUpdatesErrorDescription, { courseId })}
                variant="danger"
                icon={ErrorIcon}
              />
            )}
            {errors.loadingHandouts && (
              <AlertMessage
                title={intl.formatMessage(messages.loadingHandoutsErrorTitle)}
                description={intl.formatMessage(messages.loadingHandoutsErrorDescription, { courseId })}
                variant="danger"
                icon={ErrorIcon}
              />
            )}
            {errors.creatingUpdate && (
              <AlertMessage
                title={intl.formatMessage(messages.savingUpdatesErrorTitle)}
                description={intl.formatMessage(messages.savingNewUpdateErrorAlertDescription)}
                variant="danger"
                icon={ErrorIcon}
              />
            )}
            {errors.savingUpdates && (
              <AlertMessage
                title={intl.formatMessage(messages.savingUpdatesErrorTitle)}
                description={intl.formatMessage(messages.savingUpdatesErrorDescription)}
                variant="danger"
                icon={ErrorIcon}
              />
            )}
            {errors.deletingUpdates && (
              <AlertMessage
                title={intl.formatMessage(messages.deletingUpdatesErrorTitle)}
                description={intl.formatMessage(messages.deletingUpdatesErrorDescription)}
                variant="danger"
                icon={ErrorIcon}
              />
            )}
            {errors.savingHandouts && (
              <AlertMessage
                title={intl.formatMessage(messages.savingHandoutsErrorTitle)}
                description={intl.formatMessage(messages.savingHandoutsErrorDescription)}
                variant="danger"
                icon={ErrorIcon}
              />
            )}
            <Layout
              lg={[{ span: 12 }]}
              md={[{ span: 12 }]}
              sm={[{ span: 12 }]}
              xs={[{ span: 12 }]}
              xl={[{ span: 12 }]}
            >
              <Layout.Element className="mt-3">
                <article>
                  <div>
                    <SubHeader
                      title={intl.formatMessage(messages.headingTitle)}
                      subtitle={intl.formatMessage(messages.headingSubtitle)}
                      instruction={intl.formatMessage(messages.sectionInfo)}
                    />
                    <div className="d-flex align-items-center mb-3" style={{ gap: '1rem' }}>
                      <div style={{ flex: '1 1 auto' }}>
                        <Tabs
                          id="course-updates-tabs"
                          activeKey={activeTab}
                          onSelect={setActiveTab}
                          className="course-updates-tabs"
                        >
                          <Tab eventKey="updates" title={intl.formatMessage(messages.updatesTabTitle)} />
                          <Tab eventKey="handouts" title={intl.formatMessage(messages.handoutsTabTitle)} />
                        </Tabs>
                      </div>
                      {activeTab === 'updates' && (
                        <Button
                          variant="primary"
                          iconBefore={AddIcon}
                          size="sm"
                          onClick={() => handleOpenUpdateForm(REQUEST_TYPES.add_new_update)}
                          disabled={isUpdateFormOpen || errors.loadingUpdates}
                          style={{ borderRadius: '0.5rem', color: '#fff' }}
                        >
                          {intl.formatMessage(messages.newUpdateButton)}
                        </Button>
                      )}
                    </div>
                    {activeTab === 'updates' && (
                      <>
                        <div className="d-flex justify-content-end mb-3">
                          {/* <Button
                            variant="primary"
                            iconBefore={AddIcon}
                            size="sm"
                            onClick={() => handleOpenUpdateForm(REQUEST_TYPES.add_new_update)}
                            disabled={isUpdateFormOpen || errors.loadingUpdates}
                          >
                            {intl.formatMessage(messages.newUpdateButton)}
                          </Button> */}
                        </div>
                        <section className="updates-section">
                          {isMainFormOpen && requestType !== REQUEST_TYPES.edit_handouts && (
                            <UpdateForm
                              isOpen={isUpdateFormOpen}
                              close={closeUpdateForm}
                              requestType={requestType}
                              onSubmit={handleUpdatesSubmit}
                              courseUpdatesInitialValues={courseUpdatesInitialValues}
                            />
                          )}
                          <div className="updates-container">
                            {courseUpdates.length > 0 && (
                              <div className="p-4.5">
                                <p className="recent-updates">Recent Updates</p>
                                {courseUpdates.map((courseUpdate, index) => (
                                  <div
                                    key={courseUpdate.id}
                                    className="update-card"
                                    style={{
                                      background: '#f5f7fa',
                                      borderRadius: '0.75rem',
                                      padding: '1rem',
                                      marginBottom: '1rem',
                                    }}
                                  >
                                    {isInnerFormOpen(courseUpdate.id) ? (
                                      <UpdateForm
                                        isOpen={isUpdateFormOpen}
                                        close={closeUpdateForm}
                                        requestType={requestType}
                                        isInnerForm
                                        isFirstUpdate={index === 0}
                                        onSubmit={handleUpdatesSubmit}
                                        courseUpdatesInitialValues={courseUpdatesInitialValues}
                                      />
                                    ) : (
                                      <CourseUpdate
                                        dateForUpdate={courseUpdate.date}
                                        contentForUpdate={courseUpdate.content}
                                        onEdit={() => handleOpenUpdateForm(REQUEST_TYPES.edit_update, courseUpdate)}
                                        onDelete={() => handleOpenDeleteForm(courseUpdate)}
                                        isDisabledButtons={isUpdateFormOpen}
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {!courseUpdates.length && (
                              <ActionRow>
                                <ActionRow.Spacer />
                                <span className="small mr-2">
                                  {intl.formatMessage(messages.noCourseUpdates)}
                                </span>
                                <Button
                                  variant="primary"
                                  iconBefore={AddIcon}
                                  size="sm"
                                  onClick={() => handleOpenUpdateForm(REQUEST_TYPES.add_new_update)}
                                  disabled={isUpdateFormOpen || errors.loadingUpdates}
                                >
                                  {intl.formatMessage(messages.firstUpdateButton)}
                                </Button>
                                <ActionRow.Spacer />
                              </ActionRow>
                            )}
                            <DeleteModal
                              isOpen={isDeleteModalOpen}
                              close={closeDeleteModal}
                              onDeleteSubmit={handleDeleteUpdateSubmit}
                            />
                            {isShowProcessingNotification && (
                              <ProcessingNotification
                                isShow={isShowProcessingNotification}
                                title={processingNotificationTitle}
                              />
                            )}
                          </div>
                        </section>
                      </>
                    )}
                    {activeTab === 'handouts' && (
                      <div
                        className="updates-handouts-container"
                        style={{
                          background: 'white',
                          padding: '1rem',
                          borderRadius: '1rem',
                          border: '1px solid #ced4da',
                        }}
                      >
                        {isMainFormOpen && requestType === REQUEST_TYPES.edit_handouts && (
                          <UpdateForm
                            isOpen={isUpdateFormOpen}
                            close={closeUpdateForm}
                            requestType={requestType}
                            onSubmit={handleUpdatesSubmit}
                            courseUpdatesInitialValues={courseUpdatesInitialValues}
                          />
                        )}
                        <div
                          className="handout-card"
                          style={{
                            background: '#f5f7fa',
                            borderRadius: '0.75rem',
                            border: '1px solid #e5e6e6',
                            padding: '1rem',
                            marginBottom: '1rem',
                            width: '100%',
                          }}
                        >
                          <CourseHandouts
                            contentForHandouts={courseHandouts?.data || ''}
                            onEdit={() => handleOpenUpdateForm(REQUEST_TYPES.edit_handouts)}
                            isDisabledButtons={isUpdateFormOpen || errors.loadingHandouts}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              </Layout.Element>
            </Layout>
          </section>
        </div>
      </Container>
      <div className="alert-toast">
        <InternetConnectionAlert
          isFailed={anyStatusFailed}
          isQueryPending={anyStatusInProgress || anyStatusPending}
          onInternetConnectionFailed={() => null}
        />
      </div>
    </>
  );
};

CourseUpdatesNew.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CourseUpdatesNew;
