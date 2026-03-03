import React from 'react';
import { EditorComponent } from '@src/editors/EditorComponent';
import {FormattedMessage, useIntl} from '@edx/frontend-platform/i18n';
import { useDispatch, useSelector } from 'react-redux';
import {EditorState, selectors} from '@src/editors/data/redux';
import { RequestKeys } from '@src/editors/data/constants/requests';
import {Spinner} from "@openedx/paragon";
import EditorContainer from "@src/editors/containers/EditorContainer";
import {fetchPdfContent} from "@src/editors/containers/PdfEditor/hooks";
import PdfEditingModal from "@src/editors/containers/PdfEditor/components/PdfEditingModal";
import messages from "./messages";

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
  if (blockFailed) {
    return (
      <div className="text-center p-6">
        <FormattedMessage {...messages.blockFailed} />
      </div>
    );
  }
  return (
    <EditorContainer {...props} isDirty={() => true} getContent={fetchPdfContent()}>
      <PdfEditingModal></PdfEditingModal>
    </EditorContainer>
  )
};

export default PdfEditor;
