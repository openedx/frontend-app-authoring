import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { shallow } from '@edx/react-unit-test-utils';

import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { html } from '@codemirror/lang-html';
import { formatMessage, MockUseState } from '../../testUtils';
import alphanumericMap from './constants';
import * as module from './index';
import * as hooks from './hooks';

const CodeEditor = module.CodeEditorInternal;

jest.mock('@codemirror/view');

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useRef: jest.fn(val => ({ current: val })),
  useEffect: jest.fn(),
  useCallback: (cb, prereqs) => ({ cb, prereqs }),
}));

jest.mock('@codemirror/state', () => ({
  ...jest.requireActual('@codemirror/state'),
  EditorState: {
    create: jest.fn(),
  },
}));

jest.mock('@codemirror/lang-html', () => ({
  html: jest.fn(),
}));

jest.mock('@codemirror/lang-xml', () => ({
  xml: jest.fn(),
}));

jest.mock('codemirror', () => ({
  basicSetup: 'bAsiCSetUp',
}));

const state = new MockUseState(hooks);

describe('CodeEditor', () => {
  describe('Hooks', () => {
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

      it('escapes alphanumerics and sets them to be literals', () => {
        expect(hooks.cleanHTML({ initialText: dirtyText })).toEqual(cleanText);
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

    describe('createCodeMirrorDomNode', () => {
      const props = {
        ref: {
          current: 'sOmEvAlUe',
        },
        lang: 'html',
        initialText: 'sOmEhTmL',
        upstreamRef: {
          current: 'sOmEotHERvAlUe',
        },
      };
      beforeEach(() => {
        hooks.createCodeMirrorDomNode(props);
      });
      it('calls useEffect and sets up codemirror objects', () => {
        const [cb, prereqs] = React.useEffect.mock.calls[0];
        expect(prereqs).toStrictEqual([]);
        cb();
        expect(EditorState.create).toHaveBeenCalled();
        expect(EditorView).toHaveBeenCalled();
        expect(html).toHaveBeenCalled();
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
    describe('Snapshots', () => {
      const mockHideBtn = jest.fn().mockName('mockHidebtn');
      let props;
      beforeAll(() => {
        props = {
          intl: { formatMessage },
          innerRef: {
            current: 'sOmEvALUE',
          },
          lang: 'html',
          value: 'mOcKhTmL',
        };
        jest.spyOn(hooks, 'createCodeMirrorDomNode').mockImplementation(() => ({}));
      });
      afterAll(() => {
        jest.clearAllMocks();
      });
      test('Renders and calls Hooks ', () => {
        jest.spyOn(hooks, 'prepareShowBtnEscapeHTML').mockImplementation(() => ({ showBtnEscapeHTML: true, hideBtn: mockHideBtn }));
        // Note: ref won't show up as it is not acutaly a DOM attribute.
        expect(shallow(<CodeEditor {...props} />).snapshot).toMatchSnapshot();
        expect(hooks.createCodeMirrorDomNode).toHaveBeenCalled();
      });
    });
  });
});
