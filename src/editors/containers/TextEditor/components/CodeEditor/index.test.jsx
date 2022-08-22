import React from 'react';
import { shallow } from 'enzyme';

import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { html } from '@codemirror/lang-html';
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

describe('CodeEditor', () => {
  describe('Hooks', () => {
    beforeEach(() => {
      jest.clearAllMocks();
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
      let props;
      beforeAll(() => {
        props = {
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
        // Note: ref won't show up as it is not acutaly a DOM attribute.
        expect(shallow(<module.CodeEditor {...props} />)).toMatchSnapshot();
        expect(module.hooks.createCodeMirrorDomNode).toHaveBeenCalled();
      });
    });
  });
});
