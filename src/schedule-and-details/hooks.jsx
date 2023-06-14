import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

const useSaveValuesPrompt = (
  courseId,
  updateDataQuery,
  initialEditedData = {},
) => {
  const [editedValues, setEditedValues] = useState(initialEditedData);
  const [saveValuesPrompt, showSaveValuesPrompt] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setEditedValues(initialEditedData);
  }, [initialEditedData]);

  const handleValuesChange = (e, settingName) => {
    const { value } = e.target;
    if (!saveValuesPrompt) {
      showSaveValuesPrompt(true);
    }
    setEditedValues((prevEditedSettings) => ({
      ...prevEditedSettings,
      [settingName]: value || ' ',
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
    editedValues,
    saveValuesPrompt,
    dispatch,
    handleValuesChange,
    handleUpdateValues,
    handleResetValues,
  };
};

/* eslint-disable-next-line import/prefer-default-export */
export { useSaveValuesPrompt };
