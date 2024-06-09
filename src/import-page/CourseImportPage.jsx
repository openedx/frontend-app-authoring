/* eslint-disable max-len */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Container, Layout,
} from '@openedx/paragon';
import Cookies from 'universal-cookie';
import { Helmet } from 'react-helmet';

import SubHeader from '../generic/sub-header/SubHeader';
import InternetConnectionAlert from '../generic/internet-connection-alert';
import { RequestStatus } from '../data/constants';
import { useModel } from '../generic/model-store';
import ConnectionErrorAlert from '../generic/ConnectionErrorAlert';
import {
  updateFileName, updateImportTriggered, updateSavingStatus, updateSuccessDate,
} from './data/slice';
import ImportStepper from './import-stepper/ImportStepper';
import { getImportTriggered, getLoadingStatus, getSavingStatus } from './data/selectors';
import { LAST_IMPORT_COOKIE_NAME } from './data/constants';
import ImportSidebar from './import-sidebar/ImportSidebar';
import FileSection from './file-section/FileSection';
import messages from './messages';

const CourseImportPage = ({ intl, courseId }) => {
  const dispatch = useDispatch();
  const cookies = new Cookies();
  const courseDetails = useModel('courseDetails', courseId);
  const importTriggered = useSelector(getImportTriggered);
  const savingStatus = useSelector(getSavingStatus);
  const loadingStatus = useSelector(getLoadingStatus);
  const anyRequestFailed = savingStatus === RequestStatus.FAILED || loadingStatus === RequestStatus.FAILED;
  const isLoadingDenied = loadingStatus === RequestStatus.DENIED;
  const anyRequestInProgress = savingStatus === RequestStatus.PENDING || loadingStatus === RequestStatus.IN_PROGRESS;

  useEffect(() => {
    const cookieData = cookies.get(LAST_IMPORT_COOKIE_NAME);
    if (cookieData) {
      dispatch(updateSavingStatus(RequestStatus.SUCCESSFUL));
      dispatch(updateImportTriggered(true));
      dispatch(updateFileName(cookieData.fileName));
      dispatch(updateSuccessDate(cookieData.date));
    }
  }, []);

  if (isLoadingDenied) {
    return (
      <Container size="xl" className="course-unit px-4 mt-4">
        <ConnectionErrorAlert />
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {intl.formatMessage(messages.pageTitle, {
            headingTitle: intl.formatMessage(messages.headingTitle),
            courseName: courseDetails?.name,
            siteName: process.env.SITE_NAME,
          })}
        </title>
      </Helmet>
      <Container size="xl" className="mt-4 px-4 import">
        <section className="setting-items mb-4">
          <Layout
            lg={[{ span: 9 }, { span: 3 }]}
            md={[{ span: 9 }, { span: 3 }]}
            sm={[{ span: 9 }, { span: 3 }]}
            xs={[{ span: 9 }, { span: 3 }]}
            xl={[{ span: 9 }, { span: 3 }]}
          >
            <Layout.Element>
              <article>
                <SubHeader
                  title={intl.formatMessage(messages.headingTitle)}
                  subtitle={intl.formatMessage(messages.headingSubtitle)}
                />
                <p className="small">{intl.formatMessage(messages.description1)}</p>
                <p className="small">{intl.formatMessage(messages.description2)}</p>
                <p className="small">{intl.formatMessage(messages.description3)}</p>
                <FileSection courseId={courseId} />
                {importTriggered && <ImportStepper courseId={courseId} />}
              </article>
            </Layout.Element>
            <Layout.Element>
              <ImportSidebar courseId={courseId} />
            </Layout.Element>
          </Layout>
        </section>
      </Container>
      <div className="alert-toast">
        <InternetConnectionAlert
          isFailed={anyRequestFailed}
          isQueryPending={anyRequestInProgress}
          onInternetConnectionFailed={() => null}
        />
      </div>
    </>
  );
};

CourseImportPage.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
};

CourseImportPage.defaultProps = {};

export default injectIntl(CourseImportPage);
