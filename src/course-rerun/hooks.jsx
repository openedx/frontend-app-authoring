import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useNavigate } from 'react-router-dom';

import { RequestStatus } from '../data/constants';
import { updateSavingStatus } from '../generic/data/slice';
import {
  getSavingStatus,
  getRedirectUrlObj,
  getCourseRerunData,
  getCourseData,
} from '../generic/data/selectors';
import { fetchCourseRerunQuery, fetchOrganizationsQuery } from '../generic/data/thunks';
import { fetchStudioHomeData } from '../studio-home/data/thunks';

const useCourseRerun = (courseId) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const savingStatus = useSelector(getSavingStatus);
  const courseData = useSelector(getCourseData);
  const courseRerunData = useSelector(getCourseRerunData);
  const redirectUrlObj = useSelector(getRedirectUrlObj);

  const {
    displayName = '',
    org = '',
    run = '',
    number = '',
  } = courseRerunData;
  const originalCourseData = `${org} ${number} ${run}`;
  const initialFormValues = {
    displayName,
    org,
    number,
    run: '',
  };

  useEffect(() => {
    dispatch(fetchStudioHomeData());
    dispatch(fetchCourseRerunQuery(courseId));
    dispatch(fetchOrganizationsQuery());
  }, []);

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      dispatch(updateSavingStatus({ status: '' }));
      const { url } = redirectUrlObj;
      if (url) {
        navigate('/home');
      }
    }
  }, [savingStatus]);

  return {
    intl,
    courseData,
    displayName,
    savingStatus,
    initialFormValues,
    originalCourseData,
    dispatch,
  };
};

// eslint-disable-next-line import/prefer-default-export
export { useCourseRerun };
