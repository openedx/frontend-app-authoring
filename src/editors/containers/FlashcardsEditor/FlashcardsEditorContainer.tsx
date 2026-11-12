import React, { useContext } from 'react';
import { EditorComponent } from '@src/editors/EditorComponent';
import { FlashcardsEditorContext } from './context';
import { FlashcardsEditorComponent } from './components/FlashcardsEditor';
import { Formik } from 'formik';

export const FlashcardsEditorContainer: React.FC<EditorComponent> = (props) => {
  const { fields } = useContext(FlashcardsEditorContext);

  return (
    <Formik initialValues={fields} onSubmit={() => undefined}>
      <FlashcardsEditorComponent {...props} />
    </Formik>
  );
};
