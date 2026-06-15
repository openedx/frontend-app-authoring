import { useState, useEffect } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';

import { validateScheduleAndDetails, updateWithDefaultValues } from './utils';
import { useUpdateCourseDetails } from './data/apiHooks';
import { CourseDetails } from './data/api';

export const useSaveValuesPrompt = (
  courseId: string,
  canShowCertificateAvailableDateField: boolean,
  initialEditedData: CourseDetails = {} as CourseDetails,
) => {
  const intl = useIntl();
  const updateMutation = useUpdateCourseDetails(courseId);

  const [editedValues, setEditedValues] = useState<CourseDetails>(initialEditedData);
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
    updateMutation.mutate(updateWithDefaultValues(editedValues));
  };

  useEffect(() => {
    if (updateMutation.isSuccess) {
      setIsQueryPending(false);
      setShowSuccessfulAlert(true);
      setShowFailedAlert(false);
      setTimeout(() => setShowSuccessfulAlert(false), 15000);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (!isEditableState) {
        setShowModifiedAlert(false);
      }
    } else if (updateMutation.isError) {
      setIsQueryPending(false);
      setShowSuccessfulAlert(false);
      setShowFailedAlert(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (!isEditableState) {
        setShowModifiedAlert(false);
      }
    }
  }, [updateMutation.isSuccess, updateMutation.isError]);

  return {
    errorFields,
    saveIsFailed: updateMutation.isError,
    editedValues,
    isQueryPending,
    isEditableState,
    showModifiedAlert,
    showSuccessfulAlert,
    showFailedAlert,
    setErrorFields,
    handleResetValues,
    handleValuesChange,
    handleUpdateValues,
    handleQueryProcessing,
    handleInternetConnectionFailed,
  };
};
