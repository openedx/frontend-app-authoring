import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Container,
  Layout,
  TransitionReplace,
} from '@edx/paragon';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@edx/paragon/icons';

import SubHeader from '../generic/sub-header/SubHeader';
import { RequestStatus } from '../data/constants';
import InternetConnectionAlert from '../generic/internet-connection-alert';
import AlertMessage from '../generic/alert-message';
import HeaderNavigations from './header-navigations/HeaderNavigations';
import OutlineSideBar from './outline-sidebar/OutlineSidebar';
import { useCourseOutline } from './hooks';
import StatusBar from './status-bar/StatusBar';
import EnableHighlightsModal from './enable-highlights-modal/EnableHighlightsModal';
import SectionCard from './section-card/SectionCard';
import messages from './messages';

const CourseOutline = ({ courseId }) => {
  const intl = useIntl();

  const {
    savingStatus,
    statusBarData,
    sectionsList,
    isLoading,
    isReIndexShow,
    showErrorAlert,
    showSuccessAlert,
    isSectionsExpanded,
    isEnableHighlightsModalOpen,
    isInternetConnectionAlertFailed,
    isDisabledReindexButton,
    headerNavigationsActions,
    openEnableHighlightsModal,
    closeEnableHighlightsModal,
    handleEnableHighlightsSubmit,
    handleInternetConnectionFailed,
  } = useCourseOutline({ courseId });

  if (isLoading) {
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <></>;
  }

  return (
    <>
      <Container size="xl" className="m-4">
        <section className="course-outline-container mb-4 mt-5">
          <TransitionReplace>
            {showSuccessAlert ? (
              <AlertMessage
                key={intl.formatMessage(messages.alertSuccessAriaLabelledby)}
                show={showSuccessAlert}
                variant="success"
                icon={CheckCircleIcon}
                title={intl.formatMessage(messages.alertSuccessTitle)}
                description={intl.formatMessage(messages.alertSuccessDescription)}
                aria-hidden="true"
                aria-labelledby={intl.formatMessage(messages.alertSuccessAriaLabelledby)}
                aria-describedby={intl.formatMessage(messages.alertSuccessAriaDescribedby)}
              />
            ) : null}
          </TransitionReplace>
          <SubHeader
            className="mt-5"
            title={intl.formatMessage(messages.headingTitle)}
            subtitle={intl.formatMessage(messages.headingSubtitle)}
            withSubHeaderContent={false}
            headerActions={(
              <HeaderNavigations
                isReIndexShow={isReIndexShow}
                isSectionsExpanded={isSectionsExpanded}
                headerNavigationsActions={headerNavigationsActions}
                isDisabledReindexButton={isDisabledReindexButton}
              />
            )}
          />
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
                  <section className="course-outline-section">
                    <StatusBar
                      courseId={courseId}
                      isLaoding={isLoading}
                      statusBarData={statusBarData}
                      openEnableHighlightsModal={openEnableHighlightsModal}
                    />
                    <div className="pt-4">
                      {sectionsList.length ? sectionsList.map((section) => (
                        <SectionCard section={section} />
                      )) : null}
                    </div>
                  </section>
                </div>
              </article>
            </Layout.Element>
            <Layout.Element>
              <OutlineSideBar courseId={courseId} />
            </Layout.Element>
          </Layout>
          <EnableHighlightsModal
            isOpen={isEnableHighlightsModalOpen}
            close={closeEnableHighlightsModal}
            onEnableHighlightsSubmit={handleEnableHighlightsSubmit}
            highlightsDocUrl={statusBarData.highlightsDocUrl}
          />
        </section>
      </Container>
      <div className="alert-toast">
        <InternetConnectionAlert
          isFailed={isInternetConnectionAlertFailed}
          isQueryPending={savingStatus === RequestStatus.PENDING}
          onInternetConnectionFailed={handleInternetConnectionFailed}
        />
        {showErrorAlert && (
          <AlertMessage
            key={intl.formatMessage(messages.alertErrorTitle)}
            show={showErrorAlert}
            variant="danger"
            icon={WarningIcon}
            title={intl.formatMessage(messages.alertErrorTitle)}
            aria-hidden="true"
          />
        )}
      </div>
    </>
  );
};

CourseOutline.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CourseOutline;
