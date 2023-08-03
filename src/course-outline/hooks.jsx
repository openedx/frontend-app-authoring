import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchCourseOutlineIndexQuery } from './data/thunk';
import { getLoadingOutlineIndexStatus, getOutlineIndexData } from './data/selectors';
import { RequestStatus } from '../data/constants';

const useCourseOutline = ({ courseId }) => {
  const dispatch = useDispatch();
  const { reindexLink } = useSelector(getOutlineIndexData);
  const { outlineIndexLoadingStatus } = useSelector(getLoadingOutlineIndexStatus);

  const [isSectionsExpanded, setSectionsExpanded] = useState(false);

  const headerNavigationsActions = {
    handleNewSection: () => {
      // TODO add handler
    },
    handleReIndex: () => {
      // TODO add handler
    },
    handleExpandAll: () => {
      setSectionsExpanded((prevState) => !prevState);
    },
    handleViewLive: () => {
      // TODO add handler
    },
  };

  useEffect(() => {
    dispatch(fetchCourseOutlineIndexQuery(courseId));
  }, [courseId]);

  return {
    isLoading: outlineIndexLoadingStatus === RequestStatus.IN_PROGRESS,
    isReIndexShow: Boolean(reindexLink),
    isSectionsExpanded,
    headerNavigationsActions,
  };
};

// eslint-disable-next-line import/prefer-default-export
export { useCourseOutline };
