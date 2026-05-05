import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

import initializeStore from '@src/store';
import { RequestStatus } from '@src/data/constants';
import { courseOutlineIndexMock } from '@src/course-outline/__mocks__';
import {
  fetchOutlineIndexSuccess,
  updateCourseActions,
  updateOutlineIndexLoadingStatus,
  updateSavingStatus,
  updateStatusBar,
} from '@src/course-outline/data/slice';
import {
  CourseOutlineStateProvider,
  useCourseOutlineState,
} from './CourseOutlineStateContext';

let currentItemData;
const mockOutlineIndexData = {
  ...courseOutlineIndexMock,
  courseStructure: {
    ...courseOutlineIndexMock.courseStructure,
    videoSharingOptions: 'by-course',
  },
  createdOn: new Date().toISOString(),
};

// Mock useCourseItemData to return mock data
jest.mock('./data/apiHooks', () => ({
  ...jest.requireActual('./data/apiHooks'),
  useCourseItemData: () => ({ data: currentItemData }),
}));

jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({
    courseId: 'block-v1:edX+DemoX+Demo_Course+type@course+block@course',
    openUnitPage: jest.fn(),
  }),
}));

describe('CourseOutlineStateContext', () => {
  it('exposes outline state and selection actions from legacy sources', () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 1,
        username: 'test-user',
        administrator: true,
        roles: [],
      },
    });
    currentItemData = null;
    const store = initializeStore();
    store.dispatch(fetchOutlineIndexSuccess(mockOutlineIndexData));
    store.dispatch(updateOutlineIndexLoadingStatus({ status: RequestStatus.SUCCESSFUL }));
    store.dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    store.dispatch(updateStatusBar({ videoSharingOptions: 'by-course' }));
    store.dispatch(updateCourseActions({ allowMoveDown: true }));

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
    const lastSection = mockOutlineIndexData.courseStructure.childInfo.children.at(-1)!;
    const lastSubsection = lastSection.childInfo.children.at(-1)!;

    expect(result.current.courseName).toBe(mockOutlineIndexData.courseStructure.displayName);
    expect(result.current.courseUsageKey).toBe(mockOutlineIndexData.courseStructure.id);
    expect(result.current.sections).toEqual(mockOutlineIndexData.courseStructure.childInfo.children);
    expect(result.current.savingStatus).toBe(RequestStatus.PENDING);
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
});
