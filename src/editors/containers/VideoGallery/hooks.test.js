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
  describe('state hooks', () => {
    state.testGetter(state.keys.highlighted);
    state.testGetter(state.keys.searchString);
    state.testGetter(state.keys.showSelectVideoError);
    state.testGetter(state.keys.showSizeError);
    state.testGetter(state.keys.sortBy);
    state.testGetter(state.keys.filertBy);
    state.testGetter(state.keys.hideSelectedVideos);
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
    describe('buildVideos', () => {
      const rawVideos = [
        {
          edx_video_id: 'id_1',
          client_video_id: 'client_id_1',
          course_video_image_url: 'course_video_image_url_1',
          created: 'created_1',
          status: 'status_1',
          duration: 1,
          transcripts: [],
        },
        {
          edx_video_id: 'id_2',
          client_video_id: 'client_id_2',
          course_video_image_url: 'course_video_image_url_2',
          created: 'created_2',
          status: 'status_2',
          duration: 2,
          transcripts: [],
        },
      ];
      const expectedValues = [
        {
          id: 'id_1',
          displayName: 'client_id_1',
          externalUrl: 'course_video_image_url_1',
          dateAdded: 'created_1',
          locked: false,
          thumbnail: 'course_video_image_url_1',
          status: 'status_1',
          statusBadgeVariant: null,
          duration: 1,
          transcripts: [],
        },
        {
          id: 'id_2',
          displayName: 'client_id_2',
          externalUrl: 'course_video_image_url_2',
          dateAdded: 'created_2',
          locked: false,
          thumbnail: 'course_video_image_url_2',
          status: 'status_2',
          statusBadgeVariant: null,
          duration: 2,
          transcripts: [],
        },
      ];
      test('return the expected values', () => {
        const values = hooks.buildVideos({ rawVideos });
        expect(values).toEqual(expectedValues);
      });
    });
    describe('getstatusBadgeVariant', () => {
      test('return the expected values', () => {
        let value = hooks.getstatusBadgeVariant({ status: filterKeys.failed });
        expect(value).toEqual('danger');
        value = hooks.getstatusBadgeVariant({ status: filterKeys.uploading });
        expect(value).toEqual('light');
        value = hooks.getstatusBadgeVariant({ status: filterKeys.processing });
        expect(value).toEqual('light');
        value = hooks.getstatusBadgeVariant({ status: filterKeys.videoStatus });
        expect(value).toBeNull();
        value = hooks.getstatusBadgeVariant({ status: filterKeys.ready });
        expect(value).toBeNull();
      });
    });
    describe('videoListHooks outputs', () => {
      const props = {
        searchSortProps: {
          searchString: 'Es',
          sortBy: sortKeys.dateNewest,
          filterBy: filterKeys.videoStatus,
        },
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
  describe('videoHooks', () => {
    const videoListHooks = {
      galleryProps: 'some gallery props',
      selectBtnProps: 'some select btn props',
    };
    const searchAndSortHooks = { search: 'props' };
    const fileInputHooks = { file: 'input hooks' };
    const videos = { video: { staTICUrl: '/assets/sOmEuiMAge' } };
    const spies = {};
    beforeEach(() => {
      spies.videoList = jest.spyOn(hooks, hookKeys.videoListHooks)
        .mockReturnValueOnce(videoListHooks);
      spies.search = jest.spyOn(hooks, hookKeys.searchAndSortHooks)
        .mockReturnValueOnce(searchAndSortHooks);
      spies.file = jest.spyOn(hooks, hookKeys.fileInputHooks)
        .mockReturnValueOnce(fileInputHooks);
      hook = hooks.videoHooks({ videos });
    });
    it('forwards fileInputHooks as fileInput', () => {
      expect(hook.fileInput).toEqual(fileInputHooks);
      expect(spies.file.mock.calls.length).toEqual(1);
      expect(spies.file).toHaveBeenCalled();
    });
    it('initializes videoListHooks', () => {
      expect(spies.videoList.mock.calls.length).toEqual(1);
      expect(spies.videoList).toHaveBeenCalledWith({
        searchSortProps: searchAndSortHooks,
        videos,
      });
    });
    it('forwards searchAndSortHooks as searchSortProps', () => {
      expect(hook.searchSortProps).toEqual(searchAndSortHooks);
      expect(spies.search.mock.calls.length).toEqual(1);
      expect(spies.search).toHaveBeenCalled();
    });
    it('forwards galleryProps and selectBtnProps from the video list hooks', () => {
      expect(hook.galleryProps).toEqual(videoListHooks.galleryProps);
      expect(hook.selectBtnProps).toEqual(videoListHooks.selectBtnProps);
    });
  });
});
