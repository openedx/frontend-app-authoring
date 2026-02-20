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
import { SelectionState, XBlock } from '@src/data/types';
import { useCourseAuthoringContext } from '@src/CourseAuthoringContext';
import { useCourseItemData } from '@src/course-outline/data/apiHooks';
import { useSelector } from 'react-redux';
import { getSectionsList } from '@src/course-outline/data/selectors';
import { findLast, findLastIndex } from 'lodash';
import { ContainerType } from '@src/generic/key-utils';
import { isOutlineNewDesignEnabled } from '../utils';

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
  isOpen: boolean;
  open: () => void;
  toggle: () => void;
  selectedContainerState?: SelectionState;
  setSelectedContainerState: (selectedContainerState?: SelectionState) => void;
  openContainerInfoSidebar: (containerId: string, subsectionId?: string, sectionId?: string) => void;
  clearSelection: () => void;
  /** Stores last section that allows adding subsections inside it. */
  lastEditableSection?: XBlock;
  /** Stores last subsection that allows adding units inside it and its parent sectionId */
  lastEditableSubsection?: { data?: XBlock, sectionId?: string };
  /** XBlock data of selectedContainerState.currentId */
  currentItemData?: XBlock;
}

const OutlineSidebarContext = createContext<OutlineSidebarContextData | undefined>(undefined);

const getLastEditableItem = (blockList: Array<XBlock>) => findLast(blockList, (item) => item.actions.childAddable);

const getLastEditableSubsection = (
  blockList: Array<XBlock>,
  startIndex?: number,
): { data: XBlock, sectionId: string } | undefined => {
  const lastSectionIndex = findLastIndex(blockList, (item) => item.actions.childAddable, startIndex);
  if (lastSectionIndex !== -1) {
    const lastSubsectionIndex = findLastIndex(
      blockList[lastSectionIndex].childInfo.children,
      (item) => item.actions.childAddable,
    );
    if (lastSubsectionIndex !== -1) {
      return {
        data: blockList[lastSectionIndex].childInfo.children[lastSubsectionIndex],
        sectionId: blockList[lastSectionIndex].id,
      };
    }
    if (lastSectionIndex > 0) {
      return getLastEditableSubsection(blockList, lastSectionIndex - 1);
    }
  }
  return undefined;
};

export const OutlineSidebarProvider = ({ children }: { children?: React.ReactNode }) => {
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

  const setCurrentPageKey = useCallback((pageKey: OutlineSidebarPageKeys) => {
    setCurrentPageKeyState(pageKey);
    stopCurrentFlow();
    open();
  }, [open, stopCurrentFlow]);

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

  const { data: currentItemData } = useCourseItemData<XBlock>(selectedContainerState?.currentId);
  const sectionsList = useSelector(getSectionsList);

  /** Stores last section that allows adding subsections inside it. */
  const lastEditableSection = useMemo(() => {
    if (currentItemData?.category === 'chapter' && currentItemData.actions.childAddable) {
      return currentItemData;
    }
    return currentItemData ? undefined : getLastEditableItem(sectionsList);
  }, [currentItemData, sectionsList]);

  /** Stores last subsection that allows adding units inside it. */
  const lastEditableSubsection = useMemo(() => {
    if (currentItemData?.category === 'sequential' && currentItemData.actions.childAddable) {
      return { data: currentItemData, sectionId: selectedContainerState?.sectionId };
    }
    if (currentItemData?.category === 'chapter') {
      return {
        data: getLastEditableItem(currentItemData?.childInfo.children || []),
        sectionId: selectedContainerState?.currentId,
      };
    }
    return currentItemData ? undefined : getLastEditableSubsection(sectionsList);
  }, [currentItemData, sectionsList, selectedContainerState]);

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
      isCurrentFlowOn,
      currentFlow,
      startCurrentFlow,
      stopCurrentFlow,
      isOpen,
      open,
      toggle,
      selectedContainerState,
      setSelectedContainerState,
      openContainerInfoSidebar,
      clearSelection,
      lastEditableSection,
      lastEditableSubsection,
      currentItemData,
    }),
    [
      currentPageKey,
      setCurrentPageKey,
      isCurrentFlowOn,
      currentFlow,
      startCurrentFlow,
      stopCurrentFlow,
      isOpen,
      open,
      toggle,
      selectedContainerState,
      setSelectedContainerState,
      openContainerInfoSidebar,
      clearSelection,
      lastEditableSection,
      lastEditableSubsection,
      currentItemData,
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
