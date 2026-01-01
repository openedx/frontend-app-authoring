import { getConfig } from '@edx/frontend-platform';
import { createContext, useContext, useMemo } from 'react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { useCreateCourseBlock } from '@src/course-outline/data/apiHooks';
import { getCourseItem } from '@src/course-outline/data/api';
import { useDispatch, useSelector } from 'react-redux';
import { addSection, addSubsection, updateSavingStatus } from '@src/course-outline/data/slice';
import { addNewSectionQuery, addNewSubsectionQuery, addNewUnitQuery } from '@src/course-outline/data/thunk';
import { useNavigate } from 'react-router';
import { getOutlineIndexData } from '@src/course-outline/data/selectors';
import { RequestStatus, RequestStatusType } from './data/constants';
import { useCourseDetails, useWaffleFlags } from './data/apiHooks';
import { CourseDetailsData } from './data/api';

export type CourseAuthoringContextData = {
  /** The ID of the current course */
  courseId: string;
  courseUsageKey: string;
  courseDetails?: CourseDetailsData;
  courseDetailStatus: RequestStatusType;
  canChangeProviders: boolean;
  handleAddSectionFromLibrary: ReturnType<typeof useCreateCourseBlock>;
  handleAddSubsectionFromLibrary: ReturnType<typeof useCreateCourseBlock>;
  handleAddUnitFromLibrary: ReturnType<typeof useCreateCourseBlock>;
  handleNewSectionSubmit: () => void;
  handleNewSubsectionSubmit: (sectionId: string) => void;
  handleNewUnitSubmit: (subsectionId: string) => void;
  openUnitPage: (locator: string) => void;
  getUnitUrl: (locator: string) => string;
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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const waffleFlags = useWaffleFlags();
  const { data: courseDetails, status: courseDetailStatus } = useCourseDetails(courseId);
  const canChangeProviders = getAuthenticatedUser().administrator || new Date(courseDetails?.start ?? 0) > new Date();
  const { courseStructure } = useSelector(getOutlineIndexData);
  const { id: courseUsageKey } = courseStructure || {};

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
  const openUnitPage = (locator: string) => {
    const url = getUnitUrl(locator);
    if (getConfig().ENABLE_UNIT_PAGE === 'true' && waffleFlags.useNewUnitPage) {
      // instanbul ignore next
      navigate(url);
    } else {
      window.location.assign(url);
    }
  };

  const handleNewSectionSubmit = () => {
    dispatch(addNewSectionQuery(courseUsageKey));
  };

  const handleNewSubsectionSubmit = (sectionId: string) => {
    dispatch(addNewSubsectionQuery(sectionId));
  };

  const handleNewUnitSubmit = (subsectionId: string) => {
    dispatch(addNewUnitQuery(subsectionId, openUnitPage));
  };

  const handleAddSectionFromLibrary = useCreateCourseBlock(async (locator) => {
    try {
      const data = await getCourseItem(locator);
      // instanbul ignore next
      // Page should scroll to newly added section.
      data.shouldScroll = true;
      dispatch(addSection(data));
    } catch {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  });

  const handleAddSubsectionFromLibrary = useCreateCourseBlock(async (locator, parentLocator) => {
    try {
      const data = await getCourseItem(locator);
      data.shouldScroll = true;
      // Page should scroll to newly added subsection.
      dispatch(addSubsection({ parentLocator, data }));
    } catch {
      dispatch(updateSavingStatus({ status: RequestStatus.FAILED }));
    }
  });

  /**
  * import a unit block from library and redirect user to this unit page.
  */
  const handleAddUnitFromLibrary = useCreateCourseBlock(openUnitPage);

  const context = useMemo<CourseAuthoringContextData>(() => ({
    courseId,
    courseUsageKey,
    courseDetails,
    courseDetailStatus,
    canChangeProviders,
    handleNewSectionSubmit,
    handleNewSubsectionSubmit,
    handleNewUnitSubmit,
    handleAddSectionFromLibrary,
    handleAddSubsectionFromLibrary,
    handleAddUnitFromLibrary,
    getUnitUrl,
    openUnitPage,
  }), [
    courseId,
    courseUsageKey,
    courseDetails,
    courseDetailStatus,
    canChangeProviders,
    handleNewSectionSubmit,
    handleNewSubsectionSubmit,
    handleNewUnitSubmit,
    handleAddSectionFromLibrary,
    handleAddSubsectionFromLibrary,
    handleAddUnitFromLibrary,
    getUnitUrl,
    openUnitPage,
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
