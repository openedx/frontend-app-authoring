import { logError } from '@edx/frontend-platform/logging';

import { CLIPBOARD_STATUS, NOTIFICATION_MESSAGES } from '../../constants';
import {
  hideProcessingNotification,
  showProcessingNotification,
} from '../processing-notification/data/slice';
import { RequestStatus } from '../../data/constants';
import {
  fetchOrganizations,
  updatePostErrors,
  updateLoadingStatuses,
  updateRedirectUrlObj,
  updateCourseRerunData,
  updateSavingStatus,
  updateClipboardData,
} from './slice';
import {
  createOrRerunCourse,
  getOrganizations,
  getCourseRerun,
  updateClipboard,
  getClipboard,
} from './api';

export function fetchOrganizationsQuery() {
  return async (dispatch) => {
    try {
      const organizations = await getOrganizations();
      dispatch(fetchOrganizations(organizations));
      dispatch(updateLoadingStatuses({ organizationLoadingStatus: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateLoadingStatuses({ organizationLoadingStatus: RequestStatus.FAILED }));
    }
  };
}

export function fetchCourseRerunQuery(courseId) {
  return async (dispatch) => {
    try {
      const courseRerun = await getCourseRerun(courseId);
      dispatch(updateCourseRerunData(courseRerun));
      dispatch(updateLoadingStatuses({ courseRerunLoadingStatus: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      dispatch(updateLoadingStatuses({ courseRerunLoadingStatus: RequestStatus.FAILED }));
    }
  };
}

export function updateCreateOrRerunCourseQuery(courseData) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));

    try {
      const response = await createOrRerunCourse(courseData);
      dispatch(updateRedirectUrlObj('url' in response ? response : {}));
      dispatch(updatePostErrors('errMsg' in response ? response : {}));
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
      return false;
    }
  };
}

export function copyToClipboard(usageKey) {
  const POLL_INTERVAL_MS = 1000; // Timeout duration for polling in milliseconds

  return async (dispatch) => {
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.copying));
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));

    try {
      let clipboardData = await updateClipboard(usageKey);

      while (clipboardData.content?.status === CLIPBOARD_STATUS.loading) {
        // eslint-disable-next-line no-await-in-loop,no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        clipboardData = await getClipboard(); // eslint-disable-line no-await-in-loop
      }

      if (clipboardData.content?.status === CLIPBOARD_STATUS.ready) {
        dispatch(updateClipboardData(clipboardData));
        dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      } else {
        throw new Error(`Unexpected clipboard status "${clipboardData.content?.status}" in successful API response.`);
      }
    } catch (error) {
      logError('Error copying to clipboard:', error);
    } finally {
      dispatch(hideProcessingNotification());
    }
  };
}
