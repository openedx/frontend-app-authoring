import { useEffect, useMemo } from 'react';
import moment from 'moment';

import { logError } from '@edx/frontend-platform/logging';
import { RequestStatus } from '@src/data/constants';
import type { XBlock, XBlockActions } from '@src/data/types';
import {
  getCourseOutlineStatusBarData,
  useCourseOutlineIndex,
  useCourseBestPractices,
  useCourseLaunch,
  createDiscussionsTopics,
  type CourseOutlineStatusBar,
  type ChecklistType,
} from '../data';
import { getErrorDetails } from '../utils/getErrorDetails';
import {
  getCourseBestPracticesChecklist,
  getCourseLaunchChecklist,
} from '../utils/getChecklistForStatusBar';

const DEFAULT_FETCH_SECTION_STATUS = RequestStatus.IN_PROGRESS;

const DEFAULT_COURSE_ACTIONS: XBlockActions = {
  deletable: true,
  unlinkable: false,
  draggable: true,
  childAddable: true,
  duplicable: true,
  allowMoveUp: false,
  allowMoveDown: false,
};

interface UseOutlineStatusStateInput {
  courseId: string;
}

export interface UseOutlineStatusStateOutput {
  effectiveOutlineIndexData: any;
  sections: XBlock[];
  statusBarData: CourseOutlineStatusBar;
  effectiveLoadingStatus: {
    outlineIndexIsLoading: boolean;
    outlineIndexIsDenied: boolean;
    fetchSectionLoadingStatus: string;
    courseLaunchQueryStatus: string;
  };
  rawErrors: Record<string, any>;
  courseActions: XBlockActions;
  isCustomRelativeDatesActive: boolean;
  enableProctoredExams?: boolean;
  enableTimedExams?: boolean;
  createdOn?: string;
}

export function useOutlineStatusState({
  courseId,
}: UseOutlineStatusStateInput): UseOutlineStatusStateOutput {
  const outlineIndexQuery = useCourseOutlineIndex(courseId);

  const effectiveOutlineIndexData = outlineIndexQuery.data;

  // Derive outline-index loading/error booleans from React Query fields
  const outlineIndexIsPending = outlineIndexQuery.isPending;
  const outlineIndexIsDenied = !outlineIndexQuery.isPending
    && !outlineIndexQuery.isSuccess
    && (outlineIndexQuery.error as any)?.response?.status === 403;

  const sections = effectiveOutlineIndexData?.courseStructure?.childInfo?.children || [];

  const bestPracticesQuery = useCourseBestPractices(courseId);
  const launchQuery = useCourseLaunch(courseId);

  // Derive launch status and error from query state
  const courseLaunchQueryStatus = useMemo(() => {
    if (launchQuery.isPending) { return RequestStatus.IN_PROGRESS; }
    if (launchQuery.isError) { return RequestStatus.FAILED; }
    if (launchQuery.isSuccess) { return RequestStatus.SUCCESSFUL; }
    return RequestStatus.IN_PROGRESS;
  }, [launchQuery.isPending, launchQuery.isError, launchQuery.isSuccess]);

  const courseLaunchErrors = useMemo(() => {
    if (launchQuery.error) { return getErrorDetails(launchQuery.error); }
    return null;
  }, [launchQuery.error]);

  // Merge checklist from both query results
  const mergedChecklist = useMemo((): ChecklistType => {
    const checklist: ChecklistType = {
      totalCourseLaunchChecks: 0,
      completedCourseLaunchChecks: 0,
      totalCourseBestPracticesChecks: 0,
      completedCourseBestPracticesChecks: 0,
    };
    if (bestPracticesQuery.data) {
      Object.assign(checklist, getCourseBestPracticesChecklist(bestPracticesQuery.data));
    }
    if (launchQuery.data) {
      Object.assign(checklist, getCourseLaunchChecklist(launchQuery.data));
    }
    return checklist;
  }, [bestPracticesQuery.data, launchQuery.data]);

  const isSelfPaced = launchQuery.data?.isSelfPaced ?? false;

  const courseActions = effectiveOutlineIndexData?.courseStructure?.actions || DEFAULT_COURSE_ACTIONS;
  const isCustomRelativeDatesActive = effectiveOutlineIndexData?.isCustomRelativeDatesActive ?? false;
  const enableProctoredExams = effectiveOutlineIndexData?.courseStructure?.enableProctoredExams;
  const enableTimedExams = effectiveOutlineIndexData?.courseStructure?.enableTimedExams;
  const createdOn = effectiveOutlineIndexData?.createdOn;

  const statusBarData = useMemo(() => {
    const base = effectiveOutlineIndexData
      ? getCourseOutlineStatusBarData(effectiveOutlineIndexData)
      : {};
    return {
      ...base,
      checklist: mergedChecklist,
      isSelfPaced,
    } as CourseOutlineStatusBar;
  }, [effectiveOutlineIndexData, mergedChecklist, isSelfPaced]);

  const effectiveLoadingStatus = useMemo(() => ({
    outlineIndexIsLoading: outlineIndexIsPending,
    outlineIndexIsDenied,
    fetchSectionLoadingStatus: DEFAULT_FETCH_SECTION_STATUS,
    courseLaunchQueryStatus,
  }), [outlineIndexIsPending, outlineIndexIsDenied, courseLaunchQueryStatus]);

  const rawErrors = useMemo((): Record<string, any> => {
    const outlineIndexErrors = !outlineIndexIsDenied && outlineIndexQuery.error != null
      ? getErrorDetails(outlineIndexQuery.error, false)
      : null;
    return {
      outlineIndexApi: outlineIndexErrors,
      courseLaunchApi: courseLaunchErrors,
    };
  }, [outlineIndexQuery.error, outlineIndexIsDenied, courseLaunchErrors]);

  useEffect(() => {
    if (createdOn && moment(new Date(createdOn)).isAfter(moment().subtract(31, 'days'))) {
      createDiscussionsTopics(courseId).catch((err) => logError(err));
    }
  }, [createdOn, courseId]);

  return {
    effectiveOutlineIndexData,
    sections,
    statusBarData,
    effectiveLoadingStatus,
    rawErrors,
    courseActions,
    isCustomRelativeDatesActive,
    enableProctoredExams,
    enableTimedExams,
    createdOn,
  };
}
