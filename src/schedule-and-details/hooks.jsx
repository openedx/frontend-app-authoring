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
  const [errorFields, setErrorFields] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    setEditedValues(initialEditedData);
  }, [initialEditedData]);

  useEffect(() => {
    const errors = validateScheduleAndDetails(editedValues, intl);
    setErrorFields(errors);
  }, [editedValues]);

  const handleValuesChange = (value, fieldName) => {
    setShowSuccessfulAlert(false);
    setOverrideInternetConnectionAlert(false);

    if (!showModifiedAlert) {
      setShowModifiedAlert(true);
    }

    setEditedValues((prevEditedValues) => ({
      ...prevEditedValues,
      [fieldName]: value || '',
    }));
  };

  const handleResetValues = () => {
    setEditedValues(initialEditedData || {});
    setShowModifiedAlert(false);
    setShowSuccessfulAlert(false);
    setOverrideInternetConnectionAlert(false);
  };

  const handleUpdateValues = () => {
    setIsQueryPending(true);
    setOverrideInternetConnectionAlert(true);
  };

  const handleInternetConnectionFailed = () => {
    setShowModifiedAlert(false);
    setShowSuccessfulAlert(false);
    setIsQueryPending(false);
    setOverrideInternetConnectionAlert(true);
  };

  const handleDispatchMethodCall = () => {
    setIsQueryPending(false);
    setShowModifiedAlert(false);
    setOverrideInternetConnectionAlert(false);
  };

  useEffect(() => {
    if (savingStatus === RequestStatus.SUCCESSFUL) {
      setShowModifiedAlert(false);
      setShowSuccessfulAlert(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
