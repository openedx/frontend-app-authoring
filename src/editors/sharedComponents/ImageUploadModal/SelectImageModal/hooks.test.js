import React from 'react';
import { dispatch } from 'react-redux';

import { MockUseState } from '../../../testUtils';
import { keyStore } from '../../../utils';
import { thunkActions } from '../../../data/redux';

import * as hooks from './hooks';
import { sortFunctions, sortKeys } from './utils';

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

jest.mock('../../../data/redux', () => ({
  thunkActions: {
    app: {
      uploadAsset: jest.fn(),
    },
  },
}));

const state = new MockUseState(hooks);
const hookKeys = keyStore(hooks);
let hook;
const testValue = 'testVALUEVALIDIMAGE';
const testValueInvalidImage = { value: 'testVALUEVALIDIMAGE', size: 90000000 };

describe('SelectImageModal hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('state hooks', () => {
    state.testGetter(state.keys.highlighted);
    state.testGetter(state.keys.showSelectImageError);
    state.testGetter(state.keys.searchString);
    state.testGetter(state.keys.sortBy);
    state.testGetter(state.keys.showSizeError);
  });

  describe('using state', () => {
    beforeEach(() => { state.mock(); });
    afterEach(() => { state.restore(); });

    describe('searchAndSortHooks', () => {
      beforeEach(() => {
        hook = hooks.searchAndSortHooks();
      });
      it('returns searchString value, initialized to an empty string', () => {
        expect(state.stateVals.searchString).toEqual(hook.searchString);
        expect(state.stateVals.searchString).toEqual('');
      });
      it('returns highlighted value, initialized to dateNewest', () => {
        expect(state.stateVals.sortBy).toEqual(hook.sortBy);
        expect(state.stateVals.sortBy).toEqual(sortKeys.dateNewest);
      });
      test('onSearchChange sets searchString with event target value', () => {
        hook.onSearchChange({ target: { value: testValue } });
        expect(state.setState.searchString).toHaveBeenCalledWith(testValue);
      });
      test('clearSearchString sets search string to empty string', () => {
        hook.clearSearchString();
        expect(state.setState.searchString).toHaveBeenCalledWith('');
      });
      test('onSortClick takes a key and returns callback to set sortBY to that key', () => {
        hook.onSortClick(testValue);
        expect(state.setState.sortBy).not.toHaveBeenCalled();
        hook.onSortClick(testValue)();
        expect(state.setState.sortBy).toHaveBeenCalledWith(testValue);
      });
    });
    describe('filteredList', () => {
      const matching = [
        'test',
        'TEst',
        'eeees',
        'essSSSS',
      ];
      const notMatching = ['bad', 'other', 'bad stuff'];
      const searchString = 'eS';
      test('returns list filtered lowercase by displayName', () => {
        const filter = jest.fn(cb => ({ filter: cb }));
        hook = hooks.filteredList({ searchString, imageList: { filter } });
        expect(filter).toHaveBeenCalled();
        const [[filterCb]] = filter.mock.calls;
        matching.forEach(val => expect(filterCb({ displayName: val })).toEqual(true));
        notMatching.forEach(val => expect(filterCb({ displayName: val })).toEqual(false));
      });
    });
    describe('displayList', () => {
      const props = {
        images: ['data1', 'data2', 'other distinct data'],
        sortBy: sortKeys.dateNewest,
        searchString: 'test search string',

      };
      const load = (loadProps = {}) => {
        jest.spyOn(hooks, hookKeys.filteredList).mockImplementationOnce(
          ({ searchString, imageList }) => ({
            sort: (cb) => ({ filteredList: { searchString, imageList }, sort: { cb } }),
          }),
        );
        hook = hooks.displayList({ ...props, ...loadProps });
      };
      it('returns a sorted filtered list, based on the searchString and imageList values', () => {
        load();
        expect(hook.filteredList.searchString).toEqual(props.searchString);
        expect(hook.filteredList.imageList).toEqual(Object.values(props.images));
      });
      describe('sort behavior', () => {
        Object.keys(sortKeys).forEach(key => {
          test(`it sorts by ${key} when selected`, () => {
            load({ sortBy: sortKeys[key] });
            expect(hook.sort).toEqual({ cb: sortFunctions[key] });
          });
        });
        test('defaults to sorting by dateNewest', () => {
          load();
          expect(hook.sort).toEqual({ cb: sortFunctions.dateNewest });
        });
      });
    });
    describe('imgListHooks outputs', () => {
      const props = {
        setSelection: jest.fn(),
        searchSortProps: { searchString: 'Es', sortBy: sortKeys.dateNewest },
        images: [
          {
            displayName: 'sOmEuiMAge',
            staTICUrl: '/assets/sOmEuiMAge',
            id: 'sOmEuiMAgeURl',
          },
        ],
      };
      const displayList = (args) => ({ displayList: args });
      const load = () => {
        jest.spyOn(hooks, hookKeys.displayList).mockImplementationOnce(displayList);
        hook = hooks.imgListHooks(props);
      };
      beforeEach(() => {
        load();
      });
      describe('selectBtnProps', () => {
        test('on click, if sets selection to the image with the same id', () => {
          const highlighted = 'sOmEuiMAgeURl';
          const highlightedValue = { displayName: 'sOmEuiMAge', staTICUrl: '/assets/sOmEuiMAge', id: 'sOmEuiMAgeURl' };
          state.mockVal(state.keys.highlighted, highlighted);
          load();
          expect(props.setSelection).not.toHaveBeenCalled();
          hook.selectBtnProps.onClick();
          expect(props.setSelection).toHaveBeenCalledWith(highlightedValue);
        });
        test('on click, sets showSelectImageError to true if nothing is highlighted', () => {
          state.mockVal(state.keys.highlighted, null);
          load();
          hook.selectBtnProps.onClick();
          expect(props.setSelection).not.toHaveBeenCalled();
          expect(state.setState.showSelectImageError).toHaveBeenCalledWith(true);
        });
      });
      describe('galleryProps', () => {
        it('returns highlighted value, initialized to null', () => {
          expect(hook.galleryProps.highlighted).toEqual(state.stateVals.highlighted);
          expect(state.stateVals.highlighted).toEqual(null);
        });
        test('onHighlightChange sets highlighted with event target value', () => {
          hook.galleryProps.onHighlightChange({ target: { value: testValue } });
          expect(state.setState.highlighted).toHaveBeenCalledWith(testValue);
        });
        test('displayList returns displayListhook called with searchSortProps and images', () => {
          expect(hook.galleryProps.displayList).toEqual(displayList({
            ...props.searchSortProps,
            images: props.images,
          }));
        });
      });
      describe('galleryError', () => {
        test('show is initialized to false and returns properly', () => {
          const show = 'sHOWSelectiMaGEeRROr';
          expect(hook.galleryError.show).toEqual(false);
          state.mockVal(state.keys.showSelectImageError, show);
          hook = hooks.imgListHooks(props);
          expect(hook.galleryError.show).toEqual(show);
        });
        test('set sets showSelectImageError to true', () => {
          hook.galleryError.set();
          expect(state.setState.showSelectImageError).toHaveBeenCalledWith(true);
        });
        test('dismiss sets showSelectImageError to false', () => {
          hook.galleryError.dismiss();
          expect(state.setState.showSelectImageError).toHaveBeenCalledWith(false);
        });
        // TODO
        // it('returns selectImageError value, initialized to false', () => {
        //   expect(hook.selectImageErrorProps.isError).toEqual(state.stateVals.isSelectImageError);
        //   expect(state.stateVals.isSelectImageError).toEqual(false);
        // });
        // test('dismissError sets selectImageError to false', () => {
        //   hook.selectImageErrorProps.dismissError();
        //   expect(state.setState.isSelectImageError).toHaveBeenCalledWith(false);
        // });
      });
    });
  });
  describe('checkValidFileSize', () => {
    const selectedFileFail = testValueInvalidImage;
    const selectedFileSuccess = { value: testValue, size: 2000 };
    const clearSelection = jest.fn();
    const onSizeFail = jest.fn();
    it('returns false for valid file size ', () => {
      hook = hooks.checkValidFileSize({ selectedFile: selectedFileFail, clearSelection, onSizeFail });
      expect(clearSelection).toHaveBeenCalled();
      expect(onSizeFail).toHaveBeenCalled();
      expect(hook).toEqual(false);
    });
    it('returns true for valid file size', () => {
      hook = hooks.checkValidFileSize({ selectedFile: selectedFileSuccess, clearSelection, onSizeFail });
      expect(hook).toEqual(true);
    });
  });
  describe('fileInputHooks', () => {
    const setSelection = jest.fn();
    const clearSelection = jest.fn();
    const imgList = { inputError: { show: true, dismiss: jest.fn(), set: jest.fn() } };
    const spies = {};
    beforeEach(() => {
      hook = hooks.fileInputHooks({ setSelection, clearSelection, imgList });
    });
    it('returns a ref for the file input', () => {
      expect(hook.ref).toEqual({ current: undefined });
    });
    test('click calls current.click on the ref', () => {
      const click = jest.fn();
      React.useRef.mockReturnValueOnce({ current: { click } });
      hook = hooks.fileInputHooks({ setSelection });
      hook.click();
      expect(click).toHaveBeenCalled();
    });
    describe('addFile (uploadAsset args)', () => {
      const eventSuccess = { target: { files: [{ value: testValue, size: 2000 }] } };
      const eventFailure = { target: { files: [testValueInvalidImage] } };
      it('image fails to upload if file size is greater than 1000000', () => {
        const checkValidFileSize = false;
        spies.checkValidFileSize = jest.spyOn(hooks, hookKeys.checkValidFileSize)
          .mockReturnValueOnce(checkValidFileSize);
        hook.addFile(eventFailure);
        expect(spies.checkValidFileSize.mock.calls.length).toEqual(1);
        expect(spies.checkValidFileSize).toHaveReturnedWith(false);
      });
      it('dispatches uploadAsset thunkAction with the first target file and setSelection', () => {
        const checkValidFileSize = true;
        spies.checkValidFileSize = jest.spyOn(hooks, hookKeys.checkValidFileSize)
          .mockReturnValueOnce(checkValidFileSize);
        hook.addFile(eventSuccess);
        expect(spies.checkValidFileSize.mock.calls.length).toEqual(1);
        expect(spies.checkValidFileSize).toHaveReturnedWith(true);
        expect(dispatch).toHaveBeenCalledWith(thunkActions.app.uploadAsset({
          file: testValue,
          setSelection,
        }));
      });
    });
  });
  describe('imgHooks wrapper', () => {
    const imgListHooks = {
      galleryProps: 'some gallery props',
      selectBtnProps: 'some select btn props',
    };
    const searchAndSortHooks = { search: 'props' };
    const fileInputHooks = { file: 'input hooks' };
    const images = { sOmEuiMAge: { staTICUrl: '/assets/sOmEuiMAge' } };
    const imageCount = 1;

    const setSelection = jest.fn();
    const clearSelection = jest.fn();
    const spies = {};
    beforeEach(() => {
      spies.imgList = jest.spyOn(hooks, hookKeys.imgListHooks)
        .mockReturnValueOnce(imgListHooks);
      spies.search = jest.spyOn(hooks, hookKeys.searchAndSortHooks)
        .mockReturnValueOnce(searchAndSortHooks);
      spies.file = jest.spyOn(hooks, hookKeys.fileInputHooks)
        .mockReturnValueOnce(fileInputHooks);
      hook = hooks.imgHooks({
        setSelection, clearSelection, images, imageCount,
      });
    });
    it('forwards fileInputHooks as fileInput, called with uploadAsset prop', () => {
      expect(hook.fileInput).toEqual(fileInputHooks);
      expect(spies.file.mock.calls.length).toEqual(1);
      expect(spies.file).toHaveBeenCalledWith({
        setSelection, clearSelection, imgList: imgListHooks,
      });
    });
    it('initializes imgListHooks with setSelection,searchAndSortHooks, and images', () => {
      expect(spies.imgList.mock.calls.length).toEqual(1);
      expect(spies.imgList).toHaveBeenCalledWith({
        setSelection,
        searchSortProps: searchAndSortHooks,
        images,
        imageCount,
      });
    });
    it('forwards searchAndSortHooks as searchSortProps', () => {
      expect(hook.searchSortProps).toEqual(searchAndSortHooks);
      expect(spies.file.mock.calls.length).toEqual(1);
      expect(spies.file).toHaveBeenCalledWith({
        setSelection, clearSelection, imgList: imgListHooks,
      });
    });
    it('forwards galleryProps and selectBtnProps from the image list hooks', () => {
      expect(hook.galleryProps).toEqual(imgListHooks.galleryProps);
      expect(hook.selectBtnProps).toEqual(imgListHooks.selectBtnProps);
    });
  });
});
