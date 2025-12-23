import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMigrationInfo } from "@src/library-authoring/data/apiHooks";
import { getLoadingStatuses, getStudioHomeCoursesParams, getStudioHomeData } from "@src/studio-home/data/selectors";
import { useLibraryContext } from "../../../../../library-authoring/common/context/LibraryContext";
import { fetchStudioHomeData } from '@src/studio-home/data/thunks';
import { updateStudioHomeCoursesCustomParams } from "../../../../data/slice";
import { RequestStatus } from "../../../../../data/constants";

export interface CourseImportFilterContextType {
  processedMigrationInfo: Record<string, string[]>;
  hidePreviouslyImportedCourses: boolean;
  setHidePreviouslyImportedCourses: React.Dispatch<React.SetStateAction<boolean>>;
  filteredCourses: object[];
}

export const CourseImportFilterContext = createContext<CourseImportFilterContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const CourseImportFilterProvider = ({ children }: Props) => {
  const { libraryId } = useLibraryContext(true) || {};
  const dispatch = useDispatch();
  const [hidePreviouslyImportedCourses, setHidePreviouslyImportedCourses] = useState(true);
  const { courses, numPages } = useSelector(getStudioHomeData);
  const {
    currentPage,
    search,
    order,
    archivedOnly,
    activeOnly,
  } = useSelector(getStudioHomeCoursesParams);
  const { courseLoadingStatus } = useSelector(getLoadingStatuses);
  const allVisibleCourseIds = courses?.map(item => item.courseKey) || [];
  const locationValue = location.search ?? '';
  const {
    data: migrationInfoData,
  } = useMigrationInfo(allVisibleCourseIds, allVisibleCourseIds.length > 0);

  const processedMigrationInfo: Record<string, string[]> = useMemo(() => {
    const result = {};
    if (migrationInfoData) {
      for (const libraries of Object.values(migrationInfoData)) {
        // The map key in `migrationInfoData` is in camelCase.
        // In the processed map, we use the key in its original form.
        result[libraries[0]?.sourceKey] = libraries.map(item => item.targetKey);
      }
    }
    return result;
  }, [migrationInfoData]);

  const filteredCourses = useMemo(() => {
    return hidePreviouslyImportedCourses && libraryId
      ? courses?.filter(course => !processedMigrationInfo[course.courseKey]?.includes(libraryId))
      : courses;
  }, [hidePreviouslyImportedCourses, libraryId, processedMigrationInfo, courses, currentPage]);

  useEffect(() => {
    if ((numPages > currentPage)
      && filteredCourses.length === 0
      && courseLoadingStatus !== RequestStatus.IN_PROGRESS) {
      const customParams = {
        search,
        order,
        archivedOnly,
        activeOnly,
      }
      dispatch(fetchStudioHomeData(locationValue, false, { page: currentPage + 1, ...customParams }));
      dispatch(updateStudioHomeCoursesCustomParams({ currentPage: currentPage + 1, isFiltered: true }));
    }
  }, [
    numPages,
    filteredCourses,
    locationValue,
    courses,
    search,
    order,
    archivedOnly,
    activeOnly,
    dispatch,
    courseLoadingStatus,
  ])

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

export const useCourseImportFilter = () => {
  return useContext(CourseImportFilterContext);
};
