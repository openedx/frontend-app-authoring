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
