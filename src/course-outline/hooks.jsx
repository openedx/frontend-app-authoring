import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { fetchCourseOutlineIndexQuery } from './data/thunk';
import { getOutlineReIndexLink } from './data/selectors';

const useCourseOutline = ({ courseId }) => {
  const dispatch = useDispatch();
  const reIndexLink = useSelector(getOutlineReIndexLink);
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
    isReIndexShow: Boolean(reIndexLink),
    isSectionsExpanded,
    headerNavigationsActions,
  };
};

// eslint-disable-next-line import/prefer-default-export
export { useCourseOutline };
