import * as hooks from './hooks';
import { filterKeys, sortKeys } from './utils';
import { MockUseState } from '../../../testUtils';
import { keyStore } from '../../utils';

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

const state = new MockUseState(hooks);
const hookKeys = keyStore(hooks);
let hook;
const testValue = 'testVALUEVALID';

describe('VideoGallery hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    describe('filterListBySearch', () => {
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
        hook = hooks.filterListBySearch({ searchString, videoList: { filter } });
        expect(filter).toHaveBeenCalled();
        const [[filterCb]] = filter.mock.calls;
        matching.forEach(val => expect(filterCb({ displayName: val })).toEqual(true));
        notMatching.forEach(val => expect(filterCb({ displayName: val })).toEqual(false));
      });
    });
    describe('imgListHooks outputs', () => {
      const props = {
        searchSortProps: { searchString: 'Es', sortBy: sortKeys.dateNewest, filterBy: filterKeys.videoStatus },
        videos: [
          {
            displayName: 'sOmEuiMAge',
            staTICUrl: '/assets/sOmEuiMAge',
            id: 'sOmEuiMAgeURl',
          },
        ],
      };
      const filterList = (args) => ({ filterList: args });
      const load = () => {
        jest.spyOn(hooks, hookKeys.filterList).mockImplementationOnce(filterList);
        hook = hooks.videoListHooks(props);
      };
      beforeEach(() => {
        load();
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
        test('displayList returns filterListhook called with searchSortProps and videos', () => {
          expect(hook.galleryProps.displayList).toEqual(filterList({
            ...props.searchSortProps,
            videos: props.videos,
          }));
        });
      });
      describe('galleryError', () => {
        test('show is initialized to false and returns properly', () => {
          const show = 'sHOWSelectiRROr';
          expect(hook.galleryError.show).toEqual(false);
          state.mockVal(state.keys.showSelectVideoError, show);
          hook = hooks.videoListHooks(props);
          expect(hook.galleryError.show).toEqual(show);
        });
        test('set sets showSelectVideoError to true', () => {
          hook.galleryError.set();
          expect(state.setState.showSelectVideoError).toHaveBeenCalledWith(true);
        });
        test('dismiss sets showSelectVideoError to false', () => {
          hook.galleryError.dismiss();
          expect(state.setState.showSelectVideoError).toHaveBeenCalledWith(false);
        });
      });
    });
  });
});
