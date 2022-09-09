import React from 'react';
import { shallow } from 'enzyme';

import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { html } from '@codemirror/lang-html';
import { formatMessage, MockUseState } from '../../../../../testUtils';
import alphanumericMap from './constants';
import * as module from './index';

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

jest.mock('codemirror', () => ({
  basicSetup: 'bAsiCSetUp',
}));

const state = new MockUseState(module.hooks);

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
        const hook = module.hooks.prepareShowBtnEscapeHTML();
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
        expect(module.hooks.cleanHTML({ initialText: dirtyText })).toEqual(cleanText);
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
        module.hooks.escapeHTMLSpecialChars({ ref, hideBtn: mockHideBtn });
        expect(mockDispatch).toHaveBeenCalled();
        expect(mockHideBtn).toHaveBeenCalled();
      });
    });

    describe('createCodeMirrorDomNode', () => {
      const props = {
        ref: {
          current: 'sOmEvAlUe',
        },
        initialText: 'sOmEhTmL',
        upstreamRef: {
          current: 'sOmEotHERvAlUe',
        },
      };
      beforeEach(() => {
        module.hooks.createCodeMirrorDomNode(props);
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
          value: 'mOcKhTmL',
        };
        jest.spyOn(module.hooks, 'createCodeMirrorDomNode').mockImplementation(() => ({}));
      });
      afterAll(() => {
        jest.clearAllMocks();
      });
      test('Renders and calls Hooks ', () => {
        jest.spyOn(module.hooks, 'prepareShowBtnEscapeHTML').mockImplementation(() => ({ showBtnEscapeHTML: true, hideBtn: mockHideBtn }));
        // Note: ref won't show up as it is not acutaly a DOM attribute.
        expect(shallow(<module.CodeEditor {...props} />)).toMatchSnapshot();
        expect(module.hooks.createCodeMirrorDomNode).toHaveBeenCalled();
      });
    });
  });
});
