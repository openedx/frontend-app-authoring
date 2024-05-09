import { createSelector } from '@reduxjs/toolkit';
import { RequestStatus } from 'CourseAuthoring/data/constants';

export const getCourseUnitData = (state) => state.courseUnit.unit;
export const getCanEdit = (state) => state.courseUnit.canEdit;
export const getStaticFileNotices = (state) => state.courseUnit.staticFileNotices;
export const getCourseUnit = (state) => state.courseUnit;
export const getSavingStatus = (state) => state.courseUnit.savingStatus;
export const getSequenceStatus = (state) => state.courseUnit.sequenceStatus;
export const getSequenceIds = (state) => state.courseUnit.courseSectionVertical.courseSequenceIds;
export const getCourseSectionVertical = (state) => state.courseUnit.courseSectionVertical;
export const getCourseId = (state) => state.courseDetail.courseId;
export const getSequenceId = (state) => state.courseUnit.sequenceId;
export const getCourseVerticalChildren = (state) => state.courseUnit.courseVerticalChildren;
const getLoadingStatuses = (state) => state.courseUnit.loadingStatus;
export const getMovedXBlockParams = (state) => state.courseUnit.movedXBlockParams;
export const getIsLoading = createSelector(
  [getLoadingStatuses],
  loadingStatus => Object.values(loadingStatus)
    .some((status) => status === RequestStatus.IN_PROGRESS),
);
export const getIsLoadingFailed = createSelector(
  [getLoadingStatuses],
  loadingStatus => Object.values(loadingStatus)
    .some((status) => status === RequestStatus.FAILED),
);
