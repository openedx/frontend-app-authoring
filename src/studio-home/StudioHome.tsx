import { useCallback } from 'react';
import {
  Icon,
  MailtoLink,
  Row,
} from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { useLocation } from 'react-router-dom';

import { Plus } from '@untitledui/icons';
import Button from 'shared/Components/Common/Button';
import { MainCardLayout } from 'shared/Components/Common/Layouts/MainCardLayout';
import Loading from '../generic/Loading';
import InternetConnectionAlert from '../generic/internet-connection-alert';
import SubHeader from '../generic/sub-header/SubHeader';
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
  } = useStudioHome();

  const {
    userIsActive,
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

    if (hasAbilityToCreateNewCourse) {
      headerButtons.push(
        <Button
          className="!tw-w-auto tw-border-gray-300 "
          variant="brand"
          iconBefore={Plus}
          size="sm"
          disabled={false}
          onClick={() => setShowNewCourseContainer(true)}
          labels={{ default: intl.formatMessage(messages.addNewCourseBtnText) }}
        />,
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
      <section className="tw-flex tw-flex-col tw-gap-8 tw-overflow-auto tw-flex-1 tw-min-h-0 tw-pb-8">
        {showNewCourseContainer && (
        <CreateNewCourseForm handleOnClickCancel={() => setShowNewCourseContainer(false)} />
        )}
        {isShowOrganizationDropdown && <OrganizationSection />}
        <TabsSection
          showNewCourseContainer={showNewCourseContainer}
          onClickNewCourse={() => setShowNewCourseContainer(true)}
          isShowProcessing={isShowProcessing && !isFiltered}
          isPaginationCoursesEnabled={isPaginationCoursesEnabled}
        />
      </section>
    );
  };

  return (
    <div className="tw-h-screen tw-w-full tw-p-3">
      <MainCardLayout>
        <section className="tw-h-full tw-flex tw-flex-col">
          <article className="studio-home-sub-header">
            <section>
              <SubHeader
                hideBorder
                title={intl.formatMessage(messages.headingTitle)}
                headerActions={headerButtons}
              />
            </section>
          </article>
          {getMainBody()}
        </section>
        <div className="alert-toast">
          <InternetConnectionAlert
            isFailed={anyQueryIsFailed}
            isQueryPending={anyQueryIsPending}
          />
        </div>
      </MainCardLayout>
    </div>
  );
};

export default StudioHome;
