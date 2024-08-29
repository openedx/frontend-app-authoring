import 'CourseAuthoring/editors/setupEditorTest';
import React from 'react';
import { useDispatch } from 'react-redux';
import { actions, thunkActions } from '../../../../../../data/redux';
import { MockUseState } from '../../../../../../testUtils';
import { keyStore } from '../../../../../../utils';
import * as hooks from './hooks';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useRef: jest.fn(val => ({ current: val })),
  useEffect: jest.fn(),
  useCallback: (cb, prereqs) => ({ cb, prereqs }),
}));

jest.mock('../../../../../../data/redux', () => ({
  actions: {
    video: {
      updateField: jest.fn(),
    },
  },
  thunkActions: {
    video: {
      uploadThumbnail: jest.fn(),
    },
  },
}));

const state = new MockUseState(hooks);
const hookKeys = keyStore(hooks);
let hook;
const setThumbnailSrc = jest.fn();
const testValue = 'testVALUEVALIDIMAGE';
const selectedFileSuccess = { name: testValue, size: 20000 };
const maxFileFail = { name: testValue, size: 20000000 };
const minFileFail = { name: testValue, size: 200 };
const resampledFile = new File([selectedFileSuccess], testValue);
const imgRef = React.useRef.mockReturnValueOnce({ current: undefined });

describe('state hooks', () => {
  state.testGetter(state.keys.showSizeError);
});

describe('createResampledFile', () => {
  it('should return resampled file object', () => {
    hook = hooks.createResampledFile({ canvasUrl: 'data:MimETYpe,sOMEUrl', filename: testValue, mimeType: 'sOmEuiMAge' });
    expect(hook).toEqual(resampledFile);
  });
});
describe('resampleImage', () => {
  it('should return filename and file', () => {
    const spy = jest.spyOn(hooks, hookKeys.createResampledFile)
      .mockReturnValueOnce(resampledFile);
    const image = document.createElement('img');
    image.height = '800';
    image.width = '800';
    hook = hooks.resampleImage({ image, filename: testValue });
    expect(spy).toHaveBeenCalledWith({ canvasUrl: 'data:image/png;base64,00', filename: testValue, mimeType: 'image/png' });
    expect(spy.mock.calls.length).toEqual(1);
    expect(spy).toHaveReturnedWith(resampledFile);
    expect(hook).toEqual(['data:image/png;base64,00', resampledFile]);
  });
});
describe('checkValidDimensions', () => {
  it('returns false for images less than min width and min height', () => {
    hook = hooks.checkValidDimensions({ width: 500, height: 281 });
    expect(hook).toEqual(false);
  });
  it('returns false for images that do not have a 16:9 aspect ratio', () => {
    hook = hooks.checkValidDimensions({ width: 800, height: 800 });
    expect(hook).toEqual(false);
  });
  it('returns true for images that have a 16:9 aspect ratio and larger than min width/height', () => {
    hook = hooks.checkValidDimensions({ width: 1280, height: 720 });
    expect(hook).toEqual(true);
  });
});
describe('checkValidSize', () => {
  const onSizeFail = jest.fn();
  it('returns false for valid max file size', () => {
    hook = hooks.checkValidSize({ file: maxFileFail, onSizeFail });
    expect(onSizeFail).toHaveBeenCalled();
    expect(hook).toEqual(false);
  });
  it('returns false for valid max file size', () => {
    hook = hooks.checkValidSize({ file: minFileFail, onSizeFail });
    expect(onSizeFail).toHaveBeenCalled();
    expect(hook).toEqual(false);
  });
  it('returns true for valid file size', () => {
    hook = hooks.checkValidSize({ file: selectedFileSuccess, onSizeFail });
    expect(hook).toEqual(true);
  });
});
describe('fileInput', () => {
  const spies = {};
  const fileSizeError = { set: jest.fn() };
  beforeEach(() => {
    hook = hooks.fileInput({ setThumbnailSrc, imgRef, fileSizeError });
  });
  it('returns a ref for the file input', () => {
    expect(hook.ref).toEqual({ current: undefined });
  });
  test('click calls current.click on the ref', () => {
    const click = jest.fn();
    React.useRef.mockReturnValueOnce({ current: { click } });
    hook = hooks.fileInput({ setThumbnailSrc, imgRef, fileSizeError });
    hook.click();
    expect(click).toHaveBeenCalled();
  });
  describe('addFile', () => {
    const eventSuccess = { target: { files: [new File([selectedFileSuccess], 'sOMEUrl.jpg')] } };
    const eventFailure = { target: { files: [maxFileFail] } };
    it('image fails to upload if file size is greater than 1000000', () => {
      const checkValidSize = false;
      spies.checkValidSize = jest.spyOn(hooks, hookKeys.checkValidSize)
        .mockReturnValueOnce(checkValidSize);
      hook.addFile(eventFailure);
      expect(spies.checkValidSize.mock.calls.length).toEqual(1);
      expect(spies.checkValidSize).toHaveReturnedWith(false);
    });
    it('dispatches updateField action with the first target file', () => {
      const dispatch = useDispatch(); // Access the mock 'dispatch()' set up in setupEditorTest
      const checkValidSize = true;
      spies.checkValidSize = jest.spyOn(hooks, hookKeys.checkValidSize)
        .mockReturnValueOnce(checkValidSize);
      hook.addFile(eventSuccess);
      expect(spies.checkValidSize).toHaveReturnedWith(true);
      expect(dispatch).toHaveBeenCalledWith(actions.video.updateField({ thumbnail: ' ' }));
      expect(dispatch).toHaveBeenCalledWith(
        thunkActions.video.uploadThumbnail({
          thumbnail: eventSuccess.target.files[0],
        }),
      );
    });
  });
  describe('deleteThumbnail', () => {
    const dispatch = useDispatch(); // Access the mock 'dispatch()' set up in setupEditorTest
    const testFile = new File([selectedFileSuccess], 'sOMEUrl.jpg');
    hooks.deleteThumbnail({ dispatch })();
    expect(dispatch).toHaveBeenNthCalledWith(1, actions.video.updateField({ thumbnail: null }));
    expect(dispatch).toHaveBeenNthCalledWith(2, thunkActions.video.uploadThumbnail({
      thumbnail: testFile,
      emptyCanvas: true,
    }));
  });
});
