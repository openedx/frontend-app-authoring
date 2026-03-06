import React, {useEffect, useState} from 'react';
import { EditorComponent } from '@src/editors/EditorComponent';
import {FormattedMessage, useIntl} from '@edx/frontend-platform/i18n';
import { useDispatch, useSelector } from 'react-redux';
import {EditorState, selectors} from '@src/editors/data/redux';
import { RequestKeys } from '@src/editors/data/constants/requests';
import {Spinner} from "@openedx/paragon";
import EditorContainer from "@src/editors/containers/EditorContainer";
import PdfEditingModal from "@src/editors/containers/PdfEditor/components/PdfEditingModal";
import messages from "./messages";
import {initEmptyErrors, PdfBlockContext, PdfBlockContextProvider} from "@src/editors/containers/PdfEditor/contexts";
import {useBlockData} from "@src/editors/containers/PdfEditor/api";
import {initialPdfState} from "@src/editors/data/redux/pdf/reducers";
import {PdfState} from "@src/editors/data/redux/pdf";

export interface Props extends EditorComponent {}

/**
 * Renders the form with all fields to embed a PDF.
 */
const PdfEditor: React.FC<Props> = (props) => {
  // The rest of the editing infrastructure uses Redux still. We will hook into the minimum needed
  // to be compatible, and otherwise use ReactQuery and contexts.
  const blockId = useSelector((state: EditorState) => selectors.app.blockId(state))

  return (
    <EditorContainer {...props} isDirty={() => true} getContent={() => {}}>
      {blockId && (<PdfBlockContextProvider blockId={blockId}>
        <PdfEditingModal />
      </PdfBlockContextProvider>)}
    </EditorContainer>
  )
};

export default PdfEditor;
