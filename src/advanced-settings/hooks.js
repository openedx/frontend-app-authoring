import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RequestStatus } from '../data/constants';
import { fetchCourseAppSettings, fetchProctoringExamErrors } from './data/thunks';
import {
  getCourseAppSettings, getSavingStatus, getProctoringExamErrors, getSendRequestErrors, getLoadingStatus,
} from './data/selectors';
import messages from './messages';

/* eslint-disable import/prefer-default-export */
export const useAdvancedSettings = ({
  dispatch, courseId, intl, setIsQueryPending, setShowSuccessAlert, setIsEditableState, showSaveSettingsPrompt,
  showErrorModal, setErrorFields, hasInternetConnectionError,
}) => {
  useEffect(() => {
    dispatch(fetchCourseAppSettings(courseId));
    dispatch(fetchProctoringExamErrors(courseId));
  }, [courseId]);

  const advancedSettingsData = useSelector(getCourseAppSettings);
  const savingStatus = useSelector(getSavingStatus);
  const proctoringExamErrors = useSelector(getProctoringExamErrors);
  const settingsWithSendErrors = useSelector(getSendRequestErrors) || {};
  const loadingSettingsStatus = useSelector(getLoadingStatus);

  const isLoading = loadingSettingsStatus === RequestStatus.IN_PROGRESS;
  const updateSettingsButtonState = {
    labels: {
      default: intl.formatMessage(messages.buttonSaveText),
      pending: intl.formatMessage(messages.buttonSavingText),
    },
    disabledStates: ['pending'],
  };
  const {
    proctoringErrors,
    mfeProctoredExamSettingsUrl,
  } = proctoringExamErrors;

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      setIsQueryPending(false);
      setShowSuccessAlert(true);
      setIsEditableState(false);
      setTimeout(() => setShowSuccessAlert(false), 15000);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showSaveSettingsPrompt(false);
    } else if (savingStatus === RequestStatus.FAILED && !hasInternetConnectionError) {
      setErrorFields(settingsWithSendErrors);
      showErrorModal(true);
    }
  }, [savingStatus]);

  return {
    advancedSettingsData,
    isLoading,
    updateSettingsButtonState,
    proctoringErrors,
    mfeProctoredExamSettingsUrl,
    loadingSettingsStatus,
    savingStatus,
  };
};
