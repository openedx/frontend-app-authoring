import {
  createContext, ReactNode, useContext, useEffect, useMemo, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMigrationInfo } from '@src/library-authoring/data/apiHooks';
import { getLoadingStatuses, getStudioHomeCoursesParams, getStudioHomeData } from '@src/studio-home/data/selectors';
import { useLibraryContext } from '@src/library-authoring/common/context/LibraryContext';
import { fetchStudioHomeData } from '@src/studio-home/data/thunks';
import { updateStudioHomeCoursesCustomParams } from '@src/studio-home/data/slice';
import { RequestStatus } from '@src/data/constants';

export interface CourseImportFilterContextType {
  processedMigrationInfo: Record<string, string[]>;
  hidePreviouslyImportedCourses: boolean;
  setHidePreviouslyImportedCourses: React.Dispatch<React.SetStateAction<boolean>>;
  filteredCourses: object[];
}

export const CourseImportFilterContext = createContext<CourseImportFilterContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
  handleSelect?: (courseId: string) => void;
  selectedCourseId?: string;
}

const PAGE_SIZE = 500;

export const CourseImportFilterProvider = ({ handleSelect, selectedCourseId, children }: Props) => {
  const { libraryId } = useLibraryContext(true) || {};
  const dispatch = useDispatch();
  const [hidePreviouslyImportedCourses, setHidePreviouslyImportedCourses] = useState(true);
  const { courses, numPages } = useSelector(getStudioHomeData);
  const studioHomeCoursesParams = useSelector(getStudioHomeCoursesParams);
  const { currentPage } = studioHomeCoursesParams;
  const { courseLoadingStatus } = useSelector(getLoadingStatuses);
  const isCourseListLoading = courseLoadingStatus === RequestStatus.IN_PROGRESS;
  const allVisibleCourseIds = courses?.map(item => item.courseKey) || [];
  const {
    data: migrationInfoData,
    isPending,
  } = useMigrationInfo(allVisibleCourseIds, allVisibleCourseIds.length > 0);

  const processedMigrationInfo: Record<string, string[]> = useMemo(() => {
    const result = {};
    if (migrationInfoData) {
      for (const libraries of Object.values(migrationInfoData)) {
        // The map key in `migrationInfoData` is in camelCase.
        // In the processed map, we use the key in its original form.
        if (libraries.length !== 0) {
          result[libraries[0]?.sourceKey] = libraries.map(item => item.targetKey);
        }
      }
    }
    return result;
  }, [migrationInfoData]);

  const filteredCourses: any[] = useMemo(() => (hidePreviouslyImportedCourses && libraryId
    ? courses?.filter(course => !processedMigrationInfo[course.courseKey]?.includes(libraryId))
    : courses), [hidePreviouslyImportedCourses, libraryId, processedMigrationInfo, courses]);

  useEffect(() => {
    // Filter the courses based on selected course id and handle the selection change
    if (!isCourseListLoading && !isPending
      && filteredCourses.findIndex(course => course.courseKey === selectedCourseId) === -1) {
      handleSelect?.('');
    }
  }, [filteredCourses, selectedCourseId, handleSelect]);

  useEffect(() => {
    // Fetch all studio home data for initial load to avoid pagingation
    // This is required to avoid cases where we have very less number of non-imported courses per page
    dispatch(updateStudioHomeCoursesCustomParams({ ...studioHomeCoursesParams, pageSize: PAGE_SIZE }));
    dispatch(fetchStudioHomeData(undefined, false, { ...studioHomeCoursesParams, page: 1, pageSize: PAGE_SIZE }));
  }, []);

  // istanbul ignore next
  useEffect(() => {
    // HACK: If there are no courses that were not imported in the current page, then we need to fetch
    // the next page of courses.
    // FIXME: This workaround causes page flicker when the next page has also has no courses that were not imported.
    if ((numPages > currentPage) && filteredCourses.length === 0 && !isCourseListLoading) {
      dispatch(fetchStudioHomeData(undefined, false, { ...studioHomeCoursesParams, page: currentPage + 1 }));
      dispatch(updateStudioHomeCoursesCustomParams({ ...studioHomeCoursesParams, currentPage: currentPage + 1 }));
    }
  }, [
    numPages,
    filteredCourses,
    courses,
    dispatch,
    courseLoadingStatus,
    studioHomeCoursesParams,
  ]);

  const value = useMemo(() => ({
    processedMigrationInfo,
    hidePreviouslyImportedCourses,
    setHidePreviouslyImportedCourses,
    filteredCourses,
  }), [processedMigrationInfo, hidePreviouslyImportedCourses, setHidePreviouslyImportedCourses]);

  return (
    <CourseImportFilterContext.Provider value={value}>
      {children}
    </CourseImportFilterContext.Provider>
  );
};

export const useCourseImportFilter = () => useContext(CourseImportFilterContext);
