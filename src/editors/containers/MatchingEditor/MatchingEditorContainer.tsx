import React, { useContext } from 'react';
import { EditorComponent } from '@src/editors/EditorComponent';
import { MatchingEditorContext } from './context';
import { MatchingEditorComponent } from './components/MatchingEditor';
import { Formik } from 'formik';

export const MatchingEditorContainer: React.FC<EditorComponent> = (props) => {
  const { fields } = useContext(MatchingEditorContext);

  return (
    <Formik initialValues={fields} onSubmit={() => undefined}>
      <MatchingEditorComponent {...props} />
    </Formik>
  );
};
