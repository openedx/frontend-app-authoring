import { createContext, useContext, useMemo } from 'react';
import { CourseDetailsData } from './data/api';
import { useCourseDetails } from './data/apiHooks';
import { RequestStatusType } from './data/constants';

export type CourseAuthoringContextData = {
  /** The ID of the current course */
  courseId: string;
  courseDetails?: CourseDetailsData;
  courseDetailStatus: RequestStatusType;
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
  const { data: courseDetails, status: courseDetailStatus } = useCourseDetails(courseId);

  const context = useMemo<CourseAuthoringContextData>(() => {
    const contextValue = {
      courseId,
      courseDetails,
      courseDetailStatus,
    };

    return contextValue;
  }, [
    courseId,
    courseDetails,
    courseDetailStatus,
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
