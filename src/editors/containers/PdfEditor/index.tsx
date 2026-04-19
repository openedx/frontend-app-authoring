import React from 'react';
import { EditorComponent } from '@src/editors/EditorComponent';
import { useSelector } from 'react-redux';
import { selectors } from '@src/editors/data/redux';
import PdfEditorContainer from '@src/editors/containers/PdfEditor/components/PdfEditorContainer';
import { PdfBlockContextProvider } from '@src/editors/containers/PdfEditor/contexts';

/**
 * Renders the form with all fields to embed a PDF.
 */
const PdfEditor: React.FC<EditorComponent> = (props) => {
  // The rest of the editing infrastructure uses Redux still. We will hook into the minimum needed
  // to be compatible, and otherwise use ReactQuery and contexts.
  const blockId = useSelector(selectors.app.blockId) || '';

  return (
    <PdfBlockContextProvider blockId={blockId}>
      <PdfEditorContainer {...props} />
    </PdfBlockContextProvider>
  );
};

export default PdfEditor;
