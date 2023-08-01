import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Container,
  Layout,
} from '@edx/paragon';
import { Add as AddIcon } from '@edx/paragon/icons';

import SubHeader from '../generic/sub-header/SubHeader';
import CourseHandouts from './course-handouts/CourseHandouts';
import CourseUpdate from './course-update/CourseUpdate';
import DeleteModal from './delete-modal/DeleteModal';
import UpdateForm from './update-form/UpdateForm';
import { REQUEST_TYPES } from './constants';
import messages from './messages';
import { useCourseUpdates } from './hooks';

const CourseUpdates = ({ courseId }) => {
  const intl = useIntl();

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
    handleOpenDeleteUpdateForm,
  } = useCourseUpdates({ courseId });

  return (
    <Container size="xl" className="m-4">
      <section className="setting-items mb-4 mt-5">
        <Layout
          lg={[{ span: 9 }, { span: 3 }]}
          md={[{ span: 9 }, { span: 3 }]}
          sm={[{ span: 9 }, { span: 3 }]}
          xs={[{ span: 9 }, { span: 3 }]}
          xl={[{ span: 9 }, { span: 3 }]}
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
                      variant="outline-primary"
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
                            onDelete={() => handleOpenDeleteUpdateForm(courseUpdate)}
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
                      onDeleteSubmit={handleOpenDeleteForm}
                    />
                  </div>
                </section>
              </div>
            </article>
          </Layout.Element>
        </Layout>
      </section>
    </Container>
  );
};

CourseUpdates.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CourseUpdates;
