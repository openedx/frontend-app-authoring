import React, { useMemo } from 'react';

interface PagesAndResourcesContextData {
  courseId?: string;
  path?: string;
}
export const PagesAndResourcesContext = React.createContext<PagesAndResourcesContextData>({});

interface PagesAndResourcesProviderProps {
  courseId: string;
  children: React.ReactNode,
}

const PagesAndResourcesProvider = ({ courseId, children }: PagesAndResourcesProviderProps) => {
  const contextValue = useMemo(() => ({
    courseId,
    path: `/course/${courseId}/pages-and-resources`,
  }), []);
  return (
    <PagesAndResourcesContext.Provider
      value={contextValue}
    >
      {children}
    </PagesAndResourcesContext.Provider>
  );
};

export default PagesAndResourcesProvider;
