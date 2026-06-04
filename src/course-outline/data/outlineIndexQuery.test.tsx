import {
  initializeMocks,
  makeWrapper,
  renderHook,
  waitFor,
} from '@src/testUtils';
import { buildTestOutline } from '@src/course-outline/__mocks__';

import { getCourseOutlineIndexApiUrl } from './api';
import {
  getCourseOutlineStatusBarData,
  useCourseOutlineIndex,
} from './outlineIndexQuery';

const courseId = 'course-v1:edX+DemoX+Demo_Course';

let axiosMock;

// Use a stable reference so both tests share the same structure
const outlineFixture = buildTestOutline({
  overrides: {
    courseStructure: {
      displayName: 'Demonstration Course',
      videoSharingOptions: 'per-video',
      videoSharingEnabled: true,
    },
  },
});

describe('outlineIndexQuery', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  it('fetches outline index with React Query', async () => {
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseId)).reply(200, outlineFixture);

    const { result } = renderHook(() => useCourseOutlineIndex(courseId), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const outlineIndex = result.current.data as any;

    expect(outlineIndex?.courseStructure.displayName).toBe('Demonstration Course');
    expect(outlineIndex?.courseStructure.childInfo.children).toHaveLength(
      (outlineFixture.courseStructure as any).childInfo.children.length,
    );
  });

  it('builds status bar payload from outline index response', () => {
    const outlineIndex = outlineFixture;

    expect(getCourseOutlineStatusBarData(outlineIndex as any)).toEqual({
      courseReleaseDate: outlineIndex.courseReleaseDate,
      highlightsEnabledForMessaging: (outlineIndex.courseStructure as any).highlightsEnabledForMessaging,
      videoSharingOptions: (outlineIndex.courseStructure as any).videoSharingOptions,
      videoSharingEnabled: (outlineIndex.courseStructure as any).videoSharingEnabled,
      endDate: (outlineIndex.courseStructure as any).end,
      hasChanges: (outlineIndex.courseStructure as any).hasChanges,
    });
  });
});
