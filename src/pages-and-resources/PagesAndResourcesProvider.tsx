import React, { useMemo } from 'react';

interface PagesAndResourcesContextData {
  courseId?: string;
  path?: string;
  isEditable?: boolean;
}
export const PagesAndResourcesContext = React.createContext<PagesAndResourcesContextData>({
  isEditable: false,
});

interface PagesAndResourcesProviderProps {
  courseId: string;
  isEditable?: boolean;
  children: React.ReactNode;
}

// isEditable defaults to true so that existing renders without the authz RBAC flag
// continue to work as fully editable. The context default is false (fail-closed) for
// components that consume it outside of any provider.
const PagesAndResourcesProvider = ({ courseId, isEditable = true, children }: PagesAndResourcesProviderProps) => {
  const contextValue = useMemo(() => ({
    courseId,
    path: `/course/${courseId}/pages-and-resources`,
    isEditable,
  }), [courseId, isEditable]);
  return (
    <PagesAndResourcesContext.Provider
      value={contextValue}
    >
      {children}
    </PagesAndResourcesContext.Provider>
  );
};

export default PagesAndResourcesProvider;
