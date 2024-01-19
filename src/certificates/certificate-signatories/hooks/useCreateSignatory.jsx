import { v4 as uuid } from 'uuid';

const useCreateSignatory = ({ arrayHelpers }) => {
  const handleAddSignatory = () => {
    const getNewSignatory = () => ({
      id: `local-${uuid()}`, name: '', title: '', organization: '', signatureImagePath: '',
    });

    arrayHelpers.push(getNewSignatory());
  };

  return { handleAddSignatory };
};

export default useCreateSignatory;
