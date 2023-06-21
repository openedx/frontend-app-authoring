import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { validateScheduleAndDetails } from './utils';

const useSaveValuesPrompt = (
  intl,
  courseId,
  updateDataQuery,
  initialEditedData = {},
) => {
  const [editedValues, setEditedValues] = useState(initialEditedData);
  const [saveValuesPrompt, showSaveValuesPrompt] = useState(false);
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
    if (!saveValuesPrompt) {
      showSaveValuesPrompt(true);
    }
    setEditedValues((prevEditedValues) => ({
      ...prevEditedValues,
      [fieldName]: value || '',
    }));
  };

  const handleResetValues = () => {
    setEditedValues(initialEditedData || {});
    showSaveValuesPrompt(false);
  };

  const handleUpdateValues = () => {
    dispatch(updateDataQuery(courseId, editedValues));
    showSaveValuesPrompt(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    errorFields,
    editedValues,
    saveValuesPrompt,
    dispatch,
    setErrorFields,
    handleValuesChange,
    handleUpdateValues,
    handleResetValues,
  };
};

/* eslint-disable-next-line import/prefer-default-export */
export { useSaveValuesPrompt };
