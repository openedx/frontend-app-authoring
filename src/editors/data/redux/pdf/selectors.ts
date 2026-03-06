import { createSelector } from 'reselect';
import type { EditorState } from '..';
import { PdfState } from './types';

export const pdfState: (state: EditorState) => PdfState = (state: EditorState) => state.pdf;

const mkSimpleSelector = <T>(cb: (pdfState: EditorState['pdf']) => T) => createSelector([pdfState], cb);

const simpleSelectors: { [Property in keyof PdfState]: (state: EditorState) => PdfState[Property] } = {
  displayName: mkSimpleSelector(pdfState => pdfState.displayName),
  url: mkSimpleSelector(pdfState => pdfState.url),
  allowDownload: mkSimpleSelector(pdfState => pdfState.allowDownload),
  sourceText: mkSimpleSelector(pdfState => pdfState.sourceText),
  sourceUrl: mkSimpleSelector(pdfState => pdfState.sourceUrl),
};

export default {...simpleSelectors, pdfState};
