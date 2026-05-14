import React, { useMemo } from 'react';

interface PagesAndResourcesContextData {
  courseId?: string;
  path?: string;
  isEditable?: boolean;
  canManageAdvancedSettings?: boolean;
}
export const PagesAndResourcesContext = React.createContext<PagesAndResourcesContextData>({
  isEditable: false,
  canManageAdvancedSettings: true,
});

interface PagesAndResourcesProviderProps {
  courseId: string;
  isEditable?: boolean;
  canManageAdvancedSettings?: boolean;
  children: React.ReactNode;
}

// isEditable defaults to true so that existing renders without the authz RBAC flag
// continue to work as fully editable. The context default is false (fail-closed) for
// components that consume it outside of any provider.
const PagesAndResourcesProvider = ({
  courseId,
  isEditable = true,
  canManageAdvancedSettings = true,
  children,
}: PagesAndResourcesProviderProps) => {
  const contextValue = useMemo(() => ({
    courseId,
    path: `/course/${courseId}/pages-and-resources`,
    isEditable,
    canManageAdvancedSettings,
  }), [courseId, isEditable, canManageAdvancedSettings]);
  return (
    <PagesAndResourcesContext.Provider
      value={contextValue}
    >
      {children}
    </PagesAndResourcesContext.Provider>
  );
};

export default PagesAndResourcesProvider;
