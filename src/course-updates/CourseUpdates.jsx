import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Button,
  Container,
  Layout,
} from '@openedx/paragon';
import { Add as AddIcon, ErrorOutline as ErrorIcon } from '@openedx/paragon/icons';
import { useSelector } from 'react-redux';

import { useModel } from '../generic/model-store';
import { getProcessingNotification } from '../generic/processing-notification/data/selectors';
import ProcessingNotification from '../generic/processing-notification';
import SubHeader from '../generic/sub-header/SubHeader';
import InternetConnectionAlert from '../generic/internet-connection-alert';
import ConnectionErrorAlert from '../generic/ConnectionErrorAlert';
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

const CourseUpdates = ({ courseId }) => {
  const intl = useIntl();
  const courseDetails = useModel('courseDetails', courseId);

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
  const anyStatusDenied = matchesAnyStatus({ ...loadingStatuses, ...savingStatuses }, RequestStatus.DENIED);
  const anyStatusInProgress = matchesAnyStatus({ ...loadingStatuses, ...savingStatuses }, RequestStatus.IN_PROGRESS);
  const anyStatusPending = matchesAnyStatus({ ...loadingStatuses, ...savingStatuses }, RequestStatus.PENDING);

  if (anyStatusDenied) {
    return (
      <Container size="xl" className="course-unit px-4 mt-4">
        <ConnectionErrorAlert />
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {getPageHeadTitle(courseDetails?.name, intl.formatMessage(messages.headingTitle))}
        </title>
      </Helmet>
      <Container size="xl" className="px-4 pt-4">
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
                    headerActions={(
                      <Button
                        variant="primary"
                        iconBefore={AddIcon}
                        size="sm"
                        onClick={() => handleOpenUpdateForm(REQUEST_TYPES.add_new_update)}
                        disabled={isUpdateFormOpen || errors.loadingUpdates}
                      >
                        {intl.formatMessage(messages.newUpdateButton)}
                      </Button>
                    )}
                  />
                  <section className="updates-section">
                    {isMainFormOpen && (
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
                          {courseUpdates.map((courseUpdate, index) => (
                            isInnerFormOpen(courseUpdate.id) ? (
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
                            )
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
                      <div className="updates-handouts-container">
                        <CourseHandouts
                          contentForHandouts={courseHandouts?.data || ''}
                          onEdit={() => handleOpenUpdateForm(REQUEST_TYPES.edit_handouts)}
                          isDisabledButtons={isUpdateFormOpen || errors.loadingHandouts}
                        />
                      </div>
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
                </div>
              </article>
            </Layout.Element>
          </Layout>
        </section>
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

CourseUpdates.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CourseUpdates;
