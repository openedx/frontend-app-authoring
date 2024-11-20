import { RequestStatus } from '../../data/constants';

import { getHelpUrls } from './api';
import { updateLoadingHelpUrlsStatus, updatePages } from './slice';

export function fetchHelpUrls() {
  return async (dispatch) => {
    dispatch(updateLoadingHelpUrlsStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const urls = await getHelpUrls();

      dispatch(updatePages(urls));

      dispatch(updateLoadingHelpUrlsStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      dispatch(updateLoadingHelpUrlsStatus({ status: RequestStatus.FAILED }));

      return false;
    }
  };
}
