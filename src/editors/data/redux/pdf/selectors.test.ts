import { pdfState } from '@src/editors/data/redux/pdf/selectors';
import { initialPdfState } from '@src/editors/data/redux/pdf/reducers';
import { EditorState } from '@src/editors/data/redux';

describe('PDF Selectors', () => {
  it('Selects the PDF State', () => {
    const state = initialPdfState();
    expect(pdfState({ otherValue: 'wat', pdf: state } as unknown as EditorState)).toEqual(state);
  });
});
