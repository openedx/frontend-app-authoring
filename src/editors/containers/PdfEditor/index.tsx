import React, {useRef} from 'react';
import { EditorComponent } from '@src/editors/EditorComponent';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useDispatch, useSelector } from 'react-redux';
import {actions, EditorState, selectors} from '@src/editors/data/redux';
import { RequestKeys } from '@src/editors/data/constants/requests';
import {Spinner} from "@openedx/paragon";
import EditorContainer from "@src/editors/containers/EditorContainer";
import { ProblemEditorContextProvider } from "../ProblemEditor/components/EditProblemView/ProblemEditorContext";

export interface Props extends EditorComponent {}

/**
 * Renders the form with all fields to embed a PDF.
 */
const PdfEditor: React.FC<Props> = (props) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const blockFinished = useSelector((state: EditorState) => selectors.app.shouldCreateBlock(state)
    || selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchBlock }));

  const blockFailed = useSelector(
    (state: EditorState) => selectors.requests.isFailed(state, { requestKey: RequestKeys.fetchBlock }),
  );
  // TODO: Is this necessary?
  const editorRef = useRef(null);

  const updateField = React.useCallback((data) => dispatch(actions.pdf.updateField(data)), [dispatch]);
  const setBlockTitle = React.useCallback((title) => dispatch(actions.app.setBlockTitle(title)), [dispatch]);

  if (!blockFinished) {
    return (
      <div className="text-center p-6">
        <Spinner
          animation="border"
          className="m-3"
          screenReaderText="Loading Problem Editor"
        />
      </div>
    );
  }
  return (
    <ProblemEditorContextProvider editorRef={editorRef}>
      <EditorContainer {...props} isDirty={() => true} getContent={() => console.log("Content get!")}>
        <h1>I am the PDF Editor</h1>
      </EditorContainer>
    </ProblemEditorContextProvider>
  )
};

export default PdfEditor;
