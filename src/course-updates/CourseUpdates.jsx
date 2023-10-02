import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Container,
  Layout,
} from '@edx/paragon';
import { Add as AddIcon } from '@edx/paragon/icons';
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
import { getLoadingStatuses, getSavingStatuses } from './data/selectors';
import { matchesAnyStatus } from './utils';
import getPageHeadTitle from '../generic/utils';

const CourseUpdates = ({ courseId }) => {
  const intl = useIntl();

  const courseDetails = useModel('courseDetails', courseId);
  document.title = getPageHeadTitle(courseDetails?.name, intl.formatMessage(messages.headingTitle));

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

  const anyStatusFailed = matchesAnyStatus({ ...loadingStatuses, ...savingStatuses }, RequestStatus.FAILED);
  const anyStatusInProgress = matchesAnyStatus({ ...loadingStatuses, ...savingStatuses }, RequestStatus.IN_PROGRESS);
  const anyStatusPending = matchesAnyStatus({ ...loadingStatuses, ...savingStatuses }, RequestStatus.PENDING);

  return (
    <>
      <Container size="xl" className="px-4">
        <section className="setting-items mb-4 mt-5">
          <Layout
            lg={[{ span: 12 }]}
            md={[{ span: 12 }]}
            sm={[{ span: 12 }]}
            xs={[{ span: 12 }]}
            xl={[{ span: 12 }]}
          >
            <Layout.Element>
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
                        disabled={isUpdateFormOpen}
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
                      <div className="p-4.5">
                        {courseUpdates.length ? courseUpdates.map((courseUpdate, index) => (
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
                          ))) : null}
                      </div>
                      <div className="updates-handouts-container">
                        <CourseHandouts
                          contentForHandouts={courseHandouts?.data || ''}
                          onEdit={() => handleOpenUpdateForm(REQUEST_TYPES.edit_handouts)}
                          isDisabledButtons={isUpdateFormOpen}
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
