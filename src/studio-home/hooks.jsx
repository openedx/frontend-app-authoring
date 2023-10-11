import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { RequestStatus } from '../data/constants';
import { COURSE_CREATOR_STATES } from '../constants';
import { getCourseData, getSavingStatus } from '../generic/data/selectors';
import { fetchStudioHomeData } from './data/thunks';
import {
  getLoadingStatuses,
  getSavingStatuses,
  getStudioHomeData,
} from './data/selectors';
import { updateSavingStatuses } from './data/slice';

const useStudioHome = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const studioHomeData = useSelector(getStudioHomeData);
  const newCourseData = useSelector(getCourseData);
  const { studioHomeLoadingStatus } = useSelector(getLoadingStatuses);
  const savingCreateRerunStatus = useSelector(getSavingStatus);
  const {
    courseCreatorSavingStatus,
    deleteNotificationSavingStatus,
  } = useSelector(getSavingStatuses);
  const [showNewCourseContainer, setShowNewCourseContainer] = useState(false);
  const isLoadingPage = studioHomeLoadingStatus === RequestStatus.IN_PROGRESS;

  useEffect(() => {
    dispatch(fetchStudioHomeData(location.search ?? ''));
    setShowNewCourseContainer(false);
  }, [location.search]);

  useEffect(() => {
    if (courseCreatorSavingStatus === RequestStatus.SUCCESSFUL) {
      dispatch(updateSavingStatuses({ courseCreatorSavingStatus: '' }));
      dispatch(fetchStudioHomeData());
    }
  }, [courseCreatorSavingStatus]);

  useEffect(() => {
    if (deleteNotificationSavingStatus === RequestStatus.SUCCESSFUL) {
      dispatch(updateSavingStatuses({ courseCreatorSavingStatus: '' }));
      dispatch(fetchStudioHomeData());
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
  } = studioHomeData;

  const isShowOrganizationDropdown = optimizationEnabled && courseCreatorStatus === COURSE_CREATOR_STATES.granted;
  const isShowEmailStaff = courseCreatorStatus === COURSE_CREATOR_STATES.disallowedForThisSite && !!studioRequestEmail;
  const isShowProcessing = allowCourseReruns && rerunCreatorStatus && inProcessCourseActions.length > 0;
  const hasAbilityToCreateNewCourse = courseCreatorStatus === COURSE_CREATOR_STATES.granted;
  const anyQueryIsPending = [deleteNotificationSavingStatus, courseCreatorSavingStatus, savingCreateRerunStatus]
    .includes(RequestStatus.PENDING);
  const anyQueryIsFailed = [deleteNotificationSavingStatus, courseCreatorSavingStatus, savingCreateRerunStatus]
    .includes(RequestStatus.FAILED);

  return {
    isLoadingPage,
    newCourseData,
    studioHomeData,
    isShowProcessing,
    anyQueryIsFailed,
    isShowEmailStaff,
    anyQueryIsPending,
    showNewCourseContainer,
    courseCreatorSavingStatus,
    isShowOrganizationDropdown,
    hasAbilityToCreateNewCourse,
    deleteNotificationSavingStatus,
    dispatch,
    setShowNewCourseContainer,
  };
};

// eslint-disable-next-line import/prefer-default-export
export { useStudioHome };
