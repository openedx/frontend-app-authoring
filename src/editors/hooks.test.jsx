import { useEffect } from 'react';

import { MockUseState } from '../testUtils';
import * as module from './hooks';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useRef: jest.fn(val => ({ current: val })),
  useEffect: jest.fn(),
  useCallback: (cb, prereqs) => ({ cb, prereqs }),
}));

const state = new MockUseState(module);

describe('hooks', () => {
  const locationTemp = window.location;
  beforeAll(() => {
    delete window.location;
    window.location = {
      assign: jest.fn(),
    };
  });
  afterAll(() => {
    window.location = locationTemp;
  });
  describe('state hooks', () => {
    state.testGetter(state.keys.refReady);
  });
  describe('initializeApp', () => {
    test('calls provided function with provided data as args when useEffect is called', () => {
      const mockIntialize = jest.fn(val => (val));
      const fakedata = { some: 'data' };
      module.initializeApp({ initialize: mockIntialize, data: fakedata });
      expect(mockIntialize).not.toHaveBeenCalledWith(fakedata);
      const [cb, prereqs] = useEffect.mock.calls[0];
      expect(prereqs).toStrictEqual([]);
      cb();
      expect(mockIntialize).toHaveBeenCalledWith(fakedata);
    });
  });
  describe('prepareEditorRef', () => {
    let hook;
    beforeEach(() => {
      state.mock();
      hook = module.prepareEditorRef();
    });
    afterEach(() => {
      state.restore();
      jest.clearAllMocks();
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
  describe('navigateTo', () => {
    const destination = 'HoME';
    beforeEach(() => {
      module.navigateTo(destination);
    });
    test('it calls window assign', () => {
      expect(window.location.assign).toHaveBeenCalled();
    });
  });
  describe('navigateCallback', () => {
    let output;
    const destination = 'hOmE';
    beforeEach(() => {
      output = module.navigateCallback(destination);
    });
    test('it calls navigateTo with output destination', () => {
      const spy = jest.spyOn(module, 'navigateTo');
      output();
      expect(spy).toHaveBeenCalledWith(destination);
    });
  });
  describe('saveBlock', () => {
    test('saveBlock calls the save function provided with created nav callback and content', () => {
      const mockNavCallback = (returnUrl) => ({ navigateCallback: returnUrl });
      jest.spyOn(module, 'navigateCallback').mockImplementationOnce(mockNavCallback);
      const content = { some: 'content' };
      const args = {
        editorRef: { current: { getContent: () => content } },
        returnUrl: 'rEtUrNUrl',
        saveFunction: jest.fn(),
      };
      module.saveBlock(args);
      expect(args.saveFunction).toHaveBeenCalledWith({
        returnToUnit: mockNavCallback(args.returnUrl),
        content,
      });
    });
  });
});
