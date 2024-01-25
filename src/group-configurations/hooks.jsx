import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';

import { RequestStatus } from '../data/constants';
import { fetchGroupConfigurationsQuery } from './data/thunk';
import { getGroupConfigurationsData, getLoadingStatus } from './data/selectors';

const useGroupConfigurations = (courseId) => {
  const dispatch = useDispatch();

  const groupConfigurations = useSelector(getGroupConfigurationsData);
  const loadingStatus = useSelector(getLoadingStatus);

  useEffect(() => {
    dispatch(fetchGroupConfigurationsQuery(courseId));
  }, [courseId]);

  return {
    isLoading: loadingStatus === RequestStatus.IN_PROGRESS,
    groupConfigurations,
  };
};

// eslint-disable-next-line import/prefer-default-export
export { useGroupConfigurations };
