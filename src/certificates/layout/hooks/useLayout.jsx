import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { RequestStatus } from '../../../data/constants';
import { getProcessingNotification } from '../../../generic/processing-notification/data/selectors';
import { getSavingStatus, getSavingImageStatus } from '../../data/selectors';

const useLayout = () => {
  const savingStatus = useSelector(getSavingStatus);
  const savingImageStatus = useSelector(getSavingImageStatus);
  const {
    isShow: isShowProcessingNotification,
    title: processingNotificationTitle,
  } = useSelector(getProcessingNotification);

  const isQueryPending = savingStatus === RequestStatus.PENDING || savingImageStatus === RequestStatus.PENDING;
  const isQueryFailed = savingStatus === RequestStatus.FAILED || savingImageStatus === RequestStatus.FAILED;

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [savingStatus]);

  return {
    isQueryPending,
    isQueryFailed,
    isShowProcessingNotification,
    processingNotificationTitle,
  };
};

export default useLayout;
