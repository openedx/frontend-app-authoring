import React from 'react';
import PropTypes from 'prop-types';
import { useIntl, injectIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Container,
  Layout,
} from '@edx/paragon';
import { Add as IconAdd } from '@edx/paragon/icons';

import SubHeader from '../generic/sub-header/SubHeader';
import messages from './messages';
import CourseTeamSideBar from './course-team-sidebar/CourseTeamSidebar';
import AddUserForm from './add-user-form/AddUserForm';
import AddTeamMember from './add-team-member/AddTeamMember';
import CourseTeamMember from './course-team-member/CourseTeamMember';
import { MODAL_TYPES } from './constants';
import { USER_ROLES } from '../constants';
import InfoModal from './info-modal/InfoModal';
import { useCourseTeam } from './hooks';

const CourseTeam = ({ courseId }) => {
  const intl = useIntl();

  const {
    modalType,
    errorEmail,
    courseName,
    currentEmail,
    courseTeamUsers,
    currentUserEmail,
    isSingleAdmin,
    isFormVisible,
    isAllowActions,
    isInfoModalOpen,
    isOwnershipHint,
    isShowAddTeamMember,
    isShowInitialSidebar,
    isShowUserFilledSidebar,
    openForm,
    hideForm,
    closeInfoModal,
    handleAddUserSubmit,
    handleOpenInfoModal,
    handleChangeRoleUserSubmit,
    handleDeleteUserSubmit,
  } = useCourseTeam({ intl, courseId });

  return (
    <Container size="xl" className="m-4">
      <section className="course-team-container mb-4">
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
                  headerActions={isAllowActions && (
                    <Button
                      variant="outline-success"
                      iconBefore={IconAdd}
                      size="sm"
                      onClick={openForm}
                      disabled={isFormVisible}
                    >
                      {intl.formatMessage(messages.addNewMemberButton)}
                    </Button>
                  )}
                />
                <section className="course-team-section">
                  <div className="members-container">
                    {isFormVisible && (
                      <AddUserForm
                        onSubmit={handleAddUserSubmit}
                        onCancel={hideForm}
                      />
                    )}
                    {courseTeamUsers.length ? courseTeamUsers.map(({ username, role, email }) => (
                      <CourseTeamMember
                        key={email}
                        userName={username}
                        role={role}
                        email={email}
                        currentUserEmail={currentUserEmail || ''}
                        isAllowActions={isAllowActions}
                        isHideActions={role === USER_ROLES.admin && isSingleAdmin}
                        onChangeRole={handleChangeRoleUserSubmit}
                        onDelete={() => handleOpenInfoModal(MODAL_TYPES.delete, email)}
                      />
                    )) : null}
                    {isShowAddTeamMember && (
                      <AddTeamMember
                        onFormOpen={openForm}
                        isButtonDisable={isFormVisible}
                      />
                    )}
                  </div>
                  {isShowInitialSidebar && (
                    <div className="sidebar-container">
                      <CourseTeamSideBar
                        courseId={courseId}
                        isOwnershipHint={isOwnershipHint}
                      />
                    </div>
                  )}
                  <InfoModal
                    isOpen={isInfoModalOpen}
                    close={closeInfoModal}
                    currentEmail={currentEmail}
                    errorEmail={errorEmail}
                    courseName={courseName}
                    modalType={modalType}
                    onDeleteSubmit={handleDeleteUserSubmit}
                  />
                </section>
              </div>
            </article>
          </Layout.Element>
          <Layout.Element>
            {isShowUserFilledSidebar && (
              <CourseTeamSideBar
                courseId={courseId}
                isOwnershipHint={isOwnershipHint}
              />
            )}
          </Layout.Element>
        </Layout>
      </section>
    </Container>
  );
};

CourseTeam.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(CourseTeam);
