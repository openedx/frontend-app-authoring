import { UniqueIdentifier } from '@dnd-kit/core';
import React from 'react';

interface DragContextProviderProps {
  activeId: UniqueIdentifier | null,
  overId: UniqueIdentifier | null,
  children?: React.ReactNode,
}

export const DragContext = React.createContext<DragContextProviderProps>({
  activeId: null,
  overId: null,
  children: null,
});

const DragContextProvider = ({ activeId, overId, children }: DragContextProviderProps) => {
  const contextValue = React.useMemo(() => ({
    activeId,
    overId,
  }), [activeId, overId]);
  return (
    <DragContext.Provider
      value={contextValue}
    >
      {children}
    </DragContext.Provider>
  );
};

export default DragContextProvider;
