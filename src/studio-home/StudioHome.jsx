import React from 'react';
import {
  Button,
  Container,
  Icon,
  Layout,
  MailtoLink,
  Row,
} from '@openedx/paragon';
import { Add as AddIcon, Error } from '@openedx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { StudioFooter } from '@edx/frontend-component-footer';
import { getConfig } from '@edx/frontend-platform';

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

const StudioHome = ({ intl }) => {
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
    setShowNewCourseContainer,
    dispatch,
  } = useStudioHome();

  const {
    userIsActive,
    studioShortName,
    studioRequestEmail,
    libraryAuthoringMfeUrl,
    redirectToLibraryAuthoringMfe,
  } = studioHomeData;

  function getHeaderButtons() {
    const headerButtons = [];

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

    let libraryHref = `${getConfig().STUDIO_BASE_URL}/home_library`;
    if (redirectToLibraryAuthoringMfe) {
      libraryHref = `${libraryAuthoringMfeUrl}/create`;
    }

    headerButtons.push(
      <Button
        variant="outline-primary"
        iconBefore={AddIcon}
        size="sm"
        disabled={showNewCourseContainer}
        href={libraryHref}
        data-testid="new-library-button"
      >
        {intl.formatMessage(messages.addNewLibraryBtnText)}
      </Button>,
    );

    return headerButtons;
  }

  const headerButtons = userIsActive ? getHeaderButtons() : [];
  if (isLoadingPage) {
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
              tabsData={studioHomeData}
              showNewCourseContainer={showNewCourseContainer}
              onClickNewCourse={() => setShowNewCourseContainer(true)}
              isShowProcessing={isShowProcessing}
              dispatch={dispatch}
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

StudioHome.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(StudioHome);
