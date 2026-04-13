import { getConfig } from '@edx/frontend-platform';
import {
  createContext, useContext, useMemo,
} from 'react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useToggleWithValue } from '@src/hooks';
import { type UnitXBlock, type XBlock } from '@src/data/types';
import { CourseDetailsData } from './data/api';
import { useCourseDetails, useWaffleFlags } from './data/apiHooks';
import { RequestStatusType } from './data/constants';
import { getOutlineIndexData } from './course-outline/data/selectors';

export type ModalState = {
  value?: XBlock | UnitXBlock;
  subsectionId?: string;
  sectionId?: string;
};

export type CourseAuthoringContextData = {
  /** The ID of the current course */
  courseId: string;
  courseUsageKey: string;
  courseDetails?: CourseDetailsData;
  courseDetailStatus: RequestStatusType;
  canChangeProviders: boolean;
  openUnitPage: (locator: string) => Promise<void>;
  getUnitUrl: (locator: string) => string;
  isUnlinkModalOpen: boolean;
  currentUnlinkModalData?: ModalState;
  openUnlinkModal: (value: ModalState) => void;
  closeUnlinkModal: () => void;
};

/**
 * Course Authoring Context.
 * Always available when we're in the context of a single course.
 *
 * Get this using `useCourseAuthoringContext()`
 *
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
  const waffleFlags = useWaffleFlags();
  const { data: courseDetails, status: courseDetailStatus } = useCourseDetails(courseId);
  const canChangeProviders = getAuthenticatedUser().administrator || new Date(courseDetails?.start ?? 0) > new Date();
  const { courseStructure } = useSelector(getOutlineIndexData);
  const { id: courseUsageKey } = courseStructure || {};
  const [
    isUnlinkModalOpen,
    currentUnlinkModalData,
    openUnlinkModal,
    closeUnlinkModal,
  ] = useToggleWithValue<ModalState>();

  const getUnitUrl = (locator: string) => {
    if (getConfig().ENABLE_UNIT_PAGE === 'true' && waffleFlags.useNewUnitPage) {
      // instanbul ignore next
      return `/course/${courseId}/container/${locator}`;
    }
    return `${getConfig().STUDIO_BASE_URL}/container/${locator}`;
  };

  /**
   * Open the unit page for a given locator.
   */
  const openUnitPage = async (locator: string) => {
    const url = getUnitUrl(locator);
    if (getConfig().ENABLE_UNIT_PAGE === 'true' && waffleFlags.useNewUnitPage) {
      // instanbul ignore next
      navigate(url);
    } else {
      window.location.assign(url);
    }
  };

  const context = useMemo<CourseAuthoringContextData>(() => ({
    courseId,
    courseUsageKey,
    courseDetails,
    courseDetailStatus,
    canChangeProviders,
    getUnitUrl,
    openUnitPage,
    isUnlinkModalOpen,
    openUnlinkModal,
    closeUnlinkModal,
    currentUnlinkModalData,
  }), [
    courseId,
    courseUsageKey,
    courseDetails,
    courseDetailStatus,
    canChangeProviders,
    getUnitUrl,
    openUnitPage,
    isUnlinkModalOpen,
    openUnlinkModal,
    closeUnlinkModal,
    currentUnlinkModalData,
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
    throw new Error('useCourseAuthoringContext() was used in a component without a <CourseAuthoringProvider> ancestor.');
  }
  return ctx;
}
