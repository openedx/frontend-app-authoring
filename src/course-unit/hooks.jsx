import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppContext } from '@edx/frontend-platform/react';

import { RequestStatus } from '../data/constants';
import {
  fetchCourseUnitQuery,
  editCourseItemQuery,
} from './data/thunk';
import {
  getCourseUnitData,
  getLoadingStatus,
  getSavingStatus,
} from './data/selectors';
import { updateSavingStatus } from './data/slice';
import { getUnitViewLivePath, getUnitPreviewPath } from './utils';

const useCourseUnit = ({ courseId, blockId }) => {
  const dispatch = useDispatch();

  const { config } = useContext(AppContext);
  const courseUnit = useSelector(getCourseUnitData);
  const savingStatus = useSelector(getSavingStatus);
  const loadingStatus = useSelector(getLoadingStatus);

  const [isTitleEditFormOpen, toggleTitleEditForm] = useState(false);

  const unitTitle = courseUnit.metadata?.displayName || '';

  const headerNavigationsActions = {
    handleViewLive: () => {
      window.open(config.LMS_BASE_URL + getUnitViewLivePath(courseId, blockId), '_blank');
    },
    handlePreview: () => {
      const sectionId = courseUnit.ancestorInfo?.ancestors[0]?.id.split('@').pop();
      window.open(config.PREVIEW_BASE_URL + getUnitPreviewPath(courseId, sectionId, blockId), '_blank');
    },
  };

  const handleInternetConnectionFailed = () => {
    dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
  };

  const handleTitleEdit = () => {
    toggleTitleEditForm(!isTitleEditFormOpen);
  };

  const handleTitleEditSubmit = (displayName) => {
    if (unitTitle !== displayName) {
      dispatch(editCourseItemQuery(blockId, displayName));
    }

    handleTitleEdit();
  };

  useEffect(() => {
    dispatch(fetchCourseUnitQuery(blockId));
  }, [courseId]);

  return {
    courseUnit,
    unitTitle,
    isLoading: loadingStatus.fetchUnitLoadingStatus === RequestStatus.IN_PROGRESS,
    isTitleEditFormOpen,
    isInternetConnectionAlertFailed: savingStatus === RequestStatus.FAILED,
    handleInternetConnectionFailed,
    headerNavigationsActions,
    handleTitleEdit,
    handleTitleEditSubmit,
  };
};

// eslint-disable-next-line import/prefer-default-export
export { useCourseUnit };
