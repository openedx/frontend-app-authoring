import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import initializeStore from '@src/store';
import { initializeMocks } from '@src/testUtils';

import { buildTestOutline } from '@src/course-outline/__mocks__/helpers';

import {
  CourseOutlineProvider,
  useCourseOutlineContext,
} from './CourseOutlineContext';
import { courseOutlineQueryKeys } from './data/queryKeys';
import { getCourseOutlineIndexApiUrl } from './data';

let currentItemData;
const mockOutlineIndexData = buildTestOutline({
  sections: [
    {
      id: 'section-1',
      displayName: 'Section 1',
      children: [{ id: 'subsection-1a', children: [{ id: 'unit-1a1' }] }],
    },
    {
      id: 'section-2',
      displayName: 'Section 2',
      children: [
        { id: 'subsection-2a' },
        {
          id: 'subsection-2b',
          displayName: 'Subsection 2B',
          children: [{ id: 'unit-2b1' }, { id: 'unit-2b2' }],
        },
      ],
    },
    { id: 'section-3', displayName: 'Section 3' },
    { id: 'section-4', displayName: 'Section 4', children: [{ id: 'subsection-4a' }] },
  ],
  overrides: {
    createdOn: new Date().toISOString(),
    courseStructure: {
      videoSharingOptions: 'by-course',
      enableProctoredExams: true,
      enableTimedExams: true,
      actions: {
        deletable: true,
        draggable: true,
        childAddable: true,
        duplicable: true,
        allowMoveDown: true,
      },
    },
  },
});

// Mock useCourseItemData to return mock data
jest.mock('./data/apiHooks', () => ({
  ...jest.requireActual('./data/apiHooks'),
  useCourseItemData: () => ({ data: currentItemData }),
}));

// Mutable mock for courseId to test navigation behavior
let mockCourseId = 'block-v1:edX+DemoX+Demo_Course+type@course+block@course';

jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({
    courseId: mockCourseId,
    openUnitPage: jest.fn(),
  }),
}));

describe('CourseOutlineContext', () => {
  beforeEach(() => {
    // Reset courseId to default before each test
    mockCourseId = 'block-v1:edX+DemoX+Demo_Course+type@course+block@course';
  });

  it('exposes outline state and selection actions from legacy sources', async () => {
    const { reduxStore: store, axiosMock, queryClient } = initializeMocks({
      user: {
        userId: 1,
        username: 'test-user',
      },
    });
    axiosMock.onGet(getCourseOutlineIndexApiUrl(mockCourseId)).reply(200, mockOutlineIndexData);
    currentItemData = null;

    const wrapper = ({ children }: { children?: React.ReactNode; }) => (
      <AppProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <CourseOutlineProvider>
            {children}
          </CourseOutlineProvider>
        </QueryClientProvider>
      </AppProvider>
    );

    const { result } = renderHook(() => useCourseOutlineContext(), { wrapper });

    // Wait for background fetch to settle (refetchOnMount=true)
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const lastSection = mockOutlineIndexData.courseStructure.childInfo.children.at(-1)! as any;
    const lastSubsection = lastSection.childInfo.children.at(-1)! as any;

    // Selection state machine: selectContainer → openContainerInfo → clearSelection
    currentItemData = lastSection;
    act(() => {
      result.current.selectContainer({
        currentId: lastSection.id,
        sectionId: lastSection.id,
      });
    });
    expect(result.current.currentSelection).toEqual({
      currentId: lastSection.id,
      sectionId: lastSection.id,
    });
    expect(result.current.currentItemData).toEqual(lastSection);
    expect(result.current.lastEditableSection).toEqual(lastSection);
    expect(result.current.lastEditableSubsection).toEqual({
      data: lastSubsection,
      sectionId: lastSection.id,
    });

    currentItemData = lastSubsection;
    act(() => {
      result.current.openContainerInfo(lastSubsection.id, lastSubsection.id, lastSection.id, 3);
    });
    expect(result.current.currentSelection).toEqual({
      currentId: lastSubsection.id,
      subsectionId: lastSubsection.id,
      sectionId: lastSection.id,
      index: 3,
    });
    expect(result.current.currentItemData).toEqual(lastSubsection);
    expect(result.current.lastEditableSection).toBeUndefined();
    expect(result.current.lastEditableSubsection).toEqual({
      data: lastSubsection,
      sectionId: lastSection.id,
    });

    currentItemData = null;
    act(() => {
      result.current.clearSelection();
    });
    expect(result.current.currentSelection).toBeUndefined();
    expect(result.current.currentItemData).toBeNull();
  });

  describe('course navigation', () => {
    const courseBId = 'block-v1:Other+Course+type@course+block@other_course';

    it('resets sections and fetches fresh data on courseId change (no stale Redux initialData)', () => {
      initializeMockApp({
        authenticatedUser: {
          userId: 1,
          username: 'test-user',
        },
      });
      currentItemData = null;
      const store = initializeStore();
      mockCourseId = courseBId;

      const queryClient = new QueryClient();
      const wrapper = ({ children }: { children?: React.ReactNode; }) => (
        <AppProvider store={store}>
          <QueryClientProvider client={queryClient}>
            <CourseOutlineProvider>
              {children}
            </CourseOutlineProvider>
          </QueryClientProvider>
        </AppProvider>
      );

      const { result } = renderHook(() => useCourseOutlineContext(), { wrapper });

      // Sections should be empty (not stale Redux data from course A)
      expect(result.current.sections).toEqual([]);
      // React Query cache for course B should have no initialData
      expect(queryClient.getQueryData(courseOutlineQueryKeys.index(courseBId))).toBeUndefined();
      // Loading state should reflect the fresh fetch
      expect(result.current.isLoading).toBe(true);
      expect(result.current.courseName).toBeUndefined();
    });
  });
});
