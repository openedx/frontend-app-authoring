import React from 'react';
import { dispatch } from 'react-redux';
import { thunkActions } from '../../../../../../data/redux';
import { MockUseState } from '../../../../../../testUtils';
import { keyStore } from '../../../../../../utils';
import * as hooks from './hooks';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useRef: jest.fn(val => ({ current: val })),
  useEffect: jest.fn(),
  useCallback: (cb, prereqs) => ({ cb, prereqs }),
}));

jest.mock('react-redux', () => {
  const dispatchFn = jest.fn();
  return {
    ...jest.requireActual('react-redux'),
    dispatch: dispatchFn,
    useDispatch: jest.fn(() => dispatchFn),
  };
});

jest.mock('../../../../../../data/redux', () => ({
  thunkActions: {
    video: {
      uploadHandout: jest.fn(),
    },
  },
}));

const state = new MockUseState(hooks);
const hookKeys = keyStore(hooks);
let hook;
const testValue = '@testVALUEVALIDhANdoUT';
const selectedFileSuccess = { name: testValue, size: 20000 };
describe('VideoEditorHandout hooks', () => {
  describe('state hooks', () => {
    state.testGetter(state.keys.showSizeError);
  });

  describe('parseHandoutName', () => {
    test('it returns none when given null', () => {
      expect(hooks.parseHandoutName({ handout: null })).toEqual('None');
    });
    test('it creates a list based on transcript object', () => {
      expect(hooks.parseHandoutName({ handout: testValue })).toEqual('testVALUEVALIDhANdoUT');
    });
  });

  describe('checkValidSize', () => {
    const onSizeFail = jest.fn();
    it('returns false for file size', () => {
      hook = hooks.checkValidFileSize({ file: { name: testValue, size: 20000001 }, onSizeFail });
      expect(onSizeFail).toHaveBeenCalled();
      expect(hook).toEqual(false);
    });
    it('returns true for valid file size', () => {
      hook = hooks.checkValidFileSize({ file: selectedFileSuccess, onSizeFail });
      expect(hook).toEqual(true);
    });
  });
  describe('fileInput', () => {
    const spies = {};
    const fileSizeError = { set: jest.fn() };
    beforeEach(() => {
      jest.clearAllMocks();
      hook = hooks.fileInput({ fileSizeError });
    });
    it('returns a ref for the file input', () => {
      expect(hook.ref).toEqual({ current: undefined });
    });
    test('click calls current.click on the ref', () => {
      const click = jest.fn();
      React.useRef.mockReturnValueOnce({ current: { click } });
      hook = hooks.fileInput({ fileSizeError });
      hook.click();
      expect(click).toHaveBeenCalled();
    });
    describe('addFile', () => {
      const eventSuccess = { target: { files: [{ selectedFileSuccess }] } };
      const eventFailure = { target: { files: [{ name: testValue, size: 20000001 }] } };
      it('image fails to upload if file size is greater than 2000000', () => {
        const checkValidFileSize = false;
        spies.checkValidFileSize = jest.spyOn(hooks, hookKeys.checkValidFileSize)
          .mockReturnValueOnce(checkValidFileSize);
        hook.addFile(eventFailure);
        expect(spies.checkValidFileSize.mock.calls.length).toEqual(1);
        expect(spies.checkValidFileSize).toHaveReturnedWith(false);
      });
      it('dispatches updateField action with the first target file', () => {
        const checkValidFileSize = true;
        spies.checkValidFileSize = jest.spyOn(hooks, hookKeys.checkValidFileSize)
          .mockReturnValueOnce(checkValidFileSize);
        hook.addFile(eventSuccess);
        expect(spies.checkValidFileSize.mock.calls.length).toEqual(1);
        expect(spies.checkValidFileSize).toHaveReturnedWith(true);
        expect(dispatch).toHaveBeenCalledWith(
          thunkActions.video.uploadHandout({
            thumbnail: eventSuccess.target.files[0],
          }),
        );
      });
    });
  });
});
