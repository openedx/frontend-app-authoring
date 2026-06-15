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

// Use a stable reference with distinctive sentinel values for each field
const outlineFixture = buildTestOutline({
  overrides: {
    courseReleaseDate: '2024-06-01T00:00:00Z',
    courseStructure: {
      displayName: 'Demonstration Course',
      highlightsEnabledForMessaging: true,
      videoSharingOptions: 'all',
      videoSharingEnabled: true,
      end: '2024-12-31T00:00:00Z',
      hasChanges: true,
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
    // Default fixture has 4 sections — assert known count, not fixture-derived length
    expect(outlineIndex?.courseStructure.childInfo.children).toHaveLength(4);
    // Verify first section ID matches expected default
    expect(outlineIndex?.courseStructure.childInfo.children[0].id).toBe(
      'block-v1:test+course+2025+type@chapter+block@section-1',
    );
  });

  it('builds status bar payload from outline index response', () => {
    const outlineIndex = outlineFixture;

    // Use hardcoded sentinel values — would catch if fields were swapped or misnamed
    expect(getCourseOutlineStatusBarData(outlineIndex as any)).toEqual({
      courseReleaseDate: '2024-06-01T00:00:00Z',
      highlightsEnabledForMessaging: true,
      videoSharingOptions: 'all',
      videoSharingEnabled: true,
      endDate: '2024-12-31T00:00:00Z',
      hasChanges: true,
    });
  });
});
