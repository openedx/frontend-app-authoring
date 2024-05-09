import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { RequestStatus } from '../../../data/constants';
import { getProcessingNotification } from '../../../generic/processing-notification/data/selectors';
import { getSavingStatus, getErrorMessage } from '../../data/selectors';

const useLayout = () => {
  const savingStatus = useSelector(getSavingStatus);
  const errorMessage = useSelector(getErrorMessage);

  const {
    isShow: isShowProcessingNotification,
    title: processingNotificationTitle,
  } = useSelector(getProcessingNotification);

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [savingStatus]);

  return {
    errorMessage,
    savingStatus,
    isShowProcessingNotification,
    processingNotificationTitle,
  };
};

export default useLayout;
