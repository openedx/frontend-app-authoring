import { useEffect, useMemo, useState } from 'react';
import moment from 'moment';

import { logError } from '@edx/frontend-platform/logging';
import { RequestStatus } from '@src/data/constants';
import type { XBlock, XBlockActions } from '@src/data/types';
import {
  getCourseOutlineStatusBarData,
  useCourseOutlineIndex,
} from '../data/outlineIndexQuery';
import {
  createDiscussionsTopics,
  getCourseLaunch,
  getCourseBestPractices,
} from '../data/api';
import { getErrorDetails } from '../utils/getErrorDetails';
import {
  getCourseBestPracticesChecklist,
  getCourseLaunchChecklist,
} from '../utils/getChecklistForStatusBar';
import type { CourseOutlineStatusBar, ChecklistType } from '../data/types';
import {
  computeErrorSignature,
  filterDismissedErrors,
} from './outlineErrorDismissal';

const DEFAULT_LAUNCH_STATUS = RequestStatus.IN_PROGRESS;
const DEFAULT_FETCH_SECTION_STATUS = RequestStatus.IN_PROGRESS;
const DEFAULT_ERROR_NULL = null;

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
  reindexLoadingStatus: string;
  localStatusBarOverride: Partial<CourseOutlineStatusBar>;
  dismissedErrorSignatures: Record<string, string>;
  localReindexError: any;
}

export interface UseOutlineStatusStateOutput {
  effectiveOutlineIndexData: any;
  sections: XBlock[];
  statusBarData: CourseOutlineStatusBar;
  effectiveLoadingStatus: {
    outlineIndexIsLoading: boolean;
    outlineIndexIsDenied: boolean;
    reIndexLoadingStatus: string;
    fetchSectionLoadingStatus: string;
    courseLaunchQueryStatus: string;
  };
  rawErrors: Record<string, any>;
  effectiveErrors: Record<string, any>;
  courseActions: XBlockActions;
  isCustomRelativeDatesActive: boolean;
  enableProctoredExams?: boolean;
  enableTimedExams?: boolean;
  createdOn?: string;
}

export function useOutlineStatusState({
  courseId,
  reindexLoadingStatus,
  localStatusBarOverride,
  dismissedErrorSignatures,
  localReindexError,
}: UseOutlineStatusStateInput): UseOutlineStatusStateOutput {
  // Mount outline index query from React Query (primary source)
  const outlineIndexQuery = useCourseOutlineIndex(courseId);

  // Effective outline data from React Query cache
  const effectiveOutlineIndexData = outlineIndexQuery.data;

  // Derive outline-index loading/error booleans from React Query fields
  const outlineIndexIsPending = outlineIndexQuery.isPending;
  const outlineIndexIsDenied = !outlineIndexQuery.isPending
    && !outlineIndexQuery.isSuccess
    && (outlineIndexQuery.error as any)?.response?.status === 403;

  // Committed sections from query cache children
  const sections = effectiveOutlineIndexData?.courseStructure?.childInfo?.children || [];

  // --- Local state for checklist, launch, and self-paced ---
  const [localChecklist, setLocalChecklist] = useState<ChecklistType>({
    totalCourseLaunchChecks: 0,
    completedCourseLaunchChecks: 0,
    totalCourseBestPracticesChecks: 0,
    completedCourseBestPracticesChecks: 0,
  });
  const [localIsSelfPaced, setLocalIsSelfPaced] = useState<boolean>(false);
  const [localCourseLaunchQueryStatus, setLocalCourseLaunchQueryStatus] = useState<string>(DEFAULT_LAUNCH_STATUS);
  const [localCourseLaunchErrors, setLocalCourseLaunchErrors] = useState<any>(null);

  // --- Derived flags from outline data ---
  const courseActions = effectiveOutlineIndexData?.courseStructure?.actions || DEFAULT_COURSE_ACTIONS;
  const isCustomRelativeDatesActive = effectiveOutlineIndexData?.isCustomRelativeDatesActive ?? false;
  const enableProctoredExams = effectiveOutlineIndexData?.courseStructure?.enableProctoredExams;
  const enableTimedExams = effectiveOutlineIndexData?.courseStructure?.enableTimedExams;
  const createdOn = effectiveOutlineIndexData?.createdOn;

  // --- Derived status bar data (merge query data + local checklist/selfPaced + overrides) ---
  const statusBarData = useMemo(() => {
    const base = effectiveOutlineIndexData
      ? getCourseOutlineStatusBarData(effectiveOutlineIndexData)
      : {};
    return {
      ...base,
      checklist: localChecklist,
      isSelfPaced: localIsSelfPaced,
      ...localStatusBarOverride,
    } as CourseOutlineStatusBar;
  }, [effectiveOutlineIndexData, localChecklist, localIsSelfPaced, localStatusBarOverride]);

  // --- Derived loading status (query-derived + local) ---
  const effectiveLoadingStatus = useMemo(() => ({
    outlineIndexIsLoading: outlineIndexIsPending,
    outlineIndexIsDenied,
    reIndexLoadingStatus: reindexLoadingStatus,
    fetchSectionLoadingStatus: DEFAULT_FETCH_SECTION_STATUS,
    courseLaunchQueryStatus: localCourseLaunchQueryStatus,
  }), [outlineIndexIsPending, outlineIndexIsDenied, reindexLoadingStatus, localCourseLaunchQueryStatus]);

  // --- Raw / base errors (before dismissal) ---
  const rawErrors = useMemo((): Record<string, any> => {
    const outlineIndexErrors = !outlineIndexIsDenied && outlineIndexQuery.error != null
      ? getErrorDetails(outlineIndexQuery.error, false)
      : null;
    return {
      outlineIndexApi: outlineIndexErrors,
      reindexApi: localReindexError,
      sectionLoadingApi: DEFAULT_ERROR_NULL,
      courseLaunchApi: localCourseLaunchErrors,
    };
  }, [outlineIndexQuery.error, outlineIndexIsDenied, localReindexError, localCourseLaunchErrors]);

  // --- Derived errors (raw minus signature-matched dismissals) ---
  const effectiveErrors = useMemo((): Record<string, any> => {
    return filterDismissedErrors(rawErrors, dismissedErrorSignatures, computeErrorSignature);
  }, [rawErrors, dismissedErrorSignatures]);

  // --- Checklist/launch effects ---
  useEffect(() => {
    getCourseBestPractices({ courseId, excludeGraded: true, all: true }).then((data) => {
      if (data) {
        setLocalChecklist(prev => ({ ...prev, ...getCourseBestPracticesChecklist(data) }));
      }
    }).catch(() => {});

    getCourseLaunch({ courseId, gradedOnly: true, validateOras: true, all: true })
      .then((data) => {
        setLocalIsSelfPaced(data.isSelfPaced);
        setLocalChecklist(prev => ({ ...prev, ...getCourseLaunchChecklist(data) }));
        setLocalCourseLaunchQueryStatus(RequestStatus.SUCCESSFUL);
        setLocalCourseLaunchErrors(null);
      }).catch((error) => {
        setLocalCourseLaunchQueryStatus(RequestStatus.FAILED);
        setLocalCourseLaunchErrors(getErrorDetails(error));
      });
  }, [courseId]);

  // Create discussions topics if course was created recently
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
    effectiveErrors,
    courseActions,
    isCustomRelativeDatesActive,
    enableProctoredExams,
    enableTimedExams,
    createdOn,
  };
}
