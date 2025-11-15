import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { addModel } from '../generic/model-store';
import { getCourseDetail } from './api';
import {
  updateStatus,
  updateCanChangeProviders,
} from './slice';
import { RequestStatus } from './constants';

/**
 * Retry configuration - can be overridden in tests
 */
export const retryConfig = {
  maxRetries: 10,
  initialDelay: 2000,
  backoffMultiplier: 1.5,
  enabled: true,
};

/**
 * Retry an API call if the course is not ready yet (202 or 404 status).
 * Uses exponential backoff for retries.
 */
async function retryOnNotReady<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = retryConfig.maxRetries,
  delayMs: number = retryConfig.initialDelay,
  attempt: number = 1,
  backoffMultiplier: number = retryConfig.backoffMultiplier,
): Promise<T> {
  // Skip retries if disabled (useful for tests)
  if (!retryConfig.enabled) {
    return apiCall();
  }

  try {
    return await apiCall();
  } catch (error: any) {
    const isNotReady = error?.response?.status === 202
      || error?.response?.status === 404;
    const canRetry = attempt < maxRetries;

    if (isNotReady && canRetry) {
      const nextDelay = delayMs * backoffMultiplier ** (attempt - 1);

      await new Promise((resolve) => {
        setTimeout(resolve, nextDelay);
      });

      return retryOnNotReady(
        apiCall,
        maxRetries,
        delayMs,
        attempt + 1,
        backoffMultiplier,
      );
    }

    throw error;
  }
}

export function fetchCourseDetail(courseId: string) {
  return async (dispatch: any) => {
    dispatch(updateStatus({ courseId, status: RequestStatus.IN_PROGRESS }));

    try {
      const courseDetail = await retryOnNotReady(
        () => getCourseDetail(courseId, getAuthenticatedUser().username),
      );

      dispatch(updateStatus({ courseId, status: RequestStatus.SUCCESSFUL }));
      dispatch(addModel({ modelType: 'courseDetails', model: courseDetail }));
      dispatch(updateCanChangeProviders({
        canChangeProviders: getAuthenticatedUser().administrator
          || new Date(courseDetail.start) > new Date(),
      }));
    } catch (error: any) {
      if (error?.response?.status === 404) {
        dispatch(updateStatus({ courseId, status: RequestStatus.NOT_FOUND }));
      } else {
        dispatch(updateStatus({ courseId, status: RequestStatus.FAILED }));
      }
    }
  };
}
