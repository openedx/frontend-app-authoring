import React from 'react';
import { EditorComponent } from '@src/editors/EditorComponent';
import {FormattedMessage, useIntl} from '@edx/frontend-platform/i18n';
import { useDispatch, useSelector } from 'react-redux';
import {EditorState, selectors} from '@src/editors/data/redux';
import { RequestKeys } from '@src/editors/data/constants/requests';
import {Spinner} from "@openedx/paragon";
import EditorContainer from "@src/editors/containers/EditorContainer";
import PdfEditingModal from "@src/editors/containers/PdfEditor/components/PdfEditingModal";
import messages from "./messages";
import {initEmptyErrors} from "@src/editors/containers/PdfEditor/contexts";

export interface Props extends EditorComponent {}

/**
 * Renders the form with all fields to embed a PDF.
 */
const PdfEditor: React.FC<Props> = (props) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  // The rest of the editing infrastructure uses Redux still. We will hook into the minimum needed
  // to be compatible, and otherwise use ReactQuery and contexts.
  const errors = initEmptyErrors()
  const blockFinished = useSelector((state: EditorState) => selectors.app.shouldCreateBlock(state)
    || selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchBlock }));

  const blockFailed = useSelector(
    (state: EditorState) => selectors.requests.isFailed(state, { requestKey: RequestKeys.fetchBlock }),
  );
  const blockId = useSelector((state: EditorState) => selectors.app.blockId(state))

  if (!blockFinished) {
    return (
      <div className="text-center p-6">
        <Spinner
          animation="border"
          className="m-3"
          screenReaderText="Loading Pdf Editor"
        />
      </div>
    );
  }
  if (blockFailed) {
    return (
      <div className="text-center p-6">
        <FormattedMessage {...messages.blockFailed} />
      </div>
    );
  }
  return (
    <EditorContainer {...props} isDirty={() => true} getContent={() => {}}>
      <PdfEditingModal></PdfEditingModal>
    </EditorContainer>
  )
};

export default PdfEditor;
