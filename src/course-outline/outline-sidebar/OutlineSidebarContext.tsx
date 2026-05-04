import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useToggle } from '@openedx/paragon';

import { useEscapeClick, useStateWithUrlSearchParam, useToggleWithValue } from '@src/hooks';
import { SelectionState } from '@src/data/types';
import { useCourseOutlineState } from '@src/course-outline/CourseOutlineStateContext';
import { useCourseOutlineContext } from '@src/course-outline/CourseOutlineContext';
import { ContainerType } from '@src/generic/key-utils';
import { buildSelectionState } from '@src/course-outline/state/selection';

export type OutlineSidebarPageKeys = 'help' | 'info' | 'add' | 'align';
export type OutlineFlow = {
  flowType: ContainerType;
  parentLocator: string;
  grandParentLocator?: string;
};

interface OutlineSidebarContextData {
  currentPageKey: OutlineSidebarPageKeys;
  setCurrentPageKey: (pageKey: OutlineSidebarPageKeys) => void;
  isCurrentFlowOn?: boolean;
  currentFlow?: OutlineFlow;
  startCurrentFlow: (flow: OutlineFlow) => void;
  stopCurrentFlow: () => void;
  currentTabKey?: string;
  setCurrentTabKey: (tabKey: string | undefined) => void;
  isOpen: boolean;
  open: () => void;
  toggle: () => void;
  selectedContainerState?: SelectionState;
  setSelectedContainerState: (selectedContainerState?: SelectionState) => void;
  openContainerInfoSidebar: (
    containerId: string,
    subsectionId?: string,
    sectionId?: string,
    index?: number,
  ) => void;
  /**
   * Opens the sidebar for a new container and keeps the current sidebar page
   */
  openContainerSidebar: (
    containerId: string,
    subsectionId?: string,
    sectionId?: string,
    index?: number,
  ) => void;
  clearSelection: () => void;
}

const OutlineSidebarContext = createContext<OutlineSidebarContextData | undefined>(undefined);

export const OutlineSidebarProvider = ({ children }: { children?: React.ReactNode; }) => {
  const [currentPageKey, setCurrentPageKeyState] = useStateWithUrlSearchParam<OutlineSidebarPageKeys>(
    'info',
    'sidebar',
    (value: string) => value as OutlineSidebarPageKeys,
    (value: OutlineSidebarPageKeys) => value,
  );
  const [
    isCurrentFlowOn,
    currentFlow,
    setCurrentFlow,
    stopCurrentFlow,
  ] = useToggleWithValue<OutlineFlow>();
  const [isOpen, open, , toggle] = useToggle(true);
  const [currentTabKey, setCurrentTabKey] = useState<string>();

  /**
   * Use this to store the selected container's information and should always contain full ancestor info.
   * If selected container is a section, set containerId and sectionId to same value and subsectionId should
   * be undefined.
   * If selected container is a subsection, set containerId and subsectionId to same value and sectionId
   * should be set to its parent section id.
   * If selected container is an unit, set containerId as unitId, subsectionId as its parent subsection's id
   * and sectionId should be set to its top parent section's id.
   */
  const {
    currentSelection: selectedContainerState,
    selectContainer: setSelectedContainerState,
    clearSelection,
    openContainerInfo,
  } = useCourseOutlineState();
  const { setCurrentSelection } = useCourseOutlineContext();

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
  }, [currentPageKey, selectedContainerState, setCurrentSelection]);

  const setCurrentPageKey = useCallback((pageKey: OutlineSidebarPageKeys) => {
    setCurrentPageKeyState(pageKey);
    // Reset tab
    setCurrentTabKey(undefined);
    stopCurrentFlow();
    open();
  }, [open, stopCurrentFlow]);

  const openContainerInfoSidebar = useCallback((
    containerId: string,
    subsectionId?: string,
    sectionId?: string,
    index?: number,
  ) => {
    openContainerInfo(containerId, subsectionId, sectionId, index);
    setCurrentPageKey('info');
  }, [openContainerInfo, setCurrentPageKey]);

  const openContainerSidebar = useCallback((
    containerId: string,
    subsectionId?: string,
    sectionId?: string,
    index?: number,
  ) => {
    setSelectedContainerState(buildSelectionState({
      currentId: containerId,
      subsectionId,
      sectionId,
      index,
    }));
  }, [setSelectedContainerState]);

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
      clearSelection();
    },
    dependency: [stopCurrentFlow, clearSelection],
  });

  const context = useMemo<OutlineSidebarContextData>(
    () => ({
      currentPageKey,
      setCurrentPageKey,
      isCurrentFlowOn,
      currentFlow,
      startCurrentFlow,
      stopCurrentFlow,
      currentTabKey,
      setCurrentTabKey,
      isOpen,
      open,
      toggle,
      selectedContainerState,
      setSelectedContainerState,
      openContainerInfoSidebar,
      openContainerSidebar,
      clearSelection,
    }),
    [
      currentPageKey,
      setCurrentPageKey,
      isCurrentFlowOn,
      currentFlow,
      startCurrentFlow,
      stopCurrentFlow,
      currentTabKey,
      setCurrentTabKey,
      isOpen,
      open,
      toggle,
      selectedContainerState,
      setSelectedContainerState,
      openContainerInfoSidebar,
      openContainerSidebar,
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
