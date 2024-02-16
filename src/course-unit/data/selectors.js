import { createSelector } from '@reduxjs/toolkit';

import { RequestStatus } from '../../data/constants';

export const getCourseUnitData = (state) => state.courseUnit.unit;

export const getSavingStatus = (state) => state.courseUnit.savingStatus;

export const getLoadingStatus = (state) => state.courseUnit.loadingStatus;

export const getSequenceStatus = (state) => state.courseUnit.sequenceStatus;

export const getCourseSectionVertical = (state) => state.courseUnit.courseSectionVertical;

export const getCourseStatus = state => state.courseUnit.courseStatus;
export const getCoursewareMeta = state => state.models.coursewareMeta;
export const getSections = state => state.models.sections;
export const getCourseId = state => state.courseDetail.courseId;

export const sequenceIdsSelector = createSelector(
  [getCourseStatus, getCoursewareMeta, getSections, getCourseId],
  (courseStatus, coursewareMeta, sections, courseId) => {
    if (courseStatus !== RequestStatus.SUCCESSFUL) {
      return [];
    }

    const sectionIds = coursewareMeta[courseId].sectionIds || [];
    return sectionIds.flatMap(sectionId => sections[sectionId].sequenceIds);
  },
);
