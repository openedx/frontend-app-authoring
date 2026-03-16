import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  useLocation,
} from 'react-router-dom';
import { StudioFooterSlot } from '@edx/frontend-component-footer';
import Header from './header';
import NotFoundAlert from './generic/NotFoundAlert';
import PermissionDeniedAlert from './generic/PermissionDeniedAlert';
import { fetchOnlyStudioHomeData } from './studio-home/data/thunks';
import { getCourseAppsApiStatus } from './pages-and-resources/data/selectors';
import { RequestStatus } from './data/constants';
import Loading from './generic/Loading';
import { useCourseAuthoringContext } from './CourseAuthoringContext';

interface Props {
  children?: React.ReactNode;
}

const CourseAuthoringPage = ({ children }: Props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchOnlyStudioHomeData());
  }, []);

  const { courseId, courseDetails, courseDetailStatus } = useCourseAuthoringContext();
  const courseNumber = courseDetails?.number;
  const courseOrg = courseDetails?.org;
  const courseTitle = courseDetails?.name;
  const inProgress = courseDetailStatus === RequestStatus.IN_PROGRESS || courseDetailStatus === RequestStatus.PENDING;
  const courseAppsApiStatus = useSelector(getCourseAppsApiStatus);
  const { pathname } = useLocation();
  const isEditor = pathname.includes('/editor');

  if (courseDetailStatus === RequestStatus.NOT_FOUND && !isEditor) {
    return (
      <NotFoundAlert />
    );
  }
  if (courseAppsApiStatus === RequestStatus.DENIED) {
    return (
      <PermissionDeniedAlert />
    );
  }
  return (
    <div>
      {/* While V2 Editors are temporarily served from their own pages
      using url pattern containing /editor/,
      we shouldn't have the header and footer on these pages.
      This functionality will be removed in TNL-9591 */}
      {inProgress ? !isEditor && <Loading />
        : (!isEditor && (
          <Header
            number={courseNumber}
            org={courseOrg}
            title={courseTitle}
            contextId={courseId}
            containerProps={{
              size: 'fluid',
            }}
          />
        )
        )}
      {children}
      {!inProgress && !isEditor && <StudioFooterSlot />}
    </div>
  );
};

export default CourseAuthoringPage;
