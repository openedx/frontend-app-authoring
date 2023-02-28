import { useEffect } from 'react';
import { MockUseState } from '../../../testUtils';

import * as module from './hooks';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  createRef: jest.fn(val => ({ ref: val })),
  useRef: jest.fn(val => ({ current: val })),
  useEffect: jest.fn(),
  useCallback: (cb, prereqs) => ({ cb, prereqs }),
}));

const state = new MockUseState(module);

let hook;

describe('Problem editor hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('state hooks', () => {
    state.testGetter(state.keys.refReady);
  });

  describe('non-state hooks', () => {
    beforeEach(() => { state.mock(); });
    afterEach(() => { state.restore(); });
    describe('prepareEditorRef', () => {
      beforeEach(() => {
        hook = module.prepareEditorRef();
      });
      const key = state.keys.refReady;
      test('sets refReady to false by default, ref is null', () => {
        expect(state.stateVals[key]).toEqual(false);
        expect(hook.editorRef.current).toBe(null);
      });
      test('when useEffect triggers, refReady is set to true', () => {
        expect(state.setState[key]).not.toHaveBeenCalled();
        const [cb, prereqs] = useEffect.mock.calls[0];
        expect(prereqs).toStrictEqual([state.setState[key]]);
        cb();
        expect(state.setState[key]).toHaveBeenCalledWith(true);
      });
      test('calling setEditorRef sets the ref value', () => {
        const fakeEditor = { editor: 'faKe Editor' };
        expect(hook.editorRef.current).not.toBe(fakeEditor);
        hook.setEditorRef.cb(fakeEditor);
        expect(hook.editorRef.current).toBe(fakeEditor);
      });
    });
  });
});
