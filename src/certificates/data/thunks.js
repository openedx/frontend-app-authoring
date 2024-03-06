import { RequestStatus } from '../../data/constants';
import {
  hideProcessingNotification,
  showProcessingNotification,
} from '../../generic/processing-notification/data/slice';
import { handleResponseErrors } from '../../generic/saving-error-alert';
import { NOTIFICATION_MESSAGES } from '../../constants';
import {
  getCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  updateActiveStatus,
} from './api';
import {
  fetchCertificatesSuccess,
  updateLoadingStatus,
  updateSavingStatus,
  createCertificateSuccess,
  updateCertificateSuccess,
  deleteCertificateSuccess,
} from './slice';
import { ACTIVATION_MESSAGES } from './constants';

export function fetchCertificates(courseId) {
  return async (dispatch) => {
    dispatch(updateLoadingStatus({ status: RequestStatus.IN_PROGRESS }));

    try {
      const certificates = await getCertificates(courseId);

      dispatch(fetchCertificatesSuccess(certificates));
      dispatch(updateLoadingStatus({ status: RequestStatus.SUCCESSFUL }));
    } catch (error) {
      if (error.response && error.response.status === 403) {
        dispatch(updateLoadingStatus({ courseId, status: RequestStatus.DENIED }));
      } else {
        dispatch(updateLoadingStatus({ courseId, status: RequestStatus.FAILED }));
      }
    }
  };
}

export function createCourseCertificate(courseId, certificate) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      const certificateValues = await createCertificate(courseId, certificate);
      dispatch(createCertificateSuccess(certificateValues));
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      return handleResponseErrors(error, dispatch, updateSavingStatus);
    } finally {
      dispatch(hideProcessingNotification());
    }
  };
}

export function updateCourseCertificate(courseId, certificate) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.saving));

    try {
      const certificatesValues = await updateCertificate(courseId, certificate);
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      dispatch(updateCertificateSuccess(certificatesValues));
      return true;
    } catch (error) {
      return handleResponseErrors(error, dispatch, updateSavingStatus);
    } finally {
      dispatch(hideProcessingNotification());
    }
  };
}

export function deleteCourseCertificate(courseId, certificateId) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    dispatch(showProcessingNotification(NOTIFICATION_MESSAGES.deleting));

    try {
      const certificatesValues = await deleteCertificate(courseId, certificateId);
      dispatch(deleteCertificateSuccess(certificatesValues));
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      return true;
    } catch (error) {
      return handleResponseErrors(error, dispatch, updateSavingStatus);
    } finally {
      dispatch(hideProcessingNotification());
    }
  };
}

export function updateCertificateActiveStatus(courseId, path, activationStatus) {
  return async (dispatch) => {
    dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));

    dispatch(showProcessingNotification(
      activationStatus ? ACTIVATION_MESSAGES.activating : ACTIVATION_MESSAGES.deactivating,
    ));

    try {
      await updateActiveStatus(path, activationStatus);
      dispatch(updateSavingStatus({ status: RequestStatus.SUCCESSFUL }));
      dispatch(fetchCertificates(courseId));
      return true;
    } catch (error) {
      return handleResponseErrors(error, dispatch, updateSavingStatus);
    } finally {
      dispatch(hideProcessingNotification());
    }
  };
}
