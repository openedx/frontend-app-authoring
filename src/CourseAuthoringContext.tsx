import { useNavigate } from 'react-router';
import {
  createContext,
  useContext,
  useMemo,
} from 'react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { useToggleWithValue } from '@src/hooks';
import { type UnitXBlock, type XBlock } from '@src/data/types';
import { CourseAppData, CourseDetailsData } from './data/api';
import { useCourseApps, useCourseDetails } from './data/apiHooks';
import { RequestStatus, RequestStatusType } from './data/constants';

export type ModalState = {
  value?: XBlock | UnitXBlock;
  subsectionId?: string;
  sectionId?: string;
};

const COURSE_APPS_ORDER = [
  'progress',
  'discussion',
  'teams',
  'edxnotes',
  'wiki',
  'calculator',
  'proctoring',
  'live',
  'textbooks',
  'custom_pages',
  'ora_settings',
];

export type CourseAuthoringContextData = {
  /** The ID of the current course */
  courseId: string;
  courseDetails?: CourseDetailsData;
  courseDetailStatus: RequestStatusType;
  canChangeProviders: boolean;
  openUnitPage: (locator: string) => Promise<void>;
  getUnitUrl: (locator: string) => string;
  isUnlinkModalOpen: boolean;
  currentUnlinkModalData?: ModalState;
  openUnlinkModal: (value: ModalState) => void;
  closeUnlinkModal: () => void;
  courseApps: CourseAppData[];
  courseAppsStatus: RequestStatusType;
};

/**
 * Course Authoring Context.
 * Always available when we're in the context of a single course.
 *
 * Get this using `useCourseAuthoringContext()`
 */
const CourseAuthoringContext = createContext<CourseAuthoringContextData | undefined>(undefined);

type CourseAuthoringProviderProps = {
  children?: React.ReactNode;
  courseId: string;
};

export const CourseAuthoringProvider = ({
  children,
  courseId,
}: CourseAuthoringProviderProps) => {
  const navigate = useNavigate();
  const { data: courseDetails, status: courseDetailStatus } = useCourseDetails(courseId);
  const canChangeProviders = getAuthenticatedUser().administrator || new Date(courseDetails?.start ?? 0) > new Date();
  const [
    isUnlinkModalOpen,
    currentUnlinkModalData,
    openUnlinkModal,
    closeUnlinkModal,
  ] = useToggleWithValue<ModalState>();

  const getUnitUrl = (locator: string) => `/course/${courseId}/container/${locator}`;

  const {
    data: courseApps,
    isPending: courseAppsIsPending,
    failureReason: courseAppsError,
  } = useCourseApps(courseId);

  let courseAppsStatus: RequestStatusType = RequestStatus.SUCCESSFUL;

  if (courseAppsIsPending) {
    courseAppsStatus = RequestStatus.PENDING;
  } else if (courseAppsError) {
    if (courseAppsError?.response?.status === 403) {
      courseAppsStatus = RequestStatus.DENIED;
    } else {
      courseAppsStatus = RequestStatus.FAILED;
    }
  }

  // courseApps is the array reference held by the React Query cache; sort a copy
  // so we don't mutate it during render (StrictMode double-renders can otherwise
  // produce inconsistent results between the two passes).
  const sortedCourseApps = courseApps ?
    [...courseApps].sort((firstEl, secondEl) => (
      COURSE_APPS_ORDER.indexOf(firstEl.id) - COURSE_APPS_ORDER.indexOf(secondEl.id)
    )) :
    courseApps;

  /**
   * Open the unit page for a given locator.
   */
  const openUnitPage = async (locator: string) => {
    navigate(getUnitUrl(locator));
  };

  const context = useMemo<CourseAuthoringContextData>(() => ({
    courseId,
    courseDetails,
    courseDetailStatus,
    canChangeProviders,
    getUnitUrl,
    openUnitPage,
    isUnlinkModalOpen,
    openUnlinkModal,
    closeUnlinkModal,
    currentUnlinkModalData,
    courseApps: sortedCourseApps || [],
    courseAppsStatus,
  }), [
    courseId,
    courseDetails,
    courseDetailStatus,
    canChangeProviders,
    getUnitUrl,
    openUnitPage,
    isUnlinkModalOpen,
    openUnlinkModal,
    closeUnlinkModal,
    currentUnlinkModalData,
    sortedCourseApps,
    courseAppsStatus,
  ]);

  return (
    <CourseAuthoringContext.Provider value={context}>
      {children}
    </CourseAuthoringContext.Provider>
  );
};

export function useCourseAuthoringContext(): CourseAuthoringContextData {
  const ctx = useContext(CourseAuthoringContext);
  if (ctx === undefined) {
    /* istanbul ignore next */
    throw new Error(
      'useCourseAuthoringContext() was used in a component without a <CourseAuthoringProvider> ancestor.',
    );
  }
  return ctx;
}
