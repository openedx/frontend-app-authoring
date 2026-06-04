import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import initializeStore from '@src/store';
import { initializeMocks } from '@src/testUtils';

import { courseOutlineIndexMock } from '@src/course-outline/__mocks__';

import {
  CourseOutlineProvider,
  useCourseOutlineContext,
} from './CourseOutlineContext';
import { courseOutlineQueryKeys } from './data/queryKeys';
import { getCourseOutlineIndexApiUrl } from './data';

let currentItemData;
const mockOutlineIndexData = {
  ...courseOutlineIndexMock,
  courseStructure: {
    ...courseOutlineIndexMock.courseStructure,
    videoSharingOptions: 'by-course',
    actions: {
      ...courseOutlineIndexMock.courseStructure.actions,
      allowMoveDown: true,
    },
  },
  createdOn: new Date().toISOString(),
};

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

    const lastSection = mockOutlineIndexData.courseStructure.childInfo.children.at(-1)!;
    const lastSubsection = lastSection.childInfo.children.at(-1)!;

    expect(result.current.courseName).toBe(mockOutlineIndexData.courseStructure.displayName);
    expect(result.current.courseUsageKey).toBe(mockOutlineIndexData.courseStructure.id);
    expect(result.current.sections).toHaveLength(mockOutlineIndexData.courseStructure.childInfo.children.length);
    expect(result.current.sections.map(section => section.id)).toEqual(
      mockOutlineIndexData.courseStructure.childInfo.children.map(section => section.id),
    );
    expect(result.current.savingStatus).toBe('');
    expect(result.current.statusBarData.videoSharingOptions).toBe('by-course');
    expect(result.current.courseActions.allowMoveDown).toBe(true);
    expect(result.current.enableProctoredExams).toBe(true);
    expect(result.current.enableTimedExams).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isLoadingDenied).toBe(false);
    expect(result.current.currentItemData).toBeNull();
    expect(result.current.lastEditableSection).toEqual(lastSection);
    expect(result.current.lastEditableSubsection).toEqual({
      data: lastSubsection,
      sectionId: lastSection.id,
    });

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

    it('resets sections on courseId change, does not show stale Redux data', () => {
      initializeMockApp({
        authenticatedUser: {
          userId: 1,
          username: 'test-user',
        },
      });
      currentItemData = null;
      const store = initializeStore();
      // Set courseId to course B (simulating navigation)
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

      // While query loads for course B, sections should be empty
      // NOT the stale course A sections from Redux
      expect(result.current.sections).toEqual([]);
      // isLoading should be true since React Query is fetching (no API mock)
      expect(result.current.isLoading).toBe(true);
      // courseName should be undefined while loading (no data for course B yet)
      expect(result.current.courseName).toBeUndefined();
    });

    it('does not pass stale Redux data as initialData to React Query for different course', () => {
      initializeMockApp({
        authenticatedUser: {
          userId: 1,
          username: 'test-user',
        },
      });
      currentItemData = null;
      const store = initializeStore();
      // Set courseId to course B
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

      // courseOutlineQueryKeys.index(courseBId) = ['courseOutline', courseBId, 'index']
      // Query cache for course B should be empty until fetch resolves
      // (no initialData was passed for course B)
      const courseBQueryData = queryClient.getQueryData(courseOutlineQueryKeys.index(courseBId));
      expect(courseBQueryData).toBeUndefined();

      // Query for course B should be in pending state (fetching)
      expect(result.current.isLoading).toBe(true);
    });
  });
});
