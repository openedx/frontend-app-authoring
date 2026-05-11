import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import initializeStore from '@src/store';
import { initializeMocks } from '@src/testUtils';

import { courseOutlineIndexMock } from '@src/course-outline/__mocks__';

import {
  CourseOutlineStateProvider,
  useCourseOutlineState,
} from './CourseOutlineStateContext';
import { courseOutlineIndexQueryKey } from './data/outlineIndexQuery';
import { getCourseOutlineIndexApiUrl } from './data/api';

let currentItemData;
const deleteMutateAsync = jest.fn();
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
// Mock useDeleteCourseItem to return a controlled mutateAsync
jest.mock('./data/apiHooks', () => ({
  ...jest.requireActual('./data/apiHooks'),
  useCourseItemData: () => ({ data: currentItemData }),
  useDeleteCourseItem: () => ({ mutateAsync: deleteMutateAsync }),
}));

// Mutable mock for courseId to test navigation behavior
let mockCourseId = 'block-v1:edX+DemoX+Demo_Course+type@course+block@course';

jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({
    courseId: mockCourseId,
    openUnitPage: jest.fn(),
  }),
}));

describe('CourseOutlineStateContext', () => {
  beforeEach(() => {
    // Reset courseId to default before each test
    mockCourseId = 'block-v1:edX+DemoX+Demo_Course+type@course+block@course';
    deleteMutateAsync.mockReset();
    deleteMutateAsync.mockResolvedValue(undefined);
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


    const wrapper = ({ children }: { children?: React.ReactNode }) => (
      <AppProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <CourseOutlineStateProvider>
            {children}
          </CourseOutlineStateProvider>
        </QueryClientProvider>
      </AppProvider>
    );

    const { result } = renderHook(() => useCourseOutlineState(), { wrapper });

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

    describe('deleteCurrentSelection', () => {
    it('returns early when selection is empty', async () => {
      const { reduxStore: store, axiosMock, queryClient } = initializeMocks({
        user: {
          userId: 1,
          username: 'test-user',
        },
      });
      axiosMock.onGet(getCourseOutlineIndexApiUrl(mockCourseId)).reply(200, mockOutlineIndexData);
      currentItemData = null;

      const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <AppProvider store={store}>
          <QueryClientProvider client={queryClient}>
            <CourseOutlineStateProvider>
              {children}
            </CourseOutlineStateProvider>
          </QueryClientProvider>
        </AppProvider>
      );

      const { result } = renderHook(() => useCourseOutlineState(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Call with empty selection — should early-return, no mutateAsync call
      await result.current.deleteCurrentSelection(undefined as any);
      await result.current.deleteCurrentSelection({} as any);

      expect(deleteMutateAsync).not.toHaveBeenCalled();
    });

    it('deletes a section and invalidates outline index query', async () => {
      const { reduxStore: store, axiosMock, queryClient } = initializeMocks({
        user: {
          userId: 1,
          username: 'test-user',
        },
      });
      axiosMock.onGet(getCourseOutlineIndexApiUrl(mockCourseId)).reply(200, mockOutlineIndexData);
      currentItemData = null;

      const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <AppProvider store={store}>
          <QueryClientProvider client={queryClient}>
            <CourseOutlineStateProvider>
              {children}
            </CourseOutlineStateProvider>
          </QueryClientProvider>
        </AppProvider>
      );

      const { result } = renderHook(() => useCourseOutlineState(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Ensure query has data before delete
      const initialLength = result.current.sections.length;
      expect(initialLength).toBeGreaterThan(0);

      const targetSection = mockOutlineIndexData.courseStructure.childInfo.children[0];

      deleteMutateAsync.mockResolvedValue({});

      await result.current.deleteCurrentSelection({
        currentId: targetSection.id,
        sectionId: targetSection.id,
      });

      expect(deleteMutateAsync).toHaveBeenCalledWith({
        itemId: targetSection.id,
      });

      // Section should be removed from cached outline tree
      const cachedData = queryClient.getQueryData(courseOutlineIndexQueryKey(mockCourseId)) as any;
      expect(cachedData.courseStructure.childInfo.children.find(
        (s: any) => s.id === targetSection.id,
      )).toBeUndefined();
      // Other sections should remain
      expect(cachedData.courseStructure.childInfo.children.length).toBe(
        mockOutlineIndexData.courseStructure.childInfo.children.length - 1,
      );
    });

    it('does not update cache when delete mutation fails', async () => {
      const { reduxStore: store, axiosMock, queryClient } = initializeMocks({
        user: {
          userId: 1,
          username: 'test-user',
        },
      });
      axiosMock.onGet(getCourseOutlineIndexApiUrl(mockCourseId)).reply(200, mockOutlineIndexData);
      currentItemData = null;

      const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <AppProvider store={store}>
          <QueryClientProvider client={queryClient}>
            <CourseOutlineStateProvider>
              {children}
            </CourseOutlineStateProvider>
          </QueryClientProvider>
        </AppProvider>
      );

      const { result } = renderHook(() => useCourseOutlineState(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const targetSection = mockOutlineIndexData.courseStructure.childInfo.children[0];
      const cachedBefore = queryClient.getQueryData(courseOutlineIndexQueryKey(mockCourseId)) as any;
      const sectionsBefore = cachedBefore.courseStructure.childInfo.children.length;

      // Mutation rejects to simulate API failure
      deleteMutateAsync.mockRejectedValue(new Error('API error'));

      // Error should propagate unhandled since deleteCurrentSelection does not catch
      await expect(result.current.deleteCurrentSelection({
        currentId: targetSection.id,
        sectionId: targetSection.id,
      })).rejects.toThrow('API error');

      // Cache should be unchanged
      const cachedAfter = queryClient.getQueryData(courseOutlineIndexQueryKey(mockCourseId)) as any;
      expect(cachedAfter.courseStructure.childInfo.children.length).toBe(sectionsBefore);
      expect(cachedAfter.courseStructure.childInfo.children.find(
        (s: any) => s.id === targetSection.id,
      )).toBeDefined();
    });

    it('deletes a subsection', async () => {
      const { reduxStore: store, axiosMock, queryClient } = initializeMocks({
        user: {
          userId: 1,
          username: 'test-user',
        },
      });
      axiosMock.onGet(getCourseOutlineIndexApiUrl(mockCourseId)).reply(200, mockOutlineIndexData);
      currentItemData = null;

      const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <AppProvider store={store}>
          <QueryClientProvider client={queryClient}>
            <CourseOutlineStateProvider>
              {children}
            </CourseOutlineStateProvider>
          </QueryClientProvider>
        </AppProvider>
      );

      const { result } = renderHook(() => useCourseOutlineState(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const targetSection = mockOutlineIndexData.courseStructure.childInfo.children[0];
      const targetSubsection = targetSection.childInfo.children[0];

      deleteMutateAsync.mockResolvedValue({});

      await result.current.deleteCurrentSelection({
        currentId: targetSubsection.id,
        subsectionId: targetSubsection.id,
        sectionId: targetSection.id,
      });

      expect(deleteMutateAsync).toHaveBeenCalledWith({
        itemId: targetSubsection.id,
        sectionId: targetSection.id,
      });

      // Subsection should be removed from its parent section in cached tree
      const cachedData = queryClient.getQueryData(courseOutlineIndexQueryKey(mockCourseId)) as any;
      const parentSection = cachedData.courseStructure.childInfo.children.find(
        (s: any) => s.id === targetSection.id,
      );
      expect(parentSection.childInfo.children.find(
        (sub: any) => sub.id === targetSubsection.id,
      )).toBeUndefined();
      // Other subsections in parent should remain
      const sourceSection = mockOutlineIndexData.courseStructure.childInfo.children
        .find((s: any) => s.id === targetSection.id) as any;
      expect(parentSection.childInfo.children.length).toBe(
        sourceSection.childInfo.children.length - 1,
      );
    });

    it('deletes a unit', async () => {
      const { reduxStore: store, axiosMock, queryClient } = initializeMocks({
        user: {
          userId: 1,
          username: 'test-user',
        },
      });
      axiosMock.onGet(getCourseOutlineIndexApiUrl(mockCourseId)).reply(200, mockOutlineIndexData);
      currentItemData = null;

      const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <AppProvider store={store}>
          <QueryClientProvider client={queryClient}>
            <CourseOutlineStateProvider>
              {children}
            </CourseOutlineStateProvider>
          </QueryClientProvider>
        </AppProvider>
      );

      const { result } = renderHook(() => useCourseOutlineState(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const targetSection = mockOutlineIndexData.courseStructure.childInfo.children[0];
      const targetSubsection = targetSection.childInfo.children[0];
      const targetUnit = targetSubsection.childInfo.children[0];

      deleteMutateAsync.mockResolvedValue({});

      await result.current.deleteCurrentSelection({
        currentId: targetUnit.id,
        subsectionId: targetSubsection.id,
        sectionId: targetSection.id,
      });

      expect(deleteMutateAsync).toHaveBeenCalledWith({
        itemId: targetUnit.id,
        subsectionId: targetSubsection.id,
        sectionId: targetSection.id,
      });

      // Unit should be removed from its parent subsection in cached tree
      const cachedData = queryClient.getQueryData(courseOutlineIndexQueryKey(mockCourseId)) as any;
      const parentSection = cachedData.courseStructure.childInfo.children.find(
        (s: any) => s.id === targetSection.id,
      );
      const parentSubsection = parentSection.childInfo.children.find(
        (sub: any) => sub.id === targetSubsection.id,
      );
      expect(parentSubsection.childInfo.children.find(
        (u: any) => u.id === targetUnit.id,
      )).toBeUndefined();
      // Other units in parent should remain
      const originalSection = mockOutlineIndexData.courseStructure.childInfo.children
        .find((s: any) => s.id === targetSection.id) as any;
      const originalSubsection = originalSection.childInfo.children
        .find((sub: any) => sub.id === targetSubsection.id) as any;
      expect(parentSubsection.childInfo.children.length).toBe(
        originalSubsection.childInfo.children.length - 1,
      );
    });
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
      const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <AppProvider store={store}>
          <QueryClientProvider client={queryClient}>
            <CourseOutlineStateProvider>
              {children}
            </CourseOutlineStateProvider>
          </QueryClientProvider>
        </AppProvider>
      );

      const { result } = renderHook(() => useCourseOutlineState(), { wrapper });

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
      const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <AppProvider store={store}>
          <QueryClientProvider client={queryClient}>
            <CourseOutlineStateProvider>
              {children}
            </CourseOutlineStateProvider>
          </QueryClientProvider>
        </AppProvider>
      );

      const { result } = renderHook(() => useCourseOutlineState(), { wrapper });

      // courseOutlineIndexQueryKey(courseBId) = ['courseOutline', courseBId, 'index']
      // Query cache for course B should be empty until fetch resolves
      // (no initialData was passed for course B)
      const courseBQueryData = queryClient.getQueryData(courseOutlineIndexQueryKey(courseBId));
      expect(courseBQueryData).toBeUndefined();

      // Query for course B should be in pending state (fetching)
      expect(result.current.isLoading).toBe(true);
    });
  });
});
