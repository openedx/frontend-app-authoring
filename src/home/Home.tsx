import {
  Icon, Row,
} from '@openedx/paragon';
import { Error } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useAppEventContext } from 'context/AppEventContext';
import { useEffect } from 'react';
import { SocketEvent } from 'context/AppEventContext/types';
import { capitalizeString } from '../utils';

import Loading from '../generic/Loading';
import InternetConnectionAlert from '../generic/internet-connection-alert';
import VerifyEmailLayout from './verify-email-layout';
import CreateNewCourseForm from './create-new-course-form';
import messages from './messages';
import { useStudioHome } from './hooks';
import AlertMessage from '../generic/alert-message';
import FeaturedCourses from './featured-courses';
import FeaturedLibraries from './featured-libraries';

const Home = () => {
  const intl = useIntl();
  const { registerEventCallback } = useAppEventContext();

  const isPaginationCoursesEnabled = getConfig().ENABLE_HOME_PAGE_COURSE_API_V2;
  const {
    isLoadingPage,
    isFailedLoadingPage,
    studioHomeData,
    anyQueryIsFailed,
    anyQueryIsPending,
    showNewCourseContainer,
    hasAbilityToCreateNewCourse,
    isFiltered,
    setShowNewCourseContainer,
  } = useStudioHome();

  const { username } = getAuthenticatedUser() as { username: string };

  const { userIsActive } = studioHomeData;

  // TODO: This is an example of how to register an event callback, remove this after testing
  useEffect(() => {
    const unregister = registerEventCallback(SocketEvent.OPEN_CANVAS, (data) => {
      console.log('registered event callback for open_canvas: ', data);
    });

    return () => {
      unregister();
    };
  }, [registerEventCallback]);

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
      <section className="tw-flex tw-flex-col tw-gap-8 tw-overflow-auto tw-h-0 tw-flex-1 tw-min-h-0 tw-pb-8">
        {showNewCourseContainer ? (
          <CreateNewCourseForm handleOnClickCancel={() => setShowNewCourseContainer(false)} />
        ) : (
          <FeaturedCourses
            hasAbilityToCreateNewCourse={hasAbilityToCreateNewCourse}
            onClickNewCourse={() => setShowNewCourseContainer(true)}
            isPaginationCoursesEnabled={isPaginationCoursesEnabled}
          />
        )}
        <FeaturedLibraries />
      </section>
    );
  };

  return (
    <>
      <section className="tw-h-full tw-flex tw-flex-col tw-gap-8">
        <article className="studio-home-sub-header">
          <section>
            <h2 className="tw-font-medium tw-text-4xl tw-leading-[44px] tw-text-gray-900 tw-tracking-[-0.72px] tw-mb-0">
              {intl.formatMessage(messages.headingTitle, {
                userName: capitalizeString(username) || 'Teacher',
              })}
            </h2>
          </section>
        </article>
        {getMainBody()}
      </section>
      <div className="alert-toast">
        <InternetConnectionAlert isFailed={anyQueryIsFailed} isQueryPending={anyQueryIsPending} />
      </div>
    </>
  );
};

export default Home;
