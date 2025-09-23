import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import {
  useLocation,
} from 'react-router-dom';
import { MainCardLayout } from 'shared/Components/Common/Layouts/MainCardLayout';
import { fetchCourseDetail, fetchWaffleFlags } from './data/thunks';
import { useModel } from './generic/model-store';
import NotFoundAlert from './generic/NotFoundAlert';
import PermissionDeniedAlert from './generic/PermissionDeniedAlert';
import { fetchOnlyStudioHomeData } from './studio-home/data/thunks';
import { getCourseAppsApiStatus } from './pages-and-resources/data/selectors';
import { RequestStatus } from './data/constants';
import CourseSidebar from './course-outline/course-sidebar/CourseSidebar';
import background from './assets/images/main-content-background.png';
import classNames from 'classnames';

const CourseAuthoringPage = ({ courseId, children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCourseDetail(courseId));
    dispatch(fetchWaffleFlags(courseId));
  }, [courseId]);

  useEffect(() => {
    dispatch(fetchOnlyStudioHomeData());
  }, []);

  const courseDetail = useModel('courseDetails', courseId);

  const courseNumber = courseDetail ? courseDetail.number : null;
  const courseOrg = courseDetail ? courseDetail.org : null;
  const courseTitle = courseDetail ? courseDetail.name : courseId;
  const courseAppsApiStatus = useSelector(getCourseAppsApiStatus);
  const courseDetailStatus = useSelector((state) => state.courseDetail.status);
  const inProgress = courseDetailStatus === RequestStatus.IN_PROGRESS;
  const { pathname } = useLocation();
  const isEditor = pathname.includes('/editor');

  if (courseDetailStatus === RequestStatus.NOT_FOUND && !isEditor) {
    return <NotFoundAlert />;
  }
  if (courseAppsApiStatus === RequestStatus.DENIED) {
    return <PermissionDeniedAlert />;
  }
  return (
    <div className="tw-h-screen tw-w-full tw-relative">
      <div className="tw-flex tw-h-full">
        <CourseSidebar courseId={courseId} />
        <div className="tw-flex-1 tw-p-3 tw-h-full tw-relative">
          <div
            className="tw-absolute tw-inset-3 tw-opacity-30 tw-scale-x-[-1] tw-z-0"
            style={{
              backgroundImage: `url(${background})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              borderRadius: '20px',
            }}
          />
          <div
            className={classNames(
              'tw-relative tw-z-10 tw-h-full',
              'tw-p-8 tw-pb-0 tw-flex-1',
              'tw-border tw-border-white tw-border-solid',
              'tw-rounded-[20px]',
              'tw-flex tw-flex-col tw-gap-8 tw-overflow-y-auto',
            )}
          >
            {children}
          </div>
        </div>
      </div>
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
