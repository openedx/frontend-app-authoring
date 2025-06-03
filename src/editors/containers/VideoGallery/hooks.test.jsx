import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import * as hooks from './hooks';
import * as appHooks from '../../hooks';
import { filterKeys } from './utils';

jest.mock('react-redux', () => {
  const actual = jest.requireActual('react-redux');
  return {
    ...actual,
    useSelector: jest.fn((selectorFn) => selectorFn({
      app: {
        learningContextId: 'course-v1:id',
        blockId: 'block-v1:id',
      },
    })),
  };
});

jest.mock('../../hooks', () => ({
  navigateTo: jest.fn(),
}));

const createStore = (customState = {}) => configureStore({
  reducer: () => customState,
  middleware: [thunk],
});

describe('hooks module', () => {
  describe('useSearchAndSortProps', () => {
    it('should update search string', () => {
      const { result } = renderHook(() => hooks.useSearchAndSortProps());
      act(() => {
        result.current.onSearchChange({ target: { value: 'test' } });
      });
      expect(result.current.searchString).toBe('test');
    });

    it('should toggle hideSelectedVideos', () => {
      const { result } = renderHook(() => hooks.useSearchAndSortProps());
      expect(result.current.hideSelectedVideos).toBe(false);
      act(() => {
        result.current.onSwitchClick();
      });
      expect(result.current.hideSelectedVideos).toBe(true);
    });
  });

  describe('filterListBySearch', () => {
    it('filters videoList based on searchString', () => {
      const filtered = hooks.filterListBySearch({
        searchString: 'video',
        videoList: [{ displayName: 'video 1' }, { displayName: 'other' }],
      });
      expect(filtered).toHaveLength(1);
    });
  });

  describe('filterListByStatus', () => {
    it('returns full list for anyStatus', () => {
      const list = [{ status: 'uploading' }];
      const result = hooks.filterListByStatus({ statusFilter: filterKeys.anyStatus, videoList: list });
      expect(result).toEqual(list);
    });

    it('filters list by matching status', () => {
      const list = [
        { status: filterKeys.uploading },
        { status: filterKeys.failed },
      ];
      const result = hooks.filterListByStatus({ statusFilter: 'uploading', videoList: list });
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe(filterKeys.uploading);
    });
  });

  describe('getstatusBadgeVariant', () => {
    it('returns correct variant for status', () => {
      expect(hooks.getstatusBadgeVariant({ status: filterKeys.failed })).toBe('danger');
      expect(hooks.getstatusBadgeVariant({ status: filterKeys.uploading })).toBe('light');
      expect(hooks.getstatusBadgeVariant({ status: 'unknown' })).toBe(null);
    });
  });

  describe('buildVideos', () => {
    it('converts rawVideos into display format', () => {
      jest.spyOn(hooks, 'getstatusBadgeVariant').mockReturnValue('light');
      jest.spyOn(hooks, 'getStatusMessage').mockReturnValue('Uploading');

      const rawVideos = {
        one: {
          edx_video_id: 'vid1',
          client_video_id: 'Video 1',
          course_video_image_url: 'img1.jpg',
          created: '2024-01-01T00:00:00Z',
          status_nontranslated: 'uploading',
          duration: '10:00',
          transcripts: [],
        },
      };
      const result = hooks.buildVideos({ rawVideos });
      expect(result[0].id).toBe('vid1');
      expect(result[0].statusBadgeVariant).toBe('light');
      expect(result[0].statusMessage).toBe('Uploading');
    });
  });

  describe('useVideoListProps - selectBtnProps', () => {
    const videos = [{ displayName: 'Test Video', status: 'ready' }];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    const wrapper = ({ children }) => (
      <Provider store={createStore()}>{children}</Provider>
    );

    it('navigates to video editor when a video is selected', async () => {
      const { result } = renderHook(
        () => hooks.useVideoListProps({
          searchSortProps: {
            searchString: '',
            sortBy: 'dateNewest',
            filterBy: filterKeys.anyStatus,
            hideSelectedVideos: false,
          },
          videos,
        }),
        { wrapper },
      );

      act(() => {
        result.current.galleryProps.onHighlightChange({ target: { value: 'video123' } });
      });

      await act(async () => {
        await result.current.selectBtnProps.onClick();
      });

      expect(appHooks.navigateTo).toHaveBeenCalledWith(
        '/course/course-v1:id/editor/video/block-v1:id?selectedVideoId=video123',
      );
    });

    it('sets showSelectVideoError to true if no video is selected', () => {
      const { result } = renderHook(
        () => hooks.useVideoListProps({
          searchSortProps: {
            searchString: '',
            sortBy: 'dateNewest',
            filterBy: filterKeys.anyStatus,
            hideSelectedVideos: false,
          },
          videos,
        }),
        { wrapper },
      );

      act(() => {
        result.current.selectBtnProps.onClick();
      });

      expect(result.current.galleryError.show).toBe(true);
    });
  });
});
