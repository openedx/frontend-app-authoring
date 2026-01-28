import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useToggle } from '@openedx/paragon';

import { useEscapeClick, useStateWithUrlSearchParam } from '@src/hooks';
import { SelectionState } from '@src/data/types';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { isOutlineNewDesignEnabled } from '../utils';

export type OutlineSidebarPageKeys = 'help' | 'info' | 'add' | 'align';
export type OutlineFlowType = 'use-section' | 'use-subsection' | 'use-unit' | null;
export type OutlineFlow = {
  flowType: 'use-section';
  parentLocator?: string;
  parentTitle?: string;
} | {
  flowType: OutlineFlowType;
  parentLocator: string;
  parentTitle: string;
};

interface OutlineSidebarContextData {
  currentPageKey: OutlineSidebarPageKeys;
  setCurrentPageKey: (pageKey: OutlineSidebarPageKeys) => void;
  currentFlow: OutlineFlow | null;
  startCurrentFlow: (flow: OutlineFlow) => void;
  stopCurrentFlow: () => void;
  isOpen: boolean;
  open: () => void;
  toggle: () => void;
  selectedContainerState?: SelectionState;
  openContainerInfoSidebar: (containerId: string, subsectionId?: string, sectionId?: string) => void;
  clearSelection: () => void;
}

const OutlineSidebarContext = createContext<OutlineSidebarContextData | undefined>(undefined);

export const OutlineSidebarProvider = ({ children }: { children?: React.ReactNode }) => {
  const [currentPageKey, setCurrentPageKeyState] = useStateWithUrlSearchParam<OutlineSidebarPageKeys>(
    'info',
    'sidebar',
    (value: string) => value as OutlineSidebarPageKeys,
    (value: OutlineSidebarPageKeys) => value,
  );
  const [currentFlow, setCurrentFlow] = useState<OutlineFlow | null>(null);
  const [isOpen, open, , toggle] = useToggle(true);

  /**
  * Use this to store the selected container's information and should always contain full ancestor info.
  * If selected container is a section, set containerId and sectionId to same value and subsectionId should
  * be undefined.
  * If selected container is a subsection, set containerId and subsectionId to same value and sectionId
  * should be set to its parent section id.
  * If selected container is an unit, set containerId as unitId, subsectionId as its parent subsection's id
  * and sectionId should be set to its top parent section's id.
  */
  const [selectedContainerState, setSelectedContainerState] = useState<SelectionState | undefined>();
  const { setCurrentSelection } = useCourseAuthoringContext();

  /**
  * Set currentSelection to same as selectedContainerState whenever
  * selectedContainerState or currentPageKey changes.
  * This allows us to reset the currentSelection.
  */
  useEffect(() => {
    // To allow tag buttons on other cards to jump to align page and not loose its selection
    if (currentPageKey !== 'align') {
      setCurrentSelection(selectedContainerState);
    }
  }, [currentPageKey, selectedContainerState]);

  /**
  * Stops current add content flow.
  * This will cause the sidebar to switch back to its normal state and clear out any placeholder containers.
  */
  const stopCurrentFlow = useCallback(() => {
    setCurrentFlow(null);
  }, [setCurrentFlow]);

  const setCurrentPageKey = useCallback((pageKey: OutlineSidebarPageKeys) => {
    setCurrentPageKeyState(pageKey);
    setCurrentFlow(null);
    open();
  }, [open, setCurrentFlow]);

  const openContainerInfoSidebar = useCallback((
    containerId: string,
    subsectionId?: string,
    sectionId?: string,
  ) => {
    if (isOutlineNewDesignEnabled()) {
      setSelectedContainerState({ currentId: containerId, subsectionId, sectionId });
      setCurrentPageKey('info');
    }
  }, [setSelectedContainerState, setCurrentPageKey]);

  const clearSelection = useCallback(() => {
    setSelectedContainerState(undefined);
  }, [selectedContainerState]);

  /**
  * Starts add content flow.
  * The sidebar enters an add content flow which allows user to add content in a specific container.
  * A placeholder container is added in the location when the flow is started.
  */
  const startCurrentFlow = useCallback((flow: OutlineFlow) => {
    setCurrentPageKey('add');
    setCurrentFlow(flow);
  }, [setCurrentFlow, setCurrentPageKey]);

  useEscapeClick({
    onEscape: () => {
      stopCurrentFlow();
      setSelectedContainerState(undefined);
    },
    dependency: [stopCurrentFlow],
  });

  const context = useMemo<OutlineSidebarContextData>(
    () => ({
      currentPageKey,
      setCurrentPageKey,
      currentFlow,
      startCurrentFlow,
      stopCurrentFlow,
      isOpen,
      open,
      toggle,
      selectedContainerState,
      openContainerInfoSidebar,
      clearSelection,
    }),
    [
      currentPageKey,
      setCurrentPageKey,
      currentFlow,
      startCurrentFlow,
      stopCurrentFlow,
      isOpen,
      open,
      toggle,
      selectedContainerState,
      openContainerInfoSidebar,
      clearSelection,
    ],
  );

  return (
    <OutlineSidebarContext.Provider value={context}>
      {children}
    </OutlineSidebarContext.Provider>
  );
};

export function useOutlineSidebarContext(): OutlineSidebarContextData {
  const ctx = useContext(OutlineSidebarContext);
  if (ctx === undefined) {
    /* istanbul ignore next */
    throw new Error('useOutlineSidebarContext() was used in a component without a <OutlineSidebarProvider> ancestor.');
  }
  return ctx;
}
