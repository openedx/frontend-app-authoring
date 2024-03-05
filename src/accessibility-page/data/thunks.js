import { RequestStatus } from '../../data/constants';
import { postAccessibilityForm } from './api';
import { updateSavingStatus } from './slice';

function submitAccessibilityForm({ email, name, message }) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      await postAccessibilityForm({ email, name, message });
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      if (error.response && error.response.status === 429) {
        dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      } else {
        dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      }
    }
  };
}

export default submitAccessibilityForm;
