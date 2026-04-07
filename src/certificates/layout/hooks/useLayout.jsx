import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { RequestStatus } from '../../../data/constants';
import { getSavingStatus, getErrorMessage } from '../../data/selectors';

const useLayout = () => {
  const savingStatus = useSelector(getSavingStatus);
  const errorMessage = useSelector(getErrorMessage);

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [savingStatus]);

  return {
    errorMessage,
    savingStatus,
  };
};

export default useLayout;
