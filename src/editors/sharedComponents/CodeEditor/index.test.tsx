import React from 'react';
import {
  render, screen, initializeMocks, fireEvent,
} from '@src/testUtils';
import { waitFor } from '@testing-library/react';
import { formatMessage, MockUseState } from '../../testUtils';
import alphanumericMap from './constants';
import { CodeEditorInternal as CodeEditor } from './index';
import * as hooks from './hooks';

describe('CodeEditor', () => {
  describe('Hooks', () => {
    const state = new MockUseState(hooks);
    beforeEach(() => {
      jest.clearAllMocks();
    });
    state.testGetter(state.keys.showBtnEscapeHTML);
    describe('stateHooks', () => {
      beforeEach(() => {
        state.mock();
      });
      it('prepareShowBtnEscapeHTML', () => {
        const hook = hooks.prepareShowBtnEscapeHTML();
        expect(state.stateVals.showBtnEscapeHTML).toEqual(hook.showBtnEscapeHTML);
        hook.hideBtn();
        expect(state.setState.showBtnEscapeHTML).toHaveBeenCalledWith(false);
      });
      afterEach(() => { state.restore(); });
    });

    describe('cleanHTML', () => {
      const dirtyText = `&${Object.keys(alphanumericMap).join('; , &')};`;
      const cleanText = `${Object.values(alphanumericMap).join(' , ')}`;
      const dirtyTextWithAlt = '<img src="image.png" alt="Description &le; and &ge; &quot;do not convert these to double quotes&quot; 1" /> and &le; and &ge;';
      const cleanTextWithAlt = '<img src="image.png" alt="Description ≤ and ≥ &quot;do not convert these to double quotes&quot; 1" /> and ≤ and ≥';

      it('escapes alphanumerics and sets them to be literals', () => {
        expect(hooks.cleanHTML({ initialText: dirtyText })).toEqual(cleanText);
      });

      it('replaces alt attributes with placeholders and restores them', () => {
        const result = hooks.cleanHTML({ initialText: dirtyTextWithAlt });
        expect(result).toEqual(cleanTextWithAlt);
      });
    });

    describe('escapeHTMLSpecialChars', () => {
      const cleanText = `${Object.values(alphanumericMap).join(' , ')}`;

      const mockDispatch = jest.fn((args) => ({ mockDispatch: args }));

      const ref = {
        current: {
          dispatch: mockDispatch,
          state: {
            doc: {
              toString: () => cleanText,
            },
          },
        },
      };
      const mockHideBtn = jest.fn();
      it('unescapes literals and sets them to be alphanumerics', () => {
        hooks.escapeHTMLSpecialChars({ ref, hideBtn: mockHideBtn });
        expect(mockDispatch).toHaveBeenCalled();
        expect(mockHideBtn).toHaveBeenCalled();
      });
    });
  });

  describe('xmlSyntaxChecker', () => {
    describe('lang equals html', () => {
      it('returns empty array', () => {
        const textArr = ['<problem>', '<p>', 'this is some text', '</p>', '</problem>'];
        const diagnostics = hooks.syntaxChecker({ textArr, lang: 'html' });
        expect(diagnostics).toEqual([]);
      });
    });
    describe('textArr is undefined', () => {
      it('returns empty array', () => {
        let textArr;
        const diagnostics = hooks.syntaxChecker({ textArr, lang: 'html' });
        expect(diagnostics).toEqual([]);
      });
    });
    describe('lang equals xml', () => {
      it('returns empty array', () => {
        const textArr = ['<problem>', '<p>', 'this is some text', '</p>', '</problem>'];
        const diagnostics = hooks.syntaxChecker({ textArr, lang: 'xml' });
        expect(diagnostics).toEqual([]);
      });
      it('returns an array with error object', () => {
        const textArr = ['<problem>', '<p>', '<p>', 'this is some text', '</p>', '</problem>'];
        const expectedDiagnostics = hooks.syntaxChecker({ textArr, lang: 'xml' });
        const diagnostics = [{
          from: 9,
          to: 12,
          severity: 'error',
          message: 'SyntaxError: Expected that start and end tag must be identical but "<" found.',
        }];
        expect(expectedDiagnostics).toEqual(diagnostics);
      });
    });
  });

  describe('Component', () => {
    describe('renders', () => {
      beforeEach(() => {
        initializeMocks();
      });
      let useRefSpy;
      test('Renders and calls Hooks ', () => {
        const props = {
          intl: { formatMessage },
          innerRef: {
            current: 'sOmEvALUE',
          },
          lang: 'html',
          value: 'mOcKhTmL',
        };
        const mockBtnRef = { current: null };
        const mockDOMRef = { current: null };
        const mockUseRef = jest.fn()
          .mockImplementationOnce(() => mockDOMRef) // for DOMref
          .mockImplementationOnce(() => mockBtnRef); // for btnRef

        useRefSpy = jest.spyOn(React, 'useRef').mockImplementation(mockUseRef);

        const mockHideBtn = jest.fn();
        jest.spyOn(hooks, 'prepareShowBtnEscapeHTML').mockImplementation(() => ({
          showBtnEscapeHTML: true,
          hideBtn: mockHideBtn,
        }));
        jest.spyOn(hooks, 'createCodeMirrorDomNode').mockImplementation(() => ({}));
        const mockEscapeHTMLSpecialChars = jest.fn();
        jest.spyOn(hooks, 'escapeHTMLSpecialChars').mockImplementation(mockEscapeHTMLSpecialChars);
        // Note: ref won't show up as it is not acutaly a DOM attribute.
        render(<CodeEditor {...props} />);
        expect(screen.getByRole('button', { name: 'Unescape HTML Literals' })).toBeInTheDocument();
        expect(hooks.prepareShowBtnEscapeHTML).toHaveBeenCalled();
        expect(hooks.createCodeMirrorDomNode).toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Unescape HTML Literals' }));
        expect(mockEscapeHTMLSpecialChars).toHaveBeenCalled();
        // Prevent React.useRef mock leakage into subsequent tests
        useRefSpy.mockRestore();
      });
    });

    describe('value change effect', () => {
      beforeEach(() => {
        initializeMocks();
      });

      test('dispatches changes when value prop updates', async () => {
        const mockDispatch = jest.fn();
        const oldContent = 'old content';
        const newContent = 'new content';
        const mockView = {
          state: { doc: { toString: () => oldContent } },
          dispatch: mockDispatch,
        };
        const innerRef = { current: mockView };

        jest.spyOn(hooks, 'createCodeMirrorDomNode').mockImplementation(() => ({}));
        jest.spyOn(hooks, 'prepareShowBtnEscapeHTML').mockReturnValue({ showBtnEscapeHTML: false, hideBtn: jest.fn() });

        const { rerender } = render(<CodeEditor innerRef={innerRef} value={oldContent} lang="xml" />);
        // Initial render: value matches doc, no dispatch
        expect(mockDispatch).not.toHaveBeenCalled();

        // Rerender with new value triggers effect
        rerender(<CodeEditor innerRef={innerRef} value={newContent} lang="xml" />);
        await waitFor(() => expect(mockDispatch).toHaveBeenCalledTimes(1));
        const callArg = mockDispatch.mock.calls[0][0];
        expect(callArg.changes.insert).toBe(newContent);
        expect(callArg.changes.from).toBe(0);
        expect(callArg.changes.to).toBe(oldContent.length);

        // Simulate that the editor document now reflects the new content so a rerender
        // with the same value does not trigger another dispatch.
        mockView.state.doc.toString = () => newContent;

        // Rerender again with same value should not trigger additional dispatch
        mockDispatch.mockClear();
        rerender(<CodeEditor innerRef={innerRef} value={newContent} lang="xml" />);
        // Give a tick to ensure no extra dispatch happens
        await waitFor(() => expect(mockDispatch).not.toHaveBeenCalled());
      });
    });
  });
});
