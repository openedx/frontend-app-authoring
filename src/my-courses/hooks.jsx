/* eslint-disable linebreak-style */
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getConfig } from '@edx/frontend-platform';

import { RequestStatus } from '../data/constants';
import { COURSE_CREATOR_STATES } from '../constants';
import { getCourseData, getSavingStatus } from '../generic/data/selectors';
import { fetchMyCoursesData } from './data/thunks';
import {
  getLoadingStatuses,
  getSavingStatuses,
  getMyCoursesData,
  getMyCoursesParams,
} from './data/selectors';
import { updateSavingStatuses } from './data/slice';

const useMyCourses = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const isPaginated = getConfig().ENABLE_HOME_PAGE_COURSE_API_V2;
  const myCoursesData = useSelector(getMyCoursesData);
  const myCoursesParams = useSelector(getMyCoursesParams);
  const { isFiltered } = myCoursesParams;
  const newCourseData = useSelector(getCourseData);
  const { myCoursesLoadingStatus } = useSelector(getLoadingStatuses);
  const savingCreateRerunStatus = useSelector(getSavingStatus);
  const {
    courseCreatorSavingStatus,
    deleteNotificationSavingStatus,
  } = useSelector(getSavingStatuses);
  const [showNewCourseContainer, setShowNewCourseContainer] = useState(false);
  const isLoadingPage = myCoursesLoadingStatus === RequestStatus.IN_PROGRESS;
  const isFailedLoadingPage = myCoursesLoadingStatus === RequestStatus.FAILED;

  useEffect(() => {
    if (!isPaginated) {
      dispatch(fetchMyCoursesData(location.search ?? ''));
      setShowNewCourseContainer(false);
    }
  }, [location.search]);

  useEffect(() => {
    if (isPaginated) {
      const firstPage = 1;
      dispatch(fetchMyCoursesData(location.search ?? '', false, { page: firstPage, order: 'display_name' }, true));
    }
  }, []);

  useEffect(() => {
    if (courseCreatorSavingStatus === RequestStatus.SUCCESSFUL) {
      dispatch(updateSavingStatuses({ courseCreatorSavingStatus: '' }));
      dispatch(fetchMyCoursesData());
    }
  }, [courseCreatorSavingStatus]);

  useEffect(() => {
    if (deleteNotificationSavingStatus === RequestStatus.SUCCESSFUL) {
      dispatch(updateSavingStatuses({ courseCreatorSavingStatus: '' }));
      dispatch(fetchMyCoursesData());
    } else if (deleteNotificationSavingStatus === RequestStatus.FAILED) {
      dispatch(updateSavingStatuses({ deleteNotificationSavingStatus: '' }));
    }
  }, [deleteNotificationSavingStatus]);

  const {
    allowCourseReruns,
    rerunCreatorStatus,
    optimizationEnabled,
    studioRequestEmail,
    inProcessCourseActions,
    courseCreatorStatus,
    librariesV1Enabled,
    librariesV2Enabled,
  } = myCoursesData;

  const isShowOrganizationDropdown = optimizationEnabled && courseCreatorStatus === COURSE_CREATOR_STATES.granted;
  const isShowEmailStaff = courseCreatorStatus === COURSE_CREATOR_STATES.disallowedForThisSite && !!studioRequestEmail;
  const isShowProcessing = allowCourseReruns && rerunCreatorStatus && inProcessCourseActions?.length > 0;
  const hasAbilityToCreateNewCourse = courseCreatorStatus === COURSE_CREATOR_STATES.granted;
  const anyQueryIsPending = [deleteNotificationSavingStatus, courseCreatorSavingStatus, savingCreateRerunStatus]
    .includes(RequestStatus.PENDING);
  const anyQueryIsFailed = [deleteNotificationSavingStatus, courseCreatorSavingStatus, savingCreateRerunStatus]
    .includes(RequestStatus.FAILED);

  return {
    isLoadingPage,
    isFailedLoadingPage,
    newCourseData,
    myCoursesData,
    isShowProcessing,
    anyQueryIsFailed,
    isShowEmailStaff,
    anyQueryIsPending,
    showNewCourseContainer,
    courseCreatorSavingStatus,
    isShowOrganizationDropdown,
    hasAbilityToCreateNewCourse,
    isFiltered,
    setShowNewCourseContainer,
    librariesV1Enabled,
    librariesV2Enabled,
  };
};

// eslint-disable-next-line import/prefer-default-export
export { useMyCourses };
