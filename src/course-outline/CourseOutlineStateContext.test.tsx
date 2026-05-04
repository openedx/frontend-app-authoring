import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

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
    const store = initializeStore();
    const outlineIndexData = {
      ...courseOutlineIndexMock,
      createdOn: new Date().toISOString(),
    };
    store.dispatch(fetchOutlineIndexSuccess(outlineIndexData));
    store.dispatch(updateOutlineIndexLoadingStatus({ status: RequestStatus.SUCCESSFUL }));
    store.dispatch(updateSavingStatus({ status: RequestStatus.PENDING }));
    store.dispatch(updateStatusBar({ videoSharingOptions: 'by-course' }));
    store.dispatch(updateCourseActions({ allowMoveDown: true }));

    const wrapper = ({ children }: { children?: React.ReactNode }) => (
      <AppProvider store={store}>
        <CourseOutlineStateProvider>
          {children}
        </CourseOutlineStateProvider>
      </AppProvider>
    );

    const { result } = renderHook(() => useCourseOutlineState(), { wrapper });

    expect(result.current.courseName).toBe(outlineIndexData.courseStructure.displayName);
    expect(result.current.courseUsageKey).toBe(outlineIndexData.courseStructure.id);
    expect(result.current.sections).toEqual(outlineIndexData.courseStructure.childInfo.children);
    expect(result.current.savingStatus).toBe(RequestStatus.PENDING);
    expect(result.current.statusBarData.videoSharingOptions).toBe('by-course');
    expect(result.current.courseActions.allowMoveDown).toBe(true);
    expect(result.current.enableProctoredExams).toBe(true);
    expect(result.current.enableTimedExams).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isLoadingDenied).toBe(false);

    act(() => {
      result.current.selectContainer({
        currentId: 'block-v1:test+selection',
        sectionId: 'block-v1:test+section',
      });
    });
    expect(result.current.currentSelection).toEqual({
      currentId: 'block-v1:test+selection',
      sectionId: 'block-v1:test+section',
    });

    act(() => {
      result.current.openContainerInfo('block-v1:test+info', 'block-v1:test+subsection', 'block-v1:test+section', 3);
    });
    expect(result.current.currentSelection).toEqual({
      currentId: 'block-v1:test+info',
      subsectionId: 'block-v1:test+subsection',
      sectionId: 'block-v1:test+section',
      index: 3,
    });

    act(() => {
      result.current.clearSelection();
    });
    expect(result.current.currentSelection).toBeUndefined();
  });
});
