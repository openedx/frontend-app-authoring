import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { addModel } from '../generic/model-store';
import { getCourseDetail } from './api';
import {
  updateStatus,
  updateCanChangeProviders,
} from './slice';
import { RequestStatus } from './constants';

// Función helper para reintentar cuando el curso no está listo
async function retryOnNotReady<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 10,
  initialDelay: number = 10000,
  backoffMultiplier: number = 1.5
): Promise<T> {
  let delay = initialDelay;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error: any) {
      const isNotReady = error?.response?.status === 202 || 
                        (error?.response?.status === 404 && i < 10); 
      if (isNotReady && i < maxRetries - 1) {
        console.log(`[CourseDetail] Course not ready, retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= backoffMultiplier; // Incrementar el delay exponencialmente
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded while waiting for course to be ready');
}

export function fetchCourseDetail(courseId) {
  return async (dispatch) => {
    dispatch(updateStatus({ courseId, status: RequestStatus.IN_PROGRESS }));

    try {
      // Envolver la llamada API con retry logic
      const courseDetail = await retryOnNotReady(
        () => getCourseDetail(courseId, getAuthenticatedUser().username),
        10,  // maxRetries
        10000 // initialDelay (2 segundos)
      );
      dispatch(updateStatus({ courseId, status: RequestStatus.SUCCESSFUL }));
      dispatch(addModel({ modelType: 'courseDetails', model: courseDetail }));
      dispatch(updateCanChangeProviders({
        canChangeProviders: getAuthenticatedUser().administrator || new Date(courseDetail.start) > new Date(),
      }));
    } catch (error) {
      console.error('[CourseDetail] Error fetching course detail:', error);
      
      if ((error as any).response && (error as any).response.status === 404) {
        dispatch(updateStatus({ courseId, status: RequestStatus.NOT_FOUND }));
      } else {
        dispatch(updateStatus({ courseId, status: RequestStatus.FAILED }));
      }
    }
  };
}