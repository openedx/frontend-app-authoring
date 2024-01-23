import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';

import { RequestStatus } from '../data/constants';
import { getSavingStatus } from './data/selectors';
import { validateScheduleAndDetails, updateWithDefaultValues } from './utils';

const useSaveValuesPrompt = (
  courseId,
  updateDataQuery,
  canShowCertificateAvailableDateField,
  initialEditedData = {},
) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const savingStatus = useSelector(getSavingStatus);
  const [editedValues, setEditedValues] = useState(initialEditedData);
  const [showSuccessfulAlert, setShowSuccessfulAlert] = useState(false);
  const [showFailedAlert, setShowFailedAlert] = useState(false);
  const [showModifiedAlert, setShowModifiedAlert] = useState(false);
  const [isQueryPending, setIsQueryPending] = useState(false);
  const [isEditableState, setIsEditableState] = useState(false);
  const [errorFields, setErrorFields] = useState({});

  useEffect(() => {
    if (!isQueryPending && !isEditableState) {
      setEditedValues(initialEditedData);
    }
  }, [initialEditedData]);

  useEffect(() => {
    const errors = validateScheduleAndDetails(editedValues, canShowCertificateAvailableDateField, intl);
    setErrorFields(errors);
  }, [editedValues]);

  const handleValuesChange = (value, fieldName) => {
    setIsEditableState(true);
    setShowSuccessfulAlert(false);
    setShowFailedAlert(false);

    if (editedValues[fieldName] !== value) {
      setEditedValues((prevEditedValues) => ({
        ...prevEditedValues,
        [fieldName]: value || '',
      }));

      if (!showModifiedAlert) {
        setShowModifiedAlert(true);
      }
    }
  };

  const handleResetValues = () => {
    setIsEditableState(false);
    setEditedValues(initialEditedData || {});
    setShowModifiedAlert(false);
    setShowSuccessfulAlert(false);
    setShowFailedAlert(false);
  };

  const handleUpdateValues = () => {
    setIsQueryPending(true);
    setIsEditableState(false);
  };

  const handleInternetConnectionFailed = () => {
    setShowModifiedAlert(false);
    setShowSuccessfulAlert(false);
    setShowFailedAlert(false);
    setIsQueryPending(false);
  };

  const handleQueryProcessing = () => {
    setShowSuccessfulAlert(false);
    setShowFailedAlert(false);
    dispatch(updateDataQuery(courseId, updateWithDefaultValues(editedValues)));
  };

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      setIsQueryPending(false);
      setShowSuccessfulAlert(true);
      setTimeout(() => setShowSuccessfulAlert(false), 15000);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (!isEditableState) {
        setShowModifiedAlert(false);
      }
    } else if (savingStatus === RequestStatus.FAILED) {
      setIsQueryPending(false);
      setShowFailedAlert(true);
      setTimeout(() => setShowFailedAlert(false), 15000);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (!isEditableState) {
        setShowModifiedAlert(false);
      }
    }
  }, [savingStatus]);

  return {
    errorFields,
    savingStatus,
    editedValues,
    isQueryPending,
    isEditableState,
    showModifiedAlert,
    showSuccessfulAlert,
    showFailedAlert,
    dispatch,
    setErrorFields,
    handleResetValues,
    handleValuesChange,
    handleUpdateValues,
    handleQueryProcessing,
    handleInternetConnectionFailed,
  };
};

/* eslint-disable-next-line import/prefer-default-export */
export { useSaveValuesPrompt };
