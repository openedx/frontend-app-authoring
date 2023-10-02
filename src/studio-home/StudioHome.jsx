import React from 'react';
import {
  Button,
  Container,
  Layout,
  MailtoLink,
} from '@edx/paragon';
import { Add as AddIcon } from '@edx/paragon/icons/es5';
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

const StudioHome = ({ intl }) => {
  const {
    isLoadingPage,
    studioHomeData,
    isShowProcessing,
    anyQueryIsFailed,
    isShowEmailStaff,
    anyQueryIsPending,
    showNewCourseContainer,
    isShowOrganizationDropdown,
    hasAbilityToCreateNewCourse,
    setShowNewCourseContainer,
  } = useStudioHome();

  const {
    userIsActive,
    studioShortName,
    studioRequestEmail,
    libraryAuthoringMfeUrl,
    redirectToLibraryAuthoringMfe,
    splitStudioHome,
  } = studioHomeData;

  function getHeaderButtons() {
    const headerButtons = [];

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

    let libraryHref = `${getConfig().STUDIO_BASE_URL}/home#libraries-tab`;
    if (splitStudioHome) {
      libraryHref = `${getConfig().STUDIO_BASE_URL}/home_library`;
    }
    if (redirectToLibraryAuthoringMfe) {
      libraryHref = `${libraryAuthoringMfeUrl}/create`;
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
    }

    return headerButtons;
  }

  const headerButtons = userIsActive ? getHeaderButtons() : [];
  if (isLoadingPage) {
    return (<Loading />);
  }

  return (
    <>
      <Header isHiddenMainMenu />
      <Container size="xl" className="p-4 mt-3">
        <section className="mb-4">
          <article className="studio-home-sub-header">
            <section>
              <SubHeader
                title={intl.formatMessage(messages.headingTitle, { studioShortName })}
                headerActions={headerButtons}
              />
            </section>
          </article>
          {!userIsActive ? (
            <VerifyEmailLayout />
          ) : (
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
                  />
                </section>
              </Layout.Element>
              <Layout.Element>
                <HomeSidebar />
              </Layout.Element>
            </Layout>
          )}
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
