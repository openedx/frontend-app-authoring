import React from 'react';
import { dispatch } from 'react-redux';

import { MockUseState } from '../../../../../testUtils';
import { keyStore } from '../../../../utils';
import { thunkActions } from '../../../../data/redux';

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

jest.mock('../../../../data/redux', () => ({
  thunkActions: {
    app: {
      fetchImages: jest.fn(),
      uploadImage: jest.fn(),
    },
  },
}));

jest.mock('react-redux', () => {
  const dispatchFn = jest.fn();
  return {
    ...jest.requireActual('react-redux'),
    dispatch: dispatchFn,
    useDispatch: jest.fn(() => dispatchFn),
  };
});

jest.mock('../../../../data/redux', () => ({
  thunkActions: {
    app: {
      fetchImages: jest.fn(),
      uploadImage: jest.fn(),
    },
  },
}));

const state = new MockUseState(hooks);
const hookKeys = keyStore(hooks);
let hook;
const testValue = 'testVALUE';

describe('SelectImageModal hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('state hooks', () => {
    state.testGetter(state.keys.images);
    state.testGetter(state.keys.highlighted);
    state.testGetter(state.keys.searchString);
    state.testGetter(state.keys.sortBy);
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
        images: { p1: 'data1', p2: 'data2', p3: 'other distinct data' },
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
      };
      const displayList = (args) => ({ displayList: args });
      const load = () => {
        jest.spyOn(hooks, hookKeys.displayList).mockImplementationOnce(displayList);
        hook = hooks.imgListHooks(props);
      };
      beforeEach(() => {
        load();
      });
      it('returns images value, initialized to an empty object', () => {
        expect(state.stateVals.images).toEqual(hook.images);
        expect(state.stateVals.images).toEqual({});
      });
      it('dispatches fetchImages thunkAction once, with setImages as onSuccess param', () => {
        expect(React.useEffect.mock.calls.length).toEqual(1);
        const [cb, prereqs] = React.useEffect.mock.calls[0];
        expect(prereqs).toEqual([]);
        cb();
        expect(dispatch).toHaveBeenCalledWith(
          thunkActions.app.fetchImages({ setImages: state.setState.images }),
        );
      });
      describe('selectBtnProps', () => {
        it('is disabled if nothing is highlighted', () => {
          expect(hook.selectBtnProps.disabled).toEqual(true);
          state.mockVal(state.keys.highlighted, { some: 'value' });
          load();
          expect(hook.selectBtnProps.disabled).toEqual(false);
        });
        test('on click, if sets selection to the image with the same id', () => {
          const highlighted = 'id1';
          state.mockVal(state.keys.images, { [highlighted]: testValue });
          state.mockVal(state.keys.highlighted, highlighted);
          load();
          expect(props.setSelection).not.toHaveBeenCalled();
          hook.selectBtnProps.onClick();
          expect(props.setSelection).toHaveBeenCalledWith(testValue);
        });
      });
      describe('galleryProps', () => {
        it('returns highlighted value, initialized to null', () => {
          expect(hook.galleryProps.highlighted).toEqual(state.stateVals.highlighted);
          expect(state.stateVals.highlighted).toEqual(null);
        });
        test('onHighlightChange sets highlighted with event target value', () => {
          expect(hook.galleryProps.onHighlightChange({ target: { value: testValue } }));
          expect(state.setState.highlighted).toHaveBeenCalledWith(testValue);
        });
        test('displayList returns displayListhook called with searchSortProps and images', () => {
          expect(hook.galleryProps.displayList).toEqual(displayList({
            ...props.searchSortProps,
            images: hook.images,
          }));
        });
      });
    });
  });
  describe('fileInputHooks', () => {
    const setSelection = jest.fn();
    beforeEach(() => {
      hook = hooks.fileInputHooks({ setSelection });
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
    describe('addFile (uploadImage args)', () => {
      const event = { target: { files: [testValue] } };
      it('dispatches uploadImage thunkAction with the first target file and setSelection', () => {
        hook.addFile(event);
        expect(dispatch).toHaveBeenCalledWith(thunkActions.app.uploadImage({
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

    const setSelection = jest.fn();
    const spies = {};
    beforeEach(() => {
      spies.imgList = jest.spyOn(hooks, hookKeys.imgListHooks)
        .mockReturnValueOnce(imgListHooks);
      spies.search = jest.spyOn(hooks, hookKeys.searchAndSortHooks)
        .mockReturnValueOnce(searchAndSortHooks);
      spies.file = jest.spyOn(hooks, hookKeys.fileInputHooks)
        .mockReturnValueOnce(fileInputHooks);
      hook = hooks.imgHooks({ setSelection });
    });
    it('forwards fileInputHooks as fileInput, called with uploadImage prop', () => {
      expect(hook.fileInput).toEqual(fileInputHooks);
      expect(spies.file.mock.calls.length).toEqual(1);
      expect(spies.file).toHaveBeenCalledWith({
        setSelection,
      });
    });
    it('initializes imgListHooks with setSelection and searchAndSortHooks', () => {
      expect(spies.imgList.mock.calls.length).toEqual(1);
      expect(spies.imgList).toHaveBeenCalledWith({
        setSelection,
        searchSortProps: searchAndSortHooks,
      });
    });
    it('forwards searchAndSortHooks as searchSortProps', () => {
      expect(hook.searchSortProps).toEqual(searchAndSortHooks);
      expect(spies.file.mock.calls.length).toEqual(1);
      expect(spies.file).toHaveBeenCalledWith({ setSelection });
    });
    it('forwards galleryProps and selectBtnProps from the image list hooks', () => {
      expect(hook.galleryProps).toEqual(imgListHooks.galleryProps);
      expect(hook.selectBtnProps).toEqual(imgListHooks.selectBtnProps);
    });
  });
});
