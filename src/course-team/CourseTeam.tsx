import { useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Button,
  Container,
  Layout,
} from '@openedx/paragon';
import { Add as IconAdd } from '@openedx/paragon/icons';

import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCourseUserPermissions } from '@src/authz/hooks';
import { getCourseTeamPermissions } from '@src/authz/permissionHelpers';
import { getAdminConsoleScopeUrl } from '@src/authz/urls';
import InternetConnectionAlert from '@src/generic/internet-connection-alert';
import SubHeader from '@src/generic/sub-header/SubHeader';
import { USER_ROLES } from '@src/constants';
import getPageHeadTitle from '@src/generic/utils';
import ConnectionErrorAlert from '@src/generic/ConnectionErrorAlert';
import PermissionDeniedAlert from '@src/generic/PermissionDeniedAlert';
import Loading from '@src/generic/Loading';

import messages from './messages';
import CourseTeamSideBar from './course-team-sidebar/CourseTeamSidebar';
import AddUserForm from './add-user-form/AddUserForm';
import AddTeamMember from './add-team-member/AddTeamMember';
import CourseTeamMember from './course-team-member/CourseTeamMember';
import InfoModal from './info-modal/InfoModal';
import { useCourseTeam } from './hooks';

const CourseTeam = () => {
  const intl = useIntl();
  const { courseId } = useCourseAuthoringContext();

  const {
    modalType,
    errorMessage,
    courseName,
    currentEmail,
    courseTeamUsers,
    currentUserEmail,
    isLoading,
    isLoadingDenied,
    isSingleAdmin,
    isFormVisible,
    isQueryPending,
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
    handleOpenDeleteModal,
    handleDeleteUserSubmit,
    handleChangeRoleUserSubmit,
  } = useCourseTeam();

  /*
  With authz enabled the team is managed in the admin console. Reaching
  this page by direct URL redirects there for users with view team permissions.
  */
  const {
    isLoading: isLoadingPermissions,
    isAuthzEnabled,
    canViewCourseTeam,
  } = useCourseUserPermissions(courseId, getCourseTeamPermissions(courseId));

  const shouldRedirectToAdminConsole = isAuthzEnabled && canViewCourseTeam;

  useEffect(() => {
    if (shouldRedirectToAdminConsole) {
      window.location.replace(getAdminConsoleScopeUrl(courseId));
    }
  }, [shouldRedirectToAdminConsole, courseId]);

  document.title = getPageHeadTitle(courseName, intl.formatMessage(messages.headingTitle));

  // The redirect is fired from the effect above, so keep the spinner up while the browser leaves.
  if (isLoadingPermissions || shouldRedirectToAdminConsole) {
    return <Loading />;
  }

  if (!canViewCourseTeam) {
    return <PermissionDeniedAlert />;
  }

  if (isLoadingDenied) {
    return (
      <Container size="xl" className="course-unit px-4 mt-4">
        <ConnectionErrorAlert />
      </Container>
    );
  }

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
                    headerActions={isAllowActions ?
                      (
                        <Button
                          variant="primary"
                          iconBefore={IconAdd}
                          size="sm"
                          onClick={openForm}
                          disabled={isFormVisible}
                        >
                          {intl.formatMessage(messages.addNewMemberButton)}
                        </Button>
                      ) :
                      undefined}
                  />
                  <section className="course-team-section">
                    <div className="members-container">
                      {isFormVisible && (
                        <AddUserForm
                          onSubmit={handleAddUserSubmit}
                          onCancel={hideForm}
                        />
                      )}
                      {courseTeamUsers.length ?
                        courseTeamUsers.map(({ username, role, email }) => (
                          <CourseTeamMember
                            key={email}
                            userName={username}
                            role={role}
                            email={email}
                            currentUserEmail={currentUserEmail || ''}
                            isAllowActions={isAllowActions}
                            isHideActions={role === USER_ROLES.admin && isSingleAdmin}
                            onChangeRole={handleChangeRoleUserSubmit}
                            onDelete={handleOpenDeleteModal}
                          />
                        )) :
                        null}
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
                          isShowInitialSidebar={isShowInitialSidebar}
                        />
                      </div>
                    )}
                    <InfoModal
                      isOpen={isInfoModalOpen}
                      close={closeInfoModal}
                      currentEmail={currentEmail}
                      errorMessage={errorMessage ?? ''}
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
          isFailed={errorMessage !== undefined}
          isQueryPending={isQueryPending}
          onInternetConnectionFailed={/* istanbul ignore next */ () => {}}
        />
      </div>
    </>
  );
};

export default CourseTeam;
