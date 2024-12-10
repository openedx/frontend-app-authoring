import React, { useCallback } from 'react';
import {
  Button,
  Container,
  Icon,
  Layout,
  MailtoLink,
  Row,
} from '@openedx/paragon';
import { Add as AddIcon, Error } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { StudioFooter } from '@edx/frontend-component-footer';
import { getConfig } from '@edx/frontend-platform';
import { useLocation, useNavigate } from 'react-router-dom';

import Loading from '../generic/Loading';
import InternetConnectionAlert from '../generic/internet-connection-alert';
import Header from '../header';
import SubHeader from '../generic/sub-header/SubHeader';
import HomeSidebar from './home-sidebar';
import TabsSection from './tabs-section';
import OrganizationSection from './organization-section';
import VerifyEmailLayout from './verify-email-layout';
import CreateNewCourseForm from './create-new-course-form';
import messages from './messages';
import { useStudioHome } from './hooks';
import AlertMessage from '../generic/alert-message';

const StudioHome = () => {
  const intl = useIntl();
  const location = useLocation();
  const navigate = useNavigate();

  const isPaginationCoursesEnabled = getConfig().ENABLE_HOME_PAGE_COURSE_API_V2;
  const {
    isLoadingPage,
    isFailedLoadingPage,
    studioHomeData,
    isShowProcessing,
    anyQueryIsFailed,
    isShowEmailStaff,
    anyQueryIsPending,
    showNewCourseContainer,
    isShowOrganizationDropdown,
    hasAbilityToCreateNewCourse,
    isFiltered,
    setShowNewCourseContainer,
    librariesV1Enabled,
    librariesV2Enabled,
  } = useStudioHome();

  const v1LibraryTab = librariesV1Enabled && location?.pathname.split('/').pop() === 'libraries-v1';
  const showV2LibraryURL = librariesV2Enabled && !v1LibraryTab;

  const {
    userIsActive,
    studioShortName,
    studioRequestEmail,
    showNewLibraryButton,
    showNewLibraryV2Button,
  } = studioHomeData;

  const getHeaderButtons = useCallback(() => {
    const headerButtons: JSX.Element[] = [];

    if (isFailedLoadingPage || !userIsActive) {
      return headerButtons;
    }

    if (isShowEmailStaff) {
      headerButtons.push(
        <MailtoLink to={studioRequestEmail}>{intl.formatMessage(messages.emailStaffBtnText)}</MailtoLink>,
      );
    }

    if (hasAbilityToCreateNewCourse) {
      headerButtons.push(
        <Button
          variant="outline-primary"
          iconBefore={AddIcon}
          size="sm"
          disabled={showNewCourseContainer}
          onClick={() => setShowNewCourseContainer(true)}
        >
          {intl.formatMessage(messages.addNewCourseBtnText)}
        </Button>,
      );
    }

    if ((showNewLibraryButton && !showV2LibraryURL) || (showV2LibraryURL && showNewLibraryV2Button)) {
      const newLibraryClick = () => {
        if (showV2LibraryURL) {
          navigate('/library/create');
        } else {
          // Studio home library for legacy libraries
          window.open(`${getConfig().STUDIO_BASE_URL}/home_library`);
        }
      };

      headerButtons.push(
        <Button
          variant="outline-primary"
          iconBefore={AddIcon}
          size="sm"
          onClick={newLibraryClick}
          data-testid="new-library-button"
        >
          {intl.formatMessage(messages.addNewLibraryBtnText)}
        </Button>,
      );
    }

    return headerButtons;
  }, [location, userIsActive, isFailedLoadingPage]);

  const headerButtons = userIsActive ? getHeaderButtons() : [];
  if (isLoadingPage && !isFiltered) {
    return (<Loading />);
  }

  const getMainBody = () => {
    if (isFailedLoadingPage) {
      return (
        <AlertMessage
          variant="danger"
          description={(
            <Row className="m-0 align-items-center">
              <Icon src={Error} className="text-danger-500 mr-1" />
              <span>{intl.formatMessage(messages.homePageLoadFailedMessage)}</span>
            </Row>
          )}
        />
      );
    }
    if (!userIsActive) {
      return <VerifyEmailLayout />;
    }
    return (
      <Layout
        lg={[{ span: 9 }, { span: 3 }]}
        md={[{ span: 9 }, { span: 3 }]}
        sm={[{ span: 9 }, { span: 3 }]}
        xs={[{ span: 9 }, { span: 3 }]}
        xl={[{ span: 9 }, { span: 3 }]}
      >
        <Layout.Element>
          <section>
            {showNewCourseContainer && (
              <CreateNewCourseForm handleOnClickCancel={() => setShowNewCourseContainer(false)} />
            )}
            {isShowOrganizationDropdown && <OrganizationSection />}
            <TabsSection
              showNewCourseContainer={showNewCourseContainer}
              onClickNewCourse={() => setShowNewCourseContainer(true)}
              isShowProcessing={isShowProcessing && !isFiltered}
              isPaginationCoursesEnabled={isPaginationCoursesEnabled}
              librariesV1Enabled={librariesV1Enabled}
              librariesV2Enabled={librariesV2Enabled}
            />
          </section>
        </Layout.Element>
        <Layout.Element>
          <HomeSidebar />
        </Layout.Element>
      </Layout>
    );
  };

  return (
    <>
      <Header isHiddenMainMenu />
      <Container size="xl" className="p-4 mt-3">
        <section className="mb-4">
          <article className="studio-home-sub-header">
            <section>
              <SubHeader
                title={intl.formatMessage(messages.headingTitle, { studioShortName: studioShortName || 'Studio' })}
                headerActions={headerButtons}
              />
            </section>
          </article>
          {getMainBody()}
        </section>
      </Container>
      <div className="alert-toast">
        <InternetConnectionAlert
          isFailed={anyQueryIsFailed}
          isQueryPending={anyQueryIsPending}
        />
      </div>
      <StudioFooter />
    </>
  );
};

export default StudioHome;
