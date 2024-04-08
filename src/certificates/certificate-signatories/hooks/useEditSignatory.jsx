const useEditSignatory = ({
  arrayHelpers, editModes, setEditModes, setFieldValue, initialSignatoriesValues,
}) => {
  const handleDeleteSignatory = (id) => {
    arrayHelpers.remove(id);

    if (editModes && setEditModes) {
      const newEditModes = { ...editModes };
      delete newEditModes[id];
      setEditModes(newEditModes);
    }
  };

  const toggleEditSignatory = (id) => {
    setEditModes(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCancelUpdateSignatory = (id) => {
    const signatoryInitialValues = initialSignatoriesValues[id];
    Object.keys(signatoryInitialValues).forEach(fieldKey => {
      const fieldName = `signatories[${id}].${fieldKey}`;
      setFieldValue(fieldName, signatoryInitialValues[fieldKey]);
    });
    toggleEditSignatory(id);
  };

  return { toggleEditSignatory, handleDeleteSignatory, handleCancelUpdateSignatory };
};

export default useEditSignatory;
