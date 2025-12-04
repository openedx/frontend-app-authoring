import {
  createContext, useCallback, useContext, useMemo, useState,
} from 'react';

export type SidebarContextData = {
  selectedContainerId?: string;
  openContainerInfoSidebar: (containerId: string) => void;
};

/**
 * Course Outline Sidebar Context.
 *
 * Get this using `useSidebarContext()`
 *
 */
const SidebarContext = createContext<SidebarContextData | undefined>(undefined);

type SidebarProviderProps = {
  children?: React.ReactNode;
};

export const SidebarProvider = ({ children }: SidebarProviderProps) => {
  const [selectedContainerId, setSelectedContainerId] = useState<string | undefined>();

  const openContainerInfoSidebar = useCallback((containerId: string) => {
    setSelectedContainerId(containerId);
  }, [setSelectedContainerId]);

  const context = useMemo<SidebarContextData>(() => {
    const contextValue = {
      selectedContainerId,
      openContainerInfoSidebar,
    };

    return contextValue;
  }, [
    selectedContainerId,
    openContainerInfoSidebar,
  ]);

  return (
    <SidebarContext.Provider value={context}>
      {children}
    </SidebarContext.Provider>
  );
};

export function useSidebarContext(): SidebarContextData {
  const ctx = useContext(SidebarContext);
  if (ctx === undefined) {
    /* istanbul ignore next */
    return {
      selectedContainerId: undefined,
      openContainerInfoSidebar: () => {},
    };
  }
  return ctx;
}
