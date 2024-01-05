import React from 'react';
import PropTypes from 'prop-types';
import { useIntl, injectIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Container,
  Layout,
} from '@edx/paragon';
import { Add as IconAdd } from '@edx/paragon/icons';

import InternetConnectionAlert from '../generic/internet-connection-alert';
import { useModel } from '../generic/model-store';
import SubHeader from '../generic/sub-header/SubHeader';
import { USER_ROLES } from '../constants';
import messages from './messages';
import CourseTeamSideBar from './course-team-sidebar/CourseTeamSidebar';
import AddUserForm from './add-user-form/AddUserForm';
import AddTeamMember from './add-team-member/AddTeamMember';
import CourseTeamMember from './course-team-member/CourseTeamMember';
import InfoModal from './info-modal/InfoModal';
import { useCourseTeam } from './hooks';
import { useUserPermissions } from '../generic/hooks';
import getPageHeadTitle from '../generic/utils';

const CourseTeam = ({ courseId }) => {
  const intl = useIntl();
  const courseDetails = useModel('courseDetails', courseId);

  document.title = getPageHeadTitle(courseDetails?.name, intl.formatMessage(messages.headingTitle));

  const {
    modalType,
    errorMessage,
    courseName,
    currentEmail,
    courseTeamUsers,
    currentUserEmail,
    isLoading,
    isSingleAdmin,
    isFormVisible,
    isQueryPending,
    isAllowActions,
    isInfoModalOpen,
    isOwnershipHint,
    isShowAddTeamMember,
    isShowInitialSidebar,
    isShowUserFilledSidebar,
    isInternetConnectionAlertFailed,
    openForm,
    hideForm,
    closeInfoModal,
    handleAddUserSubmit,
    handleOpenDeleteModal,
    handleDeleteUserSubmit,
    handleChangeRoleUserSubmit,
    handleInternetConnectionFailed,
  } = useCourseTeam({ intl, courseId });

  const {
    checkPermission,
  } = useUserPermissions();

  const hasManageAllUsersPerm = checkPermission('manage_all_users');

  if (isLoading) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
  }

  return (
    <>
      <Container size="xl" className="course-team px-4">
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
                    headerActions={(isAllowActions || hasManageAllUsersPerm) && (
                      <Button
                        variant="primary"
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
                          isAllowActions={isAllowActions || hasManageAllUsersPerm}
                          isHideActions={role === USER_ROLES.admin && isSingleAdmin}
                          onChangeRole={handleChangeRoleUserSubmit}
                          onDelete={handleOpenDeleteModal}
                        />
                      )) : null}
                      {(isShowAddTeamMember || hasManageAllUsersPerm) && (
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
                          isShowInitialSidebar={isShowInitialSidebar}
                        />
                      </div>
                    )}
                    <InfoModal
                      isOpen={isInfoModalOpen}
                      close={closeInfoModal}
                      currentEmail={currentEmail}
                      errorMessage={errorMessage}
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
      <div className="alert-toast">
        <InternetConnectionAlert
          isFailed={isInternetConnectionAlertFailed}
          isQueryPending={isQueryPending}
          onInternetConnectionFailed={handleInternetConnectionFailed}
        />
      </div>
    </>
  );
};

CourseTeam.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(CourseTeam);
