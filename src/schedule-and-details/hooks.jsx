import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';

import { RequestStatus } from '../data/constants';
import { getSavingStatus } from './data/selectors';
import { validateScheduleAndDetails, updateWithDefaultValues } from './utils';

const useSaveValuesPrompt = (
  courseId,
  updateDataQuery,
  initialEditedData = {},
) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const savingStatus = useSelector(getSavingStatus);
  const [editedValues, setEditedValues] = useState(initialEditedData);
  const [showSuccessfulAlert, setShowSuccessfulAlert] = useState(false);
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
    const errors = validateScheduleAndDetails(editedValues, intl);
    setErrorFields(errors);
  }, [editedValues]);

  const handleValuesChange = (value, fieldName) => {
    setIsEditableState(true);
    setShowSuccessfulAlert(false);

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
  };

  const handleUpdateValues = () => {
    setIsQueryPending(true);
    setIsEditableState(false);
  };

  const handleInternetConnectionFailed = () => {
    setShowModifiedAlert(false);
    setShowSuccessfulAlert(false);
    setIsQueryPending(false);
  };

  const handleQueryProcessing = () => {
    setShowSuccessfulAlert(false);
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
