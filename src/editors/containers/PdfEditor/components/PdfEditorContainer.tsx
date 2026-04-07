import React, { useContext } from 'react';
import { PdfBlockContext } from '@src/editors/containers/PdfEditor/contexts';
import { Formik } from 'formik';
import { EditorComponent } from '@src/editors/EditorComponent';
import PdfEditingModal from '@src/editors/containers/PdfEditor/components/PdfEditingModal';

const PdfEditorContainer: React.FC<EditorComponent> = (props) => {
  const { fields } = useContext(PdfBlockContext);
  return (
    <Formik initialValues={fields} onSubmit={() => undefined}>
      <PdfEditingModal {...props} />
    </Formik>
  );
};

export default PdfEditorContainer;
