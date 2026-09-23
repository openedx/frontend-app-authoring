import React, { useMemo } from 'react';

import { CourseAppData } from '@src/data/api';
import { RequestStatusType } from '@src/data/constants';
import { useSortedCourseApps } from '@src/data/apiHooks';

interface PagesAndResourcesContextData {
  courseId?: string;
  path?: string;
  isEditable?: boolean;
  courseApps: CourseAppData[];
  courseAppsStatus?: RequestStatusType;
}
export const PagesAndResourcesContext = React.createContext<PagesAndResourcesContextData>({
  isEditable: false,
  courseApps: [],
});

interface PagesAndResourcesProviderProps {
  courseId: string;
  isEditable?: boolean;
  children: React.ReactNode;
}

// isEditable defaults to true so that existing renders without the authz RBAC flag
// continue to work as fully editable. The context default is false (fail-closed) for
// components that consume it outside of any provider.
//
// The list of course apps is loaded here, rather than in the more general
// CourseAuthoringContext, because it's only needed on the Pages & Resources page and
// its settings modals/plugins -- we don't want to load it on every course authoring page.
const PagesAndResourcesProvider = ({
  courseId,
  isEditable = true,
  children,
}: PagesAndResourcesProviderProps) => {
  const { courseApps, courseAppsStatus } = useSortedCourseApps(courseId);
  const contextValue = useMemo(() => ({
    courseId,
    path: `/course/${courseId}/pages-and-resources`,
    isEditable,
    courseApps,
    courseAppsStatus,
  }), [courseId, isEditable, courseApps, courseAppsStatus]);
  return (
    <PagesAndResourcesContext.Provider
      value={contextValue}
    >
      {children}
    </PagesAndResourcesContext.Provider>
  );
};

export default PagesAndResourcesProvider;
