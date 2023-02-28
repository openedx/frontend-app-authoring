import { useEffect } from 'react';
import { MockUseState } from '../../../testUtils';

import * as appHooks from '../../hooks';
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

describe('TextEditor hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('state hooks', () => {
    state.testGetter(state.keys.refReady);
  });

  describe('appHooks', () => {
    it('forwards navigateCallback from appHooks', () => {
      expect(module.navigateCallback).toEqual(appHooks.navigateCallback);
    });
    it('forwards navigateTo from appHooks', () => {
      expect(module.navigateTo).toEqual(appHooks.navigateTo);
    });
    it('forwards nullMethod from appHooks', () => {
      expect(module.nullMethod).toEqual(appHooks.nullMethod);
    });
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
        expect(prereqs).toStrictEqual([]);
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

    describe('setAssetToStaticUrl', () => {
      it('returns content with updated img links', () => {
        const editorValue = '<img src="/asset@asset-block/soME_ImagE_URl1"/> <a href="/asset@soMEImagEURl">testing link</a>';
        const assets = [
          { portableUrl: '/static/soMEImagEURl', displayName: 'soMEImagEURl' },
          { portableUrl: '/static/soME_ImagE_URl1', displayName: 'soME ImagE URl1' },
        ];
        const content = module.setAssetToStaticUrl({ editorValue, assets });
        expect(content).toEqual('<img src="/static/soME_ImagE_URl1"/> <a href="/static/soMEImagEURl">testing link</a>');
      });
    });

    describe('getContent', () => {
      const visualContent = 'sOmEViSualContent';
      const rawContent = 'soMeRawContent';
      const editorRef = {
        current: {
          getContent: () => visualContent,
          state: {
            doc: rawContent,
          },
        },
      };
      const assets = [];
      test('returns correct content based on isRaw', () => {
        expect(module.getContent({ editorRef, isRaw: false, assets })()).toEqual(visualContent);
        expect(module.getContent({ editorRef, isRaw: true, assets })()).toEqual(rawContent);
      });
    });
  });
});
