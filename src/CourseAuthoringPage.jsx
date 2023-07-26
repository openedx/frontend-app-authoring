import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import {
  useLocation,
} from 'react-router-dom';
import { Footer } from '@edx/frontend-lib-content-components';
import Header from './studio-header/Header';
import { fetchCourseDetail } from './data/thunks';
import { useModel } from './generic/model-store';
import PermissionDeniedAlert from './generic/PermissionDeniedAlert';
import { getCourseAppsApiStatus } from './pages-and-resources/data/selectors';
import { RequestStatus } from './data/constants';
import Loading from './generic/Loading';

const AppHeader = ({
  courseNumber, courseOrg, courseTitle, courseId,
}) => (
  <Header
    courseNumber={courseNumber}
    courseOrg={courseOrg}
    courseTitle={courseTitle}
    courseId={courseId}
  />
);

AppHeader.propTypes = {
  courseId: PropTypes.string.isRequired,
  courseNumber: PropTypes.string,
  courseOrg: PropTypes.string,
  courseTitle: PropTypes.string.isRequired,
};

AppHeader.defaultProps = {
  courseNumber: null,
  courseOrg: null,
};

const AppFooter = () => (
  <div className="mt-6">
    <Footer
      marketingBaseUrl={process.env.MARKETING_SITE_BASE_URL}
      termsOfServiceUrl={process.env.TERMS_OF_SERVICE_URL}
      privacyPolicyUrl={process.env.PRIVACY_POLICY_URL}
      supportEmail={process.env.SUPPORT_EMAIL}
      platformName={process.env.SITE_NAME}
      lmsBaseUrl={process.env.LMS_BASE_URL}
      studioBaseUrl={process.env.STUDIO_BASE_URL}
      showAccessibilityPage={process.env.ENABLE_ACCESSIBILITY_PAGE === 'true'}
    />
  </div>
);

const CourseAuthoringPage = ({ courseId, children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCourseDetail(courseId));
  }, [courseId]);

  const courseDetail = useModel('courseDetails', courseId);

  const courseNumber = courseDetail ? courseDetail.number : null;
  const courseOrg = courseDetail ? courseDetail.org : null;
  const courseTitle = courseDetail ? courseDetail.name : courseId;
  const courseAppsApiStatus = useSelector(getCourseAppsApiStatus);
  const inProgress = useSelector(state => state.courseDetail.status) === RequestStatus.IN_PROGRESS;
  const { pathname } = useLocation();
  const showHeader = !pathname.includes('/editor');

  if (courseAppsApiStatus === RequestStatus.DENIED) {
    return (
      <PermissionDeniedAlert />
    );
  }
  return (
    <div className={pathname.includes('/editor/') ? '' : 'bg-light-200'}>
      {/* While V2 Editors are temporarily served from their own pages
      using url pattern containing /editor/,
      we shouldn't have the header and footer on these pages.
      This functionality will be removed in TNL-9591 */}
      {inProgress ? showHeader && <Loading />
        : (showHeader && (
          <AppHeader
            courseNumber={courseNumber}
            courseOrg={courseOrg}
            courseTitle={courseTitle}
            courseId={courseId}
          />
        )
        )}
      {children}
      {!inProgress && showHeader && <AppFooter />}
    </div>
  );
};

CourseAuthoringPage.propTypes = {
  children: PropTypes.node,
  courseId: PropTypes.string.isRequired,
};

CourseAuthoringPage.defaultProps = {
  children: null,
};

export default CourseAuthoringPage;
