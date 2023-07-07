import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RequestStatus } from '../data/constants';
import { getSavingStatus } from './data/selectors';
import { validateScheduleAndDetails } from './utils';

const useSaveValuesPrompt = (
  intl,
  initialEditedData = {},
) => {
  const savingStatus = useSelector(getSavingStatus);
  const [editedValues, setEditedValues] = useState(initialEditedData);
  const [showSuccessfulAlert, setShowSuccessfulAlert] = useState(false);
  const [showModifiedAlert, setShowModifiedAlert] = useState(false);
  const [showOverrideInternetConnectionAlert, setOverrideInternetConnectionAlert] = useState(false);
  const [isQueryPending, setIsQueryPending] = useState(false);
  const [isEditableState, setIsEditableState] = useState(false);
  const [errorFields, setErrorFields] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isQueryPending) {
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
    setOverrideInternetConnectionAlert(false);

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
    setOverrideInternetConnectionAlert(false);
  };

  const handleUpdateValues = () => {
    setIsQueryPending(true);
    setIsEditableState(false);
    setOverrideInternetConnectionAlert(true);
  };

  const handleInternetConnectionFailed = () => {
    setShowModifiedAlert(false);
    setShowSuccessfulAlert(false);
    setIsQueryPending(false);
    setOverrideInternetConnectionAlert(true);
  };

  const handleDispatchMethodCall = () => {
    setOverrideInternetConnectionAlert(false);
  };

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      setIsQueryPending(false);

      if (!isEditableState) {
        setShowModifiedAlert(false);
        setShowSuccessfulAlert(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [savingStatus]);

  return {
    errorFields,
    editedValues,
    isQueryPending,
    showModifiedAlert,
    showSuccessfulAlert,
    showOverrideInternetConnectionAlert,
    dispatch,
    setErrorFields,
    handleResetValues,
    handleValuesChange,
    handleUpdateValues,
    handleDispatchMethodCall,
    handleInternetConnectionFailed,
  };
};

/* eslint-disable-next-line import/prefer-default-export */
export { useSaveValuesPrompt };
