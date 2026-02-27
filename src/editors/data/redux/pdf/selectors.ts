import { createSelector } from 'reselect';
import type { EditorState } from '..';
import { PdfState } from './types';

export const pdfState: (state: EditorState) => PdfState = (state: EditorState) => state.pdf;

const mkSimpleSelector = <T>(cb: (pdfState: EditorState['pdf']) => T) => createSelector([pdfState], cb);

const simpleSelectors: { [Property in keyof PdfState]: (state: EditorState) => PdfState[Property] } = {
  displayName: mkSimpleSelector(pdfState => pdfState.displayName),
  url: mkSimpleSelector(pdfState => pdfState.url),
  allowDownload: mkSimpleSelector(pdfState => pdfState.allowDownload),
  source_text: mkSimpleSelector(pdfState => pdfState.source_text),
  source_url: mkSimpleSelector(pdfState => pdfState.source_url),
};

export default simpleSelectors;
