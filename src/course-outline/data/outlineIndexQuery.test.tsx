import {
  initializeMocks,
  makeWrapper,
  renderHook,
  waitFor,
} from '@src/testUtils';
import { courseOutlineIndexMock } from '@src/course-outline/__mocks__';

import { getCourseOutlineIndexApiUrl } from './api';
import {
  getCourseOutlineStatusBarData,
  useCourseOutlineIndex,
} from './outlineIndexQuery';

const courseId = 'course-v1:edX+DemoX+Demo_Course';

let axiosMock;

describe('outlineIndexQuery', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  it('fetches outline index with React Query', async () => {
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseId)).reply(200, courseOutlineIndexMock);

    const { result } = renderHook(() => useCourseOutlineIndex(courseId), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const outlineIndex = result.current.data as any;

    expect(outlineIndex?.courseStructure.displayName).toBe(
      courseOutlineIndexMock.courseStructure.displayName,
    );
    expect(outlineIndex?.courseStructure.childInfo.children).toHaveLength(
      courseOutlineIndexMock.courseStructure.childInfo.children.length,
    );
  });

  it('defaults refetchOnMount to true when initialData is provided (background fetch)', async () => {
    // The fix changed refetchOnMount from !initialData to true.
    // This test verifies that when initialData is provided, the query
    // still performs a background fetch (proving refetchOnMount=true).
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseId)).reply(200, courseOutlineIndexMock);

    renderHook(() => useCourseOutlineIndex(courseId, {
      initialData: courseOutlineIndexMock as any,
    }), { wrapper: makeWrapper() });

    // If refetchOnMount were false (old behavior), no API call would be made
    // because initialData satisfies the query. With the fix (refetchOnMount=true),
    // a background fetch is triggered.
    await waitFor(() => {
      expect(axiosMock.history.get.length).toBe(1);
    });
  });

  it('builds status bar payload from outline index response', () => {
    const outlineIndex = courseOutlineIndexMock as any;

    expect(getCourseOutlineStatusBarData(outlineIndex)).toEqual({
      courseReleaseDate: outlineIndex.courseReleaseDate,
      highlightsEnabledForMessaging: outlineIndex.courseStructure.highlightsEnabledForMessaging,
      videoSharingOptions: outlineIndex.courseStructure.videoSharingOptions,
      videoSharingEnabled: outlineIndex.courseStructure.videoSharingEnabled,
      endDate: outlineIndex.courseStructure.end,
      hasChanges: outlineIndex.courseStructure.hasChanges,
    });
  });
});
