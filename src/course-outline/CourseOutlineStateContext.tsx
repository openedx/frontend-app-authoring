import {
  createContext,
  useContext,
  useMemo,
} from 'react';
import { useSelector } from 'react-redux';

import { RequestStatus } from '@src/data/constants';
import type { OutlinePageErrors, XBlock, XBlockActions } from '@src/data/types';
import {
  getCourseActions,
  getCreatedOn,
  getCustomRelativeDatesActiveFlag,
  getErrors,
  getLoadingStatus,
  getOutlineIndexData,
  getSavingStatus,
  getSectionsList,
  getStatusBarData,
  getProctoredExamsFlag,
  getTimedExamsFlag,
} from './data/selectors';
import { CourseOutlineState as LegacyCourseOutlineState, CourseOutlineStatusBar } from './data/types';

type CourseOutlineStateContextData = {
  outlineIndexData: LegacyCourseOutlineState['outlineIndexData'];
  courseName?: string;
  courseUsageKey?: string;
  sections: XBlock[];
  courseActions: XBlockActions;
  statusBarData: CourseOutlineStatusBar;
  savingStatus: string;
  errors: OutlinePageErrors;
  loadingStatus: LegacyCourseOutlineState['loadingStatus'];
  isLoading: boolean;
  isLoadingDenied: boolean;
  isCustomRelativeDatesActive: boolean;
  enableProctoredExams?: boolean;
  enableTimedExams?: boolean;
  createdOn: LegacyCourseOutlineState['createdOn'];
};

const CourseOutlineStateContext = createContext<CourseOutlineStateContextData | undefined>(undefined);

export const CourseOutlineStateProvider = ({ children }: { children?: React.ReactNode }) => {
  const outlineIndexData = useSelector(getOutlineIndexData);
  const sections = useSelector(getSectionsList);
  const courseActions = useSelector(getCourseActions);
  const statusBarData = useSelector(getStatusBarData);
  const savingStatus = useSelector(getSavingStatus);
  const errors = useSelector(getErrors);
  const loadingStatus = useSelector(getLoadingStatus);
  const isCustomRelativeDatesActive = useSelector(getCustomRelativeDatesActiveFlag);
  const enableProctoredExams = useSelector(getProctoredExamsFlag);
  const enableTimedExams = useSelector(getTimedExamsFlag);
  const createdOn = useSelector(getCreatedOn);

  const context = useMemo<CourseOutlineStateContextData>(() => ({
    outlineIndexData,
    courseName: outlineIndexData?.courseStructure?.displayName,
    courseUsageKey: outlineIndexData?.courseStructure?.id,
    sections,
    courseActions,
    statusBarData,
    savingStatus,
    errors,
    loadingStatus,
    isLoading: loadingStatus.outlineIndexLoadingStatus === RequestStatus.IN_PROGRESS,
    isLoadingDenied: loadingStatus.outlineIndexLoadingStatus === RequestStatus.DENIED,
    isCustomRelativeDatesActive,
    enableProctoredExams,
    enableTimedExams,
    createdOn,
  }), [
    outlineIndexData,
    sections,
    courseActions,
    statusBarData,
    savingStatus,
    errors,
    loadingStatus,
    isCustomRelativeDatesActive,
    enableProctoredExams,
    enableTimedExams,
    createdOn,
  ]);

  return (
    <CourseOutlineStateContext.Provider value={context}>
      {children}
    </CourseOutlineStateContext.Provider>
  );
};

export function useCourseOutlineState(): CourseOutlineStateContextData {
  const ctx = useContext(CourseOutlineStateContext);
  if (ctx === undefined) {
    throw new Error('useCourseOutlineState() was used in a component without a <CourseOutlineStateProvider> ancestor.');
  }
  return ctx;
}
