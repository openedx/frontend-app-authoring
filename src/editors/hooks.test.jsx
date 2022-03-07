import { useEffect, updateState } from 'react';
import * as module from './hooks';

jest.mock('react', () => {
  const updateStateMock = jest.fn();
  return {
    updateState: updateStateMock,
    useState: jest.fn(val => ([{ state: val }, (newVal) => updateStateMock({ val, newVal })])),
    useRef: jest.fn(val => ({ current: val })),
    useEffect: jest.fn(),
    useCallback: (cb, prereqs) => ({ cb, prereqs }),
  };
});
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
    let output;
    beforeEach(() => {
      output = module.prepareEditorRef();
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('sets refReady to false by default, ref is null', () => {
      expect(output.refReady.state).toBe(false);
      expect(output.editorRef.current).toBe(null);
    });
    test('when useEffect triggers, refReady is set to true', () => {
      expect(updateState).not.toHaveBeenCalled();
      const [cb, prereqs] = useEffect.mock.calls[0];
      expect(prereqs).toStrictEqual([]);
      cb();
      expect(updateState).toHaveBeenCalledWith({ newVal: true, val: false });
    });
    test('calling setEditorRef sets the ref value', () => {
      const fakeEditor = { editor: 'faKe Editor' };
      expect(output.editorRef.current).not.toBe(fakeEditor);
      output.setEditorRef.cb(fakeEditor);
      expect(output.editorRef.current).toBe(fakeEditor);
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
