import React, { useCallback } from 'react';
import {
  Button,
  Container,
  Icon,
  Layout,
  MailtoLink,
  Row,
} from '@openedx/paragon';
import { Add as AddIcon, Error, ManageAccounts } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { StudioFooterSlot } from '@edx/frontend-component-footer';
import { Link, useLocation } from 'react-router-dom';

import { useWaffleFlags } from '@src/data/apiHooks';
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
    canCreateNewLibrary,
    librariesV1Enabled,
    librariesV2Enabled,
  } = useStudioHome();

  const waffleFlags = useWaffleFlags();
  const isAuthzEnabled = waffleFlags?.enableAuthzCourseAuthoring ?? false;
  const adminConsoleUrl = `${getConfig().ADMIN_CONSOLE_URL}/authz`;

  const {
    userIsActive,
    studioShortName,
    studioRequestEmail,
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

    if (isAuthzEnabled && getConfig().ADMIN_CONSOLE_URL) {
      headerButtons.push(
        <div className="border-right mr-3 pr-4 py-2">
          <Button
            as="a"
            href={adminConsoleUrl}
            variant="primary"
            iconBefore={ManageAccounts}
            size="sm"
            target="_blank"
          >
            {intl.formatMessage(messages.addRolesPermissionsBtnText)}
          </Button>
        </div>,
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

    if (canCreateNewLibrary) {
      headerButtons.push(
        <Button
          as={Link}
          to="/library/create"
          variant="outline-primary"
          iconBefore={AddIcon}
          size="sm"
        >
          <FormattedMessage {...messages.addNewLibraryBtnText} />
        </Button>,
      );
    }

    return headerButtons;
  }, [location, userIsActive, isFailedLoadingPage, isAuthzEnabled]);

  const headerButtons = userIsActive ? getHeaderButtons() : [];
  if (isLoadingPage && !isFiltered) {
    return <Loading />;
  }

  const getMainBody = () => {
    if (isFailedLoadingPage) {
      return (
        <AlertMessage
          variant="danger"
          description={
            <Row className="m-0 align-items-center">
              <Icon src={Error} className="text-danger-500 mr-1" />
              <span>{intl.formatMessage(messages.homePageLoadFailedMessage)}</span>
            </Row>
          }
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
              isShowProcessing={Boolean(isShowProcessing) && !isFiltered}
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
      <StudioFooterSlot />
    </>
  );
};

export default StudioHome;
