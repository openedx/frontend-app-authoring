import {
  initializeMocks,
  makeWrapper,
  renderHook,
  waitFor,
} from '@src/testUtils';
import { buildTestOutline } from '@src/course-outline/__mocks__';

import { getCourseOutlineIndex, getCourseOutlineIndexApiUrl } from './api';
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

  it('requests the full view of the course outline and camel-cases it', async () => {
    const sectionId = 'block-v1:edX+DemoX+Demo_Course+type@chapter+block@intro';
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseId)).reply(200, {
      course_release_date: 'Jan 15, 2026 at 00:00 UTC',
      course_structure: {
        id: 'block-v1:edX+DemoX+Demo_Course+type@course+block@course',
        display_name: 'Demonstration Course',
        category: 'course',
        has_changes: false,
        child_info: {
          category: 'chapter',
          display_name: 'Section',
          children: [{ id: sectionId, display_name: 'Introduction', category: 'chapter' }],
        },
      },
      deprecated_blocks_info: {
        deprecated_enabled_block_types: [],
        blocks: [],
        advance_settings_url: `/settings/advanced/${courseId}`,
      },
      discussions_incontext_feedback_url: '',
      discussions_incontext_learnmore_url: '',
      discussions_settings: {
        enable_in_context: true,
        enable_graded_units: false,
        unit_level_visibility: true,
        discussion_configuration_url: 'http://apps.example.com/discussion/settings',
      },
      initial_state: null,
      language_code: 'en',
      lms_link: null,
      mfe_proctored_exam_settings_url: '',
      notification_dismiss_url: null,
      proctoring_errors: [],
      reindex_link: `/course/${courseId}/search_reindex`,
      rerun_notification_id: null,
      advance_settings_url: `/settings/advanced/${courseId}`,
      is_custom_relative_dates_active: true,
      created_on: '2025-11-02T09:30:00Z',
    });

    const outline = await getCourseOutlineIndex(courseId);

    expect(axiosMock.history.get).toHaveLength(1);
    expect(axiosMock.history.get[0].url).toBe(
      `http://localhost:18010/api/authoring/v2/courses/${courseId}/outline/`,
    );
    expect(axiosMock.history.get[0].params).toEqual({ view: 'full' });
    expect(outline.courseStructure.childInfo?.children[0]).toEqual(
      { id: sectionId, displayName: 'Introduction', category: 'chapter' },
    );
    expect(outline.discussionsSettings).toMatchObject({ enableGradedUnits: false });
    expect(outline.reindexLink).toBe(`/course/${courseId}/search_reindex`);
    expect(outline.isCustomRelativeDatesActive).toBe(true);
    expect(outline.createdOn).toBe('2025-11-02T09:30:00Z');
    expect(outline.lmsLink).toBeNull();
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
